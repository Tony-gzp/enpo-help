/* ============================================================================
 * tools/dev-server.mjs —— 本地开发服务器（同时提供网页和接口）
 * ----------------------------------------------------------------------------
 * 用法（在网站根目录执行）：
 *     node tools/dev-server.mjs
 * 然后浏览器打开 http://localhost:8788
 *
 * 它做两件事：
 *   1. 像普通静态服务器一样把网站文件发出去
 *   2. 把 /api/xxx 的请求交给 api/router.js（用的是真实的 SQLite 数据库）
 *
 * 数据库文件在 tools/_dev/data.db，删掉它就会重新初始化。
 * ==========================================================================*/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleApi } from '../api/router.js';
import { createLocalD1 } from '../api/d1-local.js';
import { createStore, migrate } from '../api/store.js';
import { SCHEMA_SQL } from '../api/schema.js';
import { SEED_BOOKS } from '../api/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEV_DIR = path.join(__dirname, '_dev');
const DB_FILE = path.join(DEV_DIR, 'data.db');
const CONFIG_FILE = path.join(DEV_DIR, 'config.json');

/* ------------------------------ 运行配置 ------------------------------ */
fs.mkdirSync(DEV_DIR, { recursive: true });

let localConfig = {};
if (fs.existsSync(CONFIG_FILE)) {
  try {
    localConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    console.warn('tools/_dev/config.json 格式有问题，已忽略。');
  }
}

const env = {
  DB: createLocalD1(DB_FILE),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || localConfig.adminPassword || 'enpo-admin-2026',
  ADMIN_SALT: process.env.ADMIN_SALT || localConfig.adminSalt || 'enpo-2026-xjtu',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  ADMIN_SESSION_HOURS: '12',
  ADMIN_MAX_ATTEMPTS: '5',
  ADMIN_LOCK_MINUTES: '10',
  RATE_BOOK_PER_HOUR: '30',
  RATE_SUGGEST_PER_HOUR: '20',
  RATE_LOOKUP_PER_HOUR: '200',
  TURNSTILE_SECRET: '',
  DEV: '1',
  ALLOWED_ORIGIN: ''
};

/* ------------------------------ 初始化数据库 ------------------------------ */
await migrate(env.DB, SCHEMA_SQL);
const store = createStore(env.DB);
const seeded = await store.seedIfEmpty(SEED_BOOKS);
const stats = await store.listBooks({});

/* ------------------------------ MIME ------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.woff2': 'font/woff2'
};

/* ------------------------------ 请求处理 ------------------------------ */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  /* ---- 接口 ---- */
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;

      const request = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
        duplex: 'half'
      });
      const response = await handleApi(request, env);
      const text = await response.text();
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      res.end(text);
    } catch (e) {
      console.error('[api error]', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: '服务器内部错误：' + e.message }));
    }
    return;
  }

  /* ---- 静态文件 ---- */
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';

  const target = path.join(ROOT, path.normalize(pathname).replace(/^([/\\])+/, ''));
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end('403');
    return;
  }

  fs.stat(target, (err, st) => {
    if (err || !st.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      if (fs.existsSync(notFound)) {
        res.writeHead(404, { 'Content-Type': MIME['.html'] });
        fs.createReadStream(notFound).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
      return;
    }
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(target).pipe(res);
  });
});

/* ------------------------------ 启动 ------------------------------ */
const BASE_PORT = Number(process.env.PORT || 8788);
let port = BASE_PORT;

function listen(p) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && p < BASE_PORT + 10) {
      console.log(`端口 ${p} 被占用了，换 ${p + 1} 试试…`);
      listen(p + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
  server.listen(p, '127.0.0.1', () => {
    console.log('');
    console.log('  ┌──────────────────────────────────────────────────────────┐');
    console.log('  │  能动本科生互助站 · 本地开发服务器                       │');
    console.log('  └──────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('  网站地址：http://localhost:' + p);
    console.log('  后台地址：http://localhost:' + p + '/admin.html');
    console.log('  后台口令：' + (env.ADMIN_PASSWORD_HASH ? '（使用哈希校验）' : env.ADMIN_PASSWORD));
    console.log('');
    console.log('  数据库文件：tools/_dev/data.db');
    console.log('  当前教材条数：' + stats.length + (seeded ? '（本次导入了 ' + seeded + ' 条初始数据）' : ''));
    console.log('');
    console.log('  按 Ctrl + C 停止服务器');
    console.log('');
  });
}
listen(port);
