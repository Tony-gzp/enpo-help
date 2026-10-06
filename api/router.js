/* ============================================================================
 * api/router.js —— 所有接口的逻辑
 * ----------------------------------------------------------------------------
 * 前端（assets/js/core/store.js）会调用这里的接口。
 * 所有校验都在服务端再做一遍：即使有人绕过网页直接调接口，规则依然生效。
 *
 * 接口一览：
 *   GET    /api/health                      健康检查（前端用它判断是否在线模式）
 *   GET    /api/content?keys=faq,links      读取站主改过的内容（公开）
 *   GET    /api/books                       审核通过的教材列表（公开）
 *   POST   /api/books                       提交一本（待审核）
 *   POST   /api/books/lookup                用 ID + 编辑码取回自己的记录
 *   POST   /api/books/:id/update            修改（本人凭编辑码 / 站主凭令牌）
 *   POST   /api/books/:id/delete            删除（同上）
 *   POST   /api/suggestions                 提交建议（匿名）
 *   POST   /api/admin/login                 登录
 *   POST   /api/admin/logout                退出
 *   GET    /api/admin/check                 检查登录状态
 *   GET    /api/admin/books                 全部教材（含待审核）
 *   GET    /api/admin/suggestions           全部建议
 *   POST   /api/admin/suggestions/:id       修改建议
 *   DELETE /api/admin/suggestions/:id       删除建议
 *   PUT    /api/admin/content/:key          覆盖某个内容块（改完立即对所有人生效）
 *   DELETE /api/admin/content/:key          恢复成 data/*.js 里的默认内容
 *   POST   /api/admin/reset-seed            清空示例数据
 * ==========================================================================*/
import { createStore } from './store.js';
import {
  cleanList, cleanText, clientIp, fail, isQQ, json, looksLikeBot, obfuscate,
  ok, randomCode, randomId, randomToken, readJson, sameOriginOk, sha256Hex
} from './util.js';

const CONTENT_KEYS = ['site', 'nav', 'faq', 'links', 'generalEdu', 'plans', 'bookOptions', 'iconSet'];
const STATUS_VALUES = ['no', 'contacting', 'partial', 'yes', 'unknown'];

/* ------------------------------ 验证码（可选） ------------------------------ */
async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET) return { ok: true, skipped: true };
  if (!token) return { ok: false, error: '请先完成人机验证' };
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  body.append('remoteip', clientIp(request));
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body
  });
  const data = await res.json().catch(() => ({}));
  return data.success ? { ok: true } : { ok: false, error: '人机验证未通过，请重试' };
}

/* ------------------------------ 权限 ------------------------------ */
async function requireAdmin(request, store) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  return store.getSession(token);
}

/* ------------------------------ 数据整形 ------------------------------ */
function publicBook(book) {
  // 对外输出的字段：绝不包含 editCodeHash / reviewNote
  const { editCodeHash, reviewNote, ...rest } = book;
  return rest;
}

function adminBook(book) {
  const { editCodeHash, ...rest } = book;
  return { ...rest, hasEditCode: !!editCodeHash };
}

/* ------------------------------ 主入口 ------------------------------ */
export async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();

  const store = createStore(env.DB);

  /* ---- 预检 ---- */
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  /* ---- 健康检查 ---- */
  if (path === '/health') {
    return ok({ service: 'enpo-api', time: Date.now(), turnstile: !!env.TURNSTILE_SECRET });
  }

  /* ---- 仅本地开发可用：重置频率限制，方便反复跑测试 ---- */
  if (path === '/dev/reset' && method === 'POST' && env.DEV === '1') {
    await store.clearRateLimits();
    return ok({ reset: true });
  }
  if (path === '/dev/seed' && method === 'POST' && env.DEV === '1') {
    const body = await readJson(request, 1024 * 1024);
    const n = await store.seedIfEmpty(body.books || []);
    return ok({ seeded: n });
  }

  const isAdminPath = path.startsWith('/admin');

  /* ---- 基础防护：明显的机器人直接拒绝 ---- */
  if (!isAdminPath && looksLikeBot(request)) {
    return fail('请求被拒绝：检测到非浏览器访问。', 403, 'BOT');
  }

  /* ---- 同源校验（写操作必须带 Origin/Referer） ---- */
  const isWrite = method !== 'GET' && method !== 'HEAD';
  if (isWrite && !path.startsWith('/admin/login') && !sameOriginOk(request, env)) {
    return fail('请求来源不被允许。', 403, 'ORIGIN');
  }

  try {
    /* ==================================================================
     * 内容
     * ================================================================*/
    if (path === '/content' && method === 'GET') {
      const keysParam = url.searchParams.get('keys');
      const keys = keysParam
        ? keysParam.split(',').map((k) => k.trim()).filter((k) => CONTENT_KEYS.includes(k))
        : CONTENT_KEYS;
      const data = await store.listContent(keys);
      return json({ ok: true, content: data }, 200, { 'Cache-Control': 'no-store' });
    }

    /* ==================================================================
     * 二手教材
     * ================================================================*/
    if (path === '/books' && method === 'GET') {
      const books = await store.listBooks({ review: 'approved' });
      return json({ ok: true, books: books.map(publicBook) }, 200, { 'Cache-Control': 'no-store' });
    }

    if (path === '/books' && method === 'POST') {
      const ip = clientIp(request);
      // 注意：校园网常常整个校区共用一个出口 IP，所以这个上限不能设得太小，
      // 否则会误伤同学。默认 30 次/小时，站主可以按实际情况调整。
      const rl = await store.rateLimit('book:' + ip, Number(env.RATE_BOOK_PER_HOUR || 30), 3600 * 1000);
      if (!rl.allowed) {
        return fail('提交太频繁了，请等 ' + Math.ceil(rl.retryAfterMs / 60000) + ' 分钟后再试。', 429, 'RATE');
      }

      const body = await readJson(request, 32 * 1024);

      // 蜜罐：真人看不到这个字段，填了就是机器人
      if (body.website) return fail('提交未通过安全检查。', 400, 'HONEYPOT');

      // 时间陷阱：从打开页面到提交太快
      const elapsed = Date.now() - Number(body.startedAt || 0);
      if (!body.startedAt || elapsed < 4000) {
        return fail('填写得太快了，请检查内容后再提交。', 400, 'TOO_FAST');
      }
      if (elapsed > 12 * 3600 * 1000) {
        return fail('页面打开太久了，请刷新后重新填写。', 400, 'TOO_OLD');
      }

      const turn = await verifyTurnstile(request, env, body.turnstileToken);
      if (!turn.ok) return fail(turn.error, 400, 'TURNSTILE');

      const qq = cleanText(body.qq, 20).replace(/\s/g, '');
      if (!isQQ(qq)) return fail('请填写正确的 QQ 号（5～12 位数字）。', 400, 'QQ');

      const major = cleanText(body.major, 40);
      const terms = cleanList(body.terms, { maxItems: 14, maxLen: 24 });
      const books = cleanList(body.books, { maxItems: 60, maxLen: 120 });
      const note = cleanText(body.note, 1500);
      let status = cleanText(body.status, 20);
      if (!STATUS_VALUES.includes(status)) status = 'no';

      if (!major) return fail('请选择专业。', 400, 'MAJOR');
      if (!terms.length) return fail('请至少选择一个出的年级或类型。', 400, 'TERMS');
      if (!books.length && !note) return fail('请至少选择一本书，或在备注里说明有哪些书。', 400, 'BOOKS');

      const editCode = randomCode(8);
      const now = Date.now();
      const doc = {
        id: randomId('bk_'),
        createdAt: now,
        updatedAt: now,
        qqBlob: obfuscate(qq),
        major,
        terms,
        books,
        status,
        note,
        review: 'pending',
        reviewNote: '',
        needsReview: false,
        reviewedAt: null,
        editCodeHash: await sha256Hex(editCode),
        origin: 'user'
      };
      await store.insertBook(doc);
      return ok({ id: doc.id, editCode });
    }

    if (path === '/books/lookup' && method === 'POST') {
      const ip = clientIp(request);
      const rl = await store.rateLimit('lookup:' + ip, Number(env.RATE_LOOKUP_PER_HOUR || 200), 3600 * 1000);
      if (!rl.allowed) return fail('查询太频繁了，请稍后再试。', 429, 'RATE');

      const body = await readJson(request, 8 * 1024);
      const id = cleanText(body.id, 60);
      const code = cleanText(body.editCode, 20).toUpperCase();
      const book = await store.getBookRaw(id);
      if (!book) return fail('找不到这条记录，可能已经被删除了。', 404, 'NOT_FOUND');
      if (!book.editCodeHash || (await sha256Hex(code)) !== book.editCodeHash) {
        return fail('编辑码不正确。', 403, 'BAD_CODE');
      }
      return ok({ book: publicBook(book) });
    }

    const bookAction = path.match(/^\/books\/([^/]+)\/(update|delete)$/);
    if (bookAction && method === 'POST') {
      const id = decodeURIComponent(bookAction[1]);
      const action = bookAction[2];
      const body = await readJson(request, 32 * 1024);
      const book = await store.getBookRaw(id);
      if (!book) return fail('找不到这条记录，可能已经被删除了。', 404, 'NOT_FOUND');

      const session = await requireAdmin(request, store);
      const isOwner = !!session;

      if (!isOwner) {
        // 发布者本人：必须带正确的编辑码
        const ip = clientIp(request);
        const rl = await store.rateLimit('edit:' + ip, 40, 3600 * 1000);
        if (!rl.allowed) return fail('操作太频繁了，请稍后再试。', 429, 'RATE');

        const code = cleanText(body.editCode, 20).toUpperCase();
        if (!book.editCodeHash || (await sha256Hex(code)) !== book.editCodeHash) {
          return fail('编辑码不正确。', 403, 'BAD_CODE');
        }
      }

      if (action === 'delete') {
        await store.deleteBook(id);
        return ok({ deleted: true });
      }

      /* ---- 修改 ---- */
      const patch = {};
      let contentChanged = false;

      if (isOwner) {
        // 站主：可以改内容、审核状态，但改不了「是否已出」
        if (body.qq !== undefined) {
          const qq = cleanText(body.qq, 20).replace(/\s/g, '');
          if (!isQQ(qq)) return fail('QQ 号格式不正确。', 400, 'QQ');
          const blob = obfuscate(qq);
          if (blob !== book.qqBlob) { patch.qqBlob = blob; contentChanged = true; }
        }
        if (body.major !== undefined) {
          const v = cleanText(body.major, 40);
          if (v !== book.major) { patch.major = v; contentChanged = true; }
        }
        if (body.terms !== undefined) {
          patch.terms = cleanList(body.terms, { maxItems: 14, maxLen: 24 });
          contentChanged = true;
        }
        if (body.books !== undefined) {
          patch.books = cleanList(body.books, { maxItems: 60, maxLen: 120 });
          contentChanged = true;
        }
        if (body.note !== undefined) {
          const v = cleanText(body.note, 1500);
          if (v !== book.note) { patch.note = v; contentChanged = true; }
        }
        if (body.review !== undefined) {
          const rv = cleanText(body.review, 20);
          if (!['pending', 'approved', 'rejected'].includes(rv)) return fail('审核状态不合法。', 400, 'REVIEW');
          patch.review = rv;
          patch.reviewedAt = Date.now();
          if (rv === 'approved') patch.needsReview = false;
        }
        if (body.reviewNote !== undefined) patch.reviewNote = cleanText(body.reviewNote, 300);
        if (body.needsReview !== undefined) patch.needsReview = !!body.needsReview;
        // 注意：站主传 status 也会被忽略（服务端不放进 patch）
        if (body.status !== undefined && !patch.review) {
          // 明确告知：状态只有发布者本人能改
          if (cleanText(body.status, 20) !== book.status) {
            return fail('「是否已出」这个状态只能由发布者本人修改。', 403, 'STATUS_LOCKED');
          }
        }
      } else {
        // 发布者本人：可以改内容和「是否已出」，但改不了审核状态
        if (body.qq !== undefined) {
          const qq = cleanText(body.qq, 20).replace(/\s/g, '');
          if (!isQQ(qq)) return fail('QQ 号格式不正确。', 400, 'QQ');
          const blob = obfuscate(qq);
          if (blob !== book.qqBlob) { patch.qqBlob = blob; contentChanged = true; }
        }
        if (body.status !== undefined) {
          const st = cleanText(body.status, 20);
          if (!STATUS_VALUES.includes(st)) return fail('状态不合法。', 400, 'STATUS');
          if (st !== book.status) patch.status = st;
        }
        if (body.major !== undefined) {
          const v = cleanText(body.major, 40);
          if (v !== book.major) { patch.major = v; contentChanged = true; }
        }
        if (body.terms !== undefined) {
          const t = cleanList(body.terms, { maxItems: 14, maxLen: 24 });
          if (JSON.stringify(t) !== JSON.stringify(book.terms)) { patch.terms = t; contentChanged = true; }
        }
        if (body.books !== undefined) {
          const b = cleanList(body.books, { maxItems: 60, maxLen: 120 });
          if (JSON.stringify(b) !== JSON.stringify(book.books)) { patch.books = b; contentChanged = true; }
        }
        if (body.note !== undefined) {
          const v = cleanText(body.note, 1500);
          if (v !== book.note) { patch.note = v; contentChanged = true; }
        }
        // 改动内容后需要站主再看一眼
        if (contentChanged) patch.needsReview = true;
      }

      patch.updatedAt = Date.now();
      await store.updateBook(id, patch);
      const updated = await store.getBookRaw(id);
      return ok({ book: publicBook(updated) });
    }

    /* ==================================================================
     * 意见建议（全匿名，不保存任何联系方式）
     * ================================================================*/
    if (path === '/suggestions' && method === 'POST') {
      const ip = clientIp(request);
      const rl = await store.rateLimit('suggest:' + ip, Number(env.RATE_SUGGEST_PER_HOUR || 20), 3600 * 1000);
      if (!rl.allowed) {
        return fail('提交太频繁了，请等 ' + Math.ceil(rl.retryAfterMs / 60000) + ' 分钟后再试。', 429, 'RATE');
      }

      const body = await readJson(request, 16 * 1024);
      if (body.website) return fail('提交未通过安全检查。', 400, 'HONEYPOT');
      const elapsed = Date.now() - Number(body.startedAt || 0);
      if (!body.startedAt || elapsed < 4000) return fail('填写得太快了，请检查内容后再提交。', 400, 'TOO_FAST');

      const turn = await verifyTurnstile(request, env, body.turnstileToken);
      if (!turn.ok) return fail(turn.error, 400, 'TURNSTILE');

      const content = cleanText(body.content, 2000);
      if (content.length < 5) return fail('请至少写 5 个字，方便站主理解你的意思。', 400, 'CONTENT');

      const doc = {
        id: randomId('sg_'),
        createdAt: Date.now(),
        category: cleanText(body.category, 40) || '其他',
        content,
        page: cleanText(body.page, 200),
        handled: false,
        adminReply: ''
      };
      await store.insertSuggestion(doc);
      return ok({ id: doc.id });
    }

    /* ==================================================================
     * 后台
     * ================================================================*/
    if (path === '/admin/login' && method === 'POST') {
      const ip = clientIp(request);
      const state = await store.getLoginState(ip);
      if (state.lockedUntil > Date.now()) {
        return fail('尝试次数过多，请等 ' + Math.ceil((state.lockedUntil - Date.now()) / 60000) + ' 分钟后再试。', 429, 'LOCKED');
      }

      const rl = await store.rateLimit('login:' + ip, 20, 10 * 60 * 1000);
      if (!rl.allowed) return fail('尝试过于频繁，请稍后再试。', 429, 'RATE');

      const body = await readJson(request, 4 * 1024);
      const password = cleanText(body.password, 200);
      const expected = env.ADMIN_PASSWORD || '';
      const salt = env.ADMIN_SALT || '';

      if (!expected) {
        return fail('后台还没有设置口令。请先在部署配置里设置 ADMIN_PASSWORD。', 500, 'NO_PASSWORD');
      }

      let okLogin = false;
      if (env.ADMIN_PASSWORD_HASH) {
        // 推荐方式：只保存哈希，不保存明文
        okLogin = (await sha256Hex(salt + password)) === env.ADMIN_PASSWORD_HASH;
      } else {
        okLogin = timingSafeEqual(password, expected);
      }

      if (!okLogin) {
        const fails = state.fails + 1;
        const maxFails = Number(env.ADMIN_MAX_ATTEMPTS || 5);
        if (fails >= maxFails) {
          await store.setLoginState(ip, 0, Date.now() + Number(env.ADMIN_LOCK_MINUTES || 10) * 60000);
          return fail('口令错误次数过多，已锁定 ' + Number(env.ADMIN_LOCK_MINUTES || 10) + ' 分钟。', 429, 'LOCKED');
        }
        await store.setLoginState(ip, fails, 0);
        return fail('口令不正确，还可以尝试 ' + (maxFails - fails) + ' 次。', 401, 'BAD_PASSWORD');
      }

      await store.setLoginState(ip, 0, 0);
      const token = randomToken();
      const ttl = Number(env.ADMIN_SESSION_HOURS || 12) * 3600 * 1000;
      const expiresAt = await store.createSession(token, ttl);
      return ok({ token, expiresAt });
    }

    /* ---- 以下都需要登录 ---- */
    if (isAdminPath) {
      const session = await requireAdmin(request, store);
      if (!session) return fail('登录已过期，请重新登录。', 401, 'UNAUTHORIZED');

      if (path === '/admin/check' && method === 'GET') {
        return ok({ expiresAt: session.expiresAt });
      }
      if (path === '/admin/logout' && method === 'POST') {
        const auth = request.headers.get('Authorization') || '';
        await store.deleteSession(auth.slice(7).trim());
        return ok({ loggedOut: true });
      }
      if (path === '/admin/books' && method === 'GET') {
        const books = await store.listBooks({});
        return json({ ok: true, books: books.map(adminBook) });
      }
      if (path === '/admin/suggestions' && method === 'GET') {
        const list = await store.listSuggestions();
        return ok({ suggestions: list });
      }
      const sug = path.match(/^\/admin\/suggestions\/([^/]+)$/);
      if (sug && method === 'POST') {
        const body = await readJson(request, 16 * 1024);
        const patch = {};
        if (body.adminReply !== undefined) patch.adminReply = cleanText(body.adminReply, 1000);
        if (body.handled !== undefined) patch.handled = !!body.handled;
        if (body.category !== undefined) patch.category = cleanText(body.category, 40);
        if (body.content !== undefined) patch.content = cleanText(body.content, 2000);
        await store.updateSuggestion(decodeURIComponent(sug[1]), patch);
        return ok({ updated: true });
      }
      if (sug && method === 'DELETE') {
        await store.deleteSuggestion(decodeURIComponent(sug[1]));
        return ok({ deleted: true });
      }
      const ct = path.match(/^\/admin\/content\/([^/]+)$/);
      if (ct) {
        const key = decodeURIComponent(ct[1]);
        if (!CONTENT_KEYS.includes(key)) return fail('不支持的内容块：' + key, 400, 'KEY');
        if (method === 'PUT') {
          const body = await readJson(request, 1024 * 1024);
          if (body.value === undefined || body.value === null) return fail('缺少内容。', 400, 'VALUE');
          await store.setContent(key, body.value);
          return ok({ saved: true, key });
        }
        if (method === 'DELETE') {
          await store.deleteContent(key);
          return ok({ reset: true, key });
        }
        if (method === 'GET') {
          const v = await store.listContent([key]);
          return ok({ key, value: v[key] === undefined ? null : v[key] });
        }
      }
      if (path === '/admin/stats' && method === 'GET') {
        const books = await store.listBooks({});
        const s = { total: books.length, pending: 0, approved: 0, rejected: 0, needsReview: 0, sold: 0 };
        for (const b of books) {
          if (b.review === 'pending') s.pending++;
          else if (b.review === 'approved') s.approved++;
          else if (b.review === 'rejected') s.rejected++;
          if (b.needsReview) s.needsReview++;
          if (b.status === 'yes') s.sold++;
        }
        const suggestions = await store.listSuggestions();
        s.suggestions = suggestions.length;
        s.unhandled = suggestions.filter((x) => !x.handled).length;
        return ok({ stats: s });
      }
      if (path === '/admin/reset-seed' && method === 'POST') {
        const books = await store.listBooks({});
        let n = 0;
        for (const b of books) {
          if (b.origin === 'seed') { await store.deleteBook(b.id); n++; }
        }
        return ok({ removed: n });
      }
      /** 把 data/seed-books.js 里的初始数据导入到云端数据库 */
      if (path === '/admin/import-seed' && method === 'POST') {
        const body = await readJson(request, 512 * 1024);
        const list = Array.isArray(body.books) ? body.books : [];
        let n = 0;
        for (const b of list) {
          const exists = await store.getBookRaw(b.id);
          if (exists) continue;
          await store.insertBook({ ...b, origin: b.origin || 'seed' });
          n++;
        }
        return ok({ imported: n });
      }
      return fail('接口不存在：' + path, 404, 'NOT_FOUND');
    }

    return fail('接口不存在：' + path, 404, 'NOT_FOUND');
  } catch (e) {
    const message = (e && e.message) || '服务器内部错误';
    return fail(message, 500, 'SERVER');
  }
}

/** 避免用 === 比较口令时泄露长度信息 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
