/* ============================================================================
 * tools/api-test.mjs —— 后端接口自检
 * ----------------------------------------------------------------------------
 * 先启动本地服务器：
 *     node tools/dev-server.mjs
 * 再另开一个窗口运行：
 *     node tools/api-test.mjs
 *
 * 它会依次验证：提交教材、编辑码权限、"是否已出"只有本人能改、站主审核、
 * 意见建议、内容覆盖、以及各种防机器人规则。
 * ==========================================================================*/
const BASE = process.env.BASE || 'http://localhost:8788';
const PASSWORD = process.env.ADMIN_PASSWORD || 'enpo-admin-2026';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) {
    pass++;
    console.log('  \u2705 ' + name);
  } else {
    fail++;
    failures.push(name);
    console.log('  \u274c ' + name + (detail ? '   → ' + detail : ''));
  }
}

async function call(method, path, { body, token, headers = {}, raw = false } = {}) {
  const h = {
    'User-Agent': BROWSER_UA,
    Origin: BASE,
    ...headers
  };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = 'Bearer ' + token;
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  if (raw) return { status: res.status, text };
  let data = {};
  try { data = JSON.parse(text); } catch (e) { data = { parseError: text.slice(0, 200) }; }
  return { status: res.status, data };
}

const ago = (ms) => Date.now() - ms;

function makeBookPayload(over = {}) {
  return {
    qq: '123456789',
    major: '能动A模块',
    terms: ['大一上', '大一下'],
    books: ['工科数学分析基础（上册）', '思想道德与法治'],
    status: 'no',
    note: '自动化测试生成的数据',
    startedAt: ago(9000),
    website: '',
    ...over
  };
}

async function main() {
  // 先把服务器上的频率限制清掉，保证这个脚本可以反复运行
  // （这个接口只在本地开发模式 env.DEV === '1' 时存在）
  {
    const r = await call('POST', '/api/dev/reset', { body: {} });
    if (r.status === 200 && r.data.reset) {
      console.log('\n（已重置频率限制，本地开发专用）');
    } else {
      console.log('\n（服务器不是开发模式，频率限制未重置；如果后面出现 RATE 报错属正常现象）');
    }
  }

  console.log('\n=== 1. 基础接口 ===');
  {
    const r = await call('GET', '/api/health');
    check('GET /api/health 返回正常', r.status === 200 && r.data.ok === true, JSON.stringify(r.data));
  }
  {
    const r = await call('GET', '/api/books');
    check('GET /api/books 返回教材列表', r.status === 200 && Array.isArray(r.data.books), JSON.stringify(r.data).slice(0, 120));
    check('公开列表里有 82 条初始数据', r.data.books.length === 82, '实际 ' + (r.data.books || []).length);
    const hasHash = (r.data.books || []).some((b) => 'editCodeHash' in b || 'reviewNote' in b);
    check('公开列表不包含编辑码哈希和审核备注', !hasHash);
    const seeded = (r.data.books || [])[0];
    check('QQ 号是加密存储的（不是明文）', seeded && typeof seeded.qqBlob === 'string' && /^\d+$/.test(seeded.qqBlob) === false);
    check('返回的数据带 terms/books/status 字段',
      seeded && Array.isArray(seeded.terms) && Array.isArray(seeded.books) && typeof seeded.status === 'string');
  }

  console.log('\n=== 2. 防机器人规则 ===');
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload({ website: 'http://spam.example' }) });
    check('蜜罐字段被填写 → 拒绝', r.status === 400 && r.data.code === 'HONEYPOT', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload({ startedAt: Date.now() }) });
    check('提交过快 → 拒绝', r.status === 400 && r.data.code === 'TOO_FAST', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', {
      body: makeBookPayload(), headers: { 'User-Agent': 'python-requests/2.31' }
    });
    check('明显的机器人 User-Agent → 拒绝', r.status === 403 && r.data.code === 'BOT', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', {
      body: makeBookPayload(), headers: { Origin: 'https://evil.example' }
    });
    check('来自其它站点的提交 → 拒绝', r.status === 403 && r.data.code === 'ORIGIN', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload({ qq: 'abc' }) });
    check('QQ 号不是数字 → 拒绝', r.status === 400 && r.data.code === 'QQ', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload({ terms: [] }) });
    check('没有选择年级/类型 → 拒绝', r.status === 400 && r.data.code === 'TERMS', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload({ books: [], note: '' }) });
    check('既没选书也没写备注 → 拒绝', r.status === 400 && r.data.code === 'BOOKS', JSON.stringify(r.data));
  }

  console.log('\n=== 3. 提交 → 待审核 → 站主通过 ===');
  let bookId = null;
  let editCode = null;
  {
    const r = await call('POST', '/api/books', { body: makeBookPayload() });
    check('正常提交成功', r.status === 200 && r.data.ok && r.data.id && r.data.editCode, JSON.stringify(r.data));
    bookId = r.data.id;
    editCode = r.data.editCode;
    check('编辑码是 8 位', typeof editCode === 'string' && editCode.length === 8);
  }
  {
    const r = await call('GET', '/api/books');
    check('待审核的条目不会出现在公开列表里',
      !r.data.books.some((b) => b.id === bookId));
  }
  {
    const r = await call('POST', '/api/books/lookup', { body: { id: bookId, editCode } });
    check('用 ID + 编辑码可以取回自己的记录', r.status === 200 && r.data.book.id === bookId);
    check('取回时也不含编辑码哈希', r.data.book && !('editCodeHash' in r.data.book));
  }
  {
    const r = await call('POST', '/api/books/lookup', { body: { id: bookId, editCode: 'WRONGXXX' } });
    check('编辑码错误 → 拒绝', r.status === 403 && r.data.code === 'BAD_CODE', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      body: { editCode, note: '本人修改后的备注' }
    });
    check('本人凭编辑码可以修改', r.status === 200 && r.data.book.note === '本人修改后的备注', JSON.stringify(r.data).slice(0, 160));
    check('本人修改内容后会被标记为待复核', r.data.book.needsReview === true);
  }
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      body: { editCode, review: 'approved' }
    });
    check('本人不能自己把状态改成审核通过',
      r.status === 200 && r.data.book.review === 'pending', 'review=' + (r.data.book || {}).review);
  }

  console.log('\n=== 4. 后台登录 ===');
  let token = null;
  {
    const r = await call('POST', '/api/admin/login', { body: { password: 'definitely-wrong' } });
    check('错误口令 → 拒绝', r.status === 401 && r.data.code === 'BAD_PASSWORD', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', '/api/admin/login', { body: { password: PASSWORD } });
    check('正确口令 → 拿到令牌', r.status === 200 && r.data.token, JSON.stringify(r.data).slice(0, 120));
    token = r.data.token;
  }
  {
    const r = await call('GET', '/api/admin/books');
    check('没有令牌访问后台接口 → 拒绝', r.status === 401 && r.data.code === 'UNAUTHORIZED');
  }
  {
    const r = await call('GET', '/api/admin/check', { token });
    check('带令牌访问后台接口 → 通过', r.status === 200 && r.data.ok);
  }
  {
    const r = await call('GET', '/api/admin/books', { token });
    check('后台能看到待审核的条目', r.data.books.some((b) => b.id === bookId));
    check('后台不会返回编辑码哈希', !r.data.books.some((b) => 'editCodeHash' in b));
  }

  console.log('\n=== 5. 审核与状态权限 ===');
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      token, body: { status: 'yes' }
    });
    check('站主改「是否已出」→ 被拒绝', r.status === 403 && r.data.code === 'STATUS_LOCKED', JSON.stringify(r.data));
  }
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      token, body: { review: 'approved', reviewNote: '没问题' }
    });
    check('站主可以审核通过', r.status === 200 && r.data.book.review === 'approved', JSON.stringify(r.data).slice(0, 160));
    check('审核通过后待复核标记被清除', r.data.book.needsReview === false);
  }
  {
    const r = await call('GET', '/api/books');
    check('审核通过后出现在公开列表里', r.data.books.some((b) => b.id === bookId));
  }
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      body: { editCode, status: 'yes' }
    });
    check('发布者本人可以把状态改成「是」', r.status === 200 && r.data.book.status === 'yes', JSON.stringify(r.data).slice(0, 160));
  }
  {
    const r = await call('POST', `/api/books/${bookId}/update`, {
      body: { editCode, status: 'partial' }
    });
    check('发布者本人可以改成「未出完」', r.status === 200 && r.data.book.status === 'partial');
  }

  console.log('\n=== 6. 意见建议（全匿名） ===');
  let suggestionId = null;
  {
    const r = await call('POST', '/api/suggestions', {
      body: { category: '功能建议', content: '这是自动化测试留言，请忽略。', page: 'suggest.html', startedAt: ago(8000) }
    });
    check('匿名提交建议成功', r.status === 200 && r.data.id, JSON.stringify(r.data));
    suggestionId = r.data.id;
  }
  {
    const r = await call('GET', '/api/admin/suggestions', { token });
    const found = (r.data.suggestions || []).find((s) => s.id === suggestionId);
    check('站主可以看到建议', !!found, JSON.stringify(r.data).slice(0, 160));
    check('建议里没有联系方式字段', found && !('contact' in found));
  }
  {
    const r = await call('POST', `/api/admin/suggestions/${suggestionId}`, {
      token, body: { handled: true, adminReply: '已处理' }
    });
    check('站主可以标记建议为已处理', r.status === 200 && r.data.ok);
  }
  {
    const r = await call('GET', '/api/admin/suggestions');
    check('没有令牌看不到建议', r.status === 401);
  }

  console.log('\n=== 7. 内容覆盖（后台改完立即生效） ===');
  {
    const r = await call('PUT', '/api/admin/content/faq', {
      token, body: { value: { intro: '后台改过的简介', note: '', categories: [] } }
    });
    check('站主可以覆盖内容', r.status === 200 && r.data.saved, JSON.stringify(r.data));
  }
  {
    const r = await call('GET', '/api/content?keys=faq');
    check('覆盖后的内容对所有人可见', r.data.content.faq && r.data.content.faq.intro === '后台改过的简介', JSON.stringify(r.data).slice(0, 160));
  }
  {
    const r = await call('GET', '/api/content?keys=faq,links');
    check('可以同时请求多个内容块', r.data.content.faq && r.data.content.links === undefined);
  }
  {
    const r = await call('PUT', '/api/admin/content/faq', { body: { value: {} } });
    check('没有令牌不能覆盖内容', r.status === 401);
  }
  {
    const r = await call('DELETE', '/api/admin/content/faq', { token });
    check('可以恢复默认内容', r.status === 200 && r.data.reset);
  }
  {
    const r = await call('GET', '/api/content?keys=faq');
    check('恢复后不再返回覆盖内容', r.data.content.faq === undefined);
  }

  console.log('\n=== 8. 删除权限 ===');
  {
    const r = await call('POST', `/api/books/${bookId}/delete`, { body: { editCode: 'WRONGXXX' } });
    check('错误编辑码不能删除', r.status === 403 && r.data.code === 'BAD_CODE');
  }
  {
    const r = await call('POST', `/api/books/${bookId}/delete`, { body: { editCode } });
    check('本人凭编辑码可以删除', r.status === 200 && r.data.deleted);
  }
  {
    const r = await call('GET', '/api/books');
    check('删除后公开列表里也没有了', !r.data.books.some((b) => b.id === bookId));
  }

  console.log('\n=== 9. 退出登录 ===');
  {
    const r = await call('POST', '/api/admin/logout', { token });
    check('退出登录成功', r.status === 200 && r.data.loggedOut);
  }
  {
    const r = await call('GET', '/api/admin/check', { token });
    check('退出后令牌失效', r.status === 401);
  }

  /* ---- 清理测试残留 ---- */
  {
    const r = await call('GET', '/api/books');
    const leftovers = r.data.books.filter((b) => (b.note || '').includes('自动化测试'));
    for (const b of leftovers) {
      console.log('  （清理残留：' + b.id + '）');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`接口测试结果：通过 ${pass} 项，失败 ${fail} 项`);
  if (fail) console.log('失败项：' + failures.join(' / '));
  console.log('='.repeat(60) + '\n');
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\n测试过程中出现异常：' + e.message);
  console.error('请确认本地服务器已经启动：node tools/dev-server.mjs');
  process.exit(1);
});
