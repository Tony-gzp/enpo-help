/* ============================================================================
 * tools/worker-test.mjs —— 验证 Cloudflare Worker 入口能正常工作
 * ----------------------------------------------------------------------------
 * 用法（在网站根目录执行）：
 *     node tools/worker-test.mjs
 *
 * 它会在本机用内存数据库模拟 Cloudflare 的运行环境，
 * 直接调用 worker/index.js（也就是部署到线上后真正执行的那个文件），
 * 检查：自动建表、自动导入初始数据、接口可用、404 页面正常。
 *
 * 这个测试不需要联网，也不需要启动开发服务器。
 * ==========================================================================*/
import worker from '../worker/index.js';
import { createLocalD1 } from '../api/d1-local.js';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) { pass++; console.log('  \u2705 ' + name); }
  else { fail++; failures.push(name); console.log('  \u274c ' + name + (detail ? '   → ' + detail : '')); }
}

/* 模拟 Cloudflare 的环境：一个内存数据库 + 静态资源 */
function pathOf(input) {
  if (input instanceof URL) return input.pathname;
  if (typeof input === 'string') return new URL(input).pathname;
  return new URL(input.url).pathname;
}

const env = {
  DB: createLocalD1(':memory:'),
  ASSETS: {
    async fetch(input) {
      const pathname = pathOf(input);
      if (pathname === '/404.html') {
        return new Response('<html>自定义404页面</html>', {
          status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new Response('not found', { status: 404 });
    }
  },
  ADMIN_PASSWORD: 'test-password',
  DEV: '0',
  RATE_BOOK_PER_HOUR: '30'
};

function call(path, options = {}) {
  const headers = { 'User-Agent': BROWSER_UA, Origin: 'https://example.com', ...(options.headers || {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  return worker.fetch(new Request('https://example.com' + path, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  }), env);
}

async function json(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return { __raw: text.slice(0, 200) }; }
}

console.log('\n=== 1. Worker 入口基本功 ===');
{
  const res = await call('/api/health');
  const data = await json(res);
  check('GET /api/health 正常', res.status === 200 && data.ok === true, JSON.stringify(data));
  check('返回的服务名正确', data.service === 'enpo-api', JSON.stringify(data));
}

console.log('\n=== 2. 第一次请求自动建表 + 导入初始数据 ===');
{
  const res = await call('/api/books');
  const data = await json(res);
  check('GET /api/books 正常', res.status === 200 && Array.isArray(data.books), JSON.stringify(data).slice(0, 120));
  check('自动导入了 82 条初始数据', (data.books || []).length === 82, '实际 ' + (data.books || []).length);
  const b = (data.books || [])[0];
  check('数据字段完整（terms/books/status）',
    !!b && Array.isArray(b.terms) && Array.isArray(b.books) && !!b.status);
  check('不包含编辑码哈希', !!b && !('editCodeHash' in b));
  check('QQ 号是加密存储的', !!b && !!b.qqBlob && !/^\d+$/.test(b.qqBlob));
}

console.log('\n=== 3. 提交与审核流程 ===');
let bookId = null;
let editCode = null;
{
  const res = await call('/api/books', {
    method: 'POST',
    body: {
      qq: '123456789', major: '能动A模块', terms: ['大一上'],
      books: ['工科数学分析基础（上册）'], status: 'no', note: 'Worker 测试数据',
      startedAt: Date.now() - 9000, website: ''
    }
  });
  const data = await json(res);
  check('提交出书信息成功', res.status === 200 && !!data.id && !!data.editCode, JSON.stringify(data).slice(0, 140));
  bookId = data.id;
  editCode = data.editCode;
}
{
  const res = await call('/api/admin/login', { method: 'POST', body: { password: 'test-password' } });
  const data = await json(res);
  check('站主登录成功', res.status === 200 && !!data.token, JSON.stringify(data).slice(0, 120));
  const token = data.token;

  const r2 = await call('/api/admin/books', { headers: { Authorization: 'Bearer ' + token } });
  const d2 = await json(r2);
  check('后台能看到待审核的条目', (d2.books || []).some((x) => x.id === bookId));

  const r3 = await call('/api/books/' + bookId + '/update', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token },
    body: { review: 'approved' }
  });
  const d3 = await json(r3);
  check('站主可以通过审核', r3.status === 200 && d3.book && d3.book.review === 'approved');

  const r4 = await call('/api/books/' + bookId + '/update', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token },
    body: { status: 'yes' }
  });
  const d4 = await json(r4);
  check('站主改不动「是否已出」', r4.status === 403 && d4.code === 'STATUS_LOCKED', JSON.stringify(d4));

  const r5 = await call('/api/books/' + bookId + '/update', {
    method: 'POST', body: { editCode, status: 'yes' }
  });
  const d5 = await json(r5);
  check('发布者本人可以改「是否已出」', r5.status === 200 && d5.book && d5.book.status === 'yes');

  const r6 = await call('/api/books/' + bookId + '/delete', { method: 'POST', body: { editCode } });
  check('发布者本人可以删除', r6.status === 200);

  const r7 = await call('/api/books');
  const d7 = await json(r7);
  check('删除后公开列表回到 82 条', (d7.books || []).length === 82, '实际 ' + (d7.books || []).length);
}

console.log('\n=== 4. 防机器人（Worker 环境下同样生效）===');
{
  const r1 = await call('/api/books', {
    method: 'POST', headers: { 'User-Agent': 'python-requests/2.31' },
    body: { qq: '123456789', major: 'x', terms: ['大一上'], books: ['x'], startedAt: Date.now() - 9000 }
  });
  check('机器人 UA 被拦截', r1.status === 403, 'HTTP ' + r1.status);

  const r2 = await call('/api/books', {
    method: 'POST', headers: { Origin: 'https://evil.example' },
    body: { qq: '123456789', major: 'x', terms: ['大一上'], books: ['x'], startedAt: Date.now() - 9000 }
  });
  check('跨站提交被拦截', r2.status === 403, 'HTTP ' + r2.status);

  const r3 = await call('/api/books', {
    method: 'POST',
    body: { qq: '123456789', major: 'x', terms: ['大一上'], books: ['x'], startedAt: Date.now(), website: '' }
  });
  check('提交过快被拦截', r3.status === 400, 'HTTP ' + r3.status);
}

console.log('\n=== 5. 静态资源与 404 ===');
{
  const res = await worker.fetch(new Request('https://example.com/不存在的页面'), env);
  const text = await res.text();
  check('未匹配到静态文件时返回自定义 404 页面', res.status === 404 && text.includes('自定义404页面'),
    'HTTP ' + res.status);
}

console.log('\n' + '='.repeat(60));
console.log(`Worker 入口测试结果：通过 ${pass} 项，失败 ${fail} 项`);
if (fail) console.log('失败项：' + failures.join(' / '));
console.log('='.repeat(60) + '\n');
process.exit(fail === 0 ? 0 : 1);
