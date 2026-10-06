/* ============================================================================
 * api/util.js —— 后端公共工具（加密、校验、脱敏）
 * 这个文件同时被 Cloudflare Pages Functions 和本地开发服务器使用。
 * ==========================================================================*/

/* 联系方式加密用的密钥，必须和前端 assets/js/core/util.js 里的 OBF_KEY 一致 */
export const OBF_KEY = 'enpo-xjtu-2026';

/* ------------------------------ 联系方式加密 ------------------------------ */
export function obfuscate(plain) {
  if (!plain) return '';
  let x = '';
  for (let i = 0; i < plain.length; i++) {
    x += String.fromCharCode(plain.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length));
  }
  const reversed = x.split('').reverse().join('');
  const bytes = new TextEncoder().encode(reversed);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/* ------------------------------ SHA-256 ------------------------------ */
export async function sha256Hex(text) {
  const data = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ------------------------------ 随机字符串 ------------------------------ */
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function randomCode(len = 8) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let s = '';
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return s;
}

export function randomId(prefix = 'id_') {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return prefix + Date.now().toString(36) + '_' + hex;
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------ 输入清洗 ------------------------------ */
/** 去掉控制字符、压缩首尾空白、限制长度 */
export function cleanText(value, maxLen) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // 去掉不可见控制字符（保留换行）
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = s.replace(/\r\n?/g, '\n');
  s = s.trim();
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function cleanList(value, { maxItems = 60, maxLen = 120 } = {}) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const s = cleanText(item, maxLen);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function isQQ(value) {
  return /^\d{5,12}$/.test(String(value || '').trim());
}

/* ------------------------------ 响应助手 ------------------------------ */
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

export function fail(message, status = 400, code = '') {
  return json({ ok: false, error: message, code }, status);
}

export function ok(data = {}) {
  return json({ ok: true, ...data });
}

/* ------------------------------ 其它 ------------------------------ */
/** 取客户端 IP（Cloudflare 会带上 CF-Connecting-IP） */
export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Real-IP')
    || (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim()
    || 'local';
}

/** 简单的机器人特征判断（在服务端再做一层） */
export function looksLikeBot(request) {
  const ua = (request.headers.get('User-Agent') || '').toLowerCase();
  if (!ua) return true;
  const bad = ['curl', 'wget', 'python-requests', 'python-urllib', 'scrapy', 'httpclient',
    'go-http-client', 'java/', 'okhttp', 'axios', 'node-fetch', 'headlesschrome',
    'phantomjs', 'puppeteer', 'playwright', 'bot', 'spider', 'crawler', 'scraper'];
  return bad.some((k) => ua.includes(k));
}

/**
 * 同源校验：正常的浏览器表单提交一定会带 Origin（或至少 Referer）。
 * 直接拿 curl 调接口的一般没有，或者是别的站点。
 */
export function sameOriginOk(request, env) {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  // 有些运行环境不会把 Host 作为请求头暴露出来，这时就用请求地址里的主机名兜底。
  // 这不影响安全性：Origin 仍然必须和请求本身的地址一致。
  let host = request.headers.get('Host') || '';
  if (!host) {
    try { host = new URL(request.url).host; } catch (e) { host = ''; }
  }
  const source = origin || referer || '';
  if (!source) return env && env.ALLOW_NO_ORIGIN === '1';
  try {
    const u = new URL(source);
    if (u.host === host) return true;
    if (env && env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN.split(',').map((x) => x.trim()).includes(u.origin)) return true;
    // 本地开发：用 file:// 打开时 Origin 是 "null"
    if (u.origin === 'null' && env && env.DEV === '1') return true;
    return false;
  } catch (e) {
    return false;
  }
}

export async function readJson(request, maxBytes = 64 * 1024) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > maxBytes) throw new Error('内容太大了');
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('内容太大了');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('数据格式不正确');
  }
}
