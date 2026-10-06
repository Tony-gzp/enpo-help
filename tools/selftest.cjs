/* ============================================================================
 * tools/selftest.cjs —— 站内核心算法的自检脚本（需要 Node.js）
 * ----------------------------------------------------------------------------
 * 用法（在网站根目录执行）：
 *     node tools/selftest.cjs
 *
 * 检查内容：
 *   1. sha256Hex 的哈希值是否与 Node 内置 crypto 一致
 *   2. 联系方式加密 / 解密是否能正确往返
 *   3. data/seed-books.js 里的示例联系方式能否被正确还原
 * ==========================================================================*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
let failed = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? '  ✅' : '  ❌'} ${name}`);
  if (!ok) {
    console.log(`      期望：${expected}`);
    console.log(`      实际：${actual}`);
  }
}

/* ---------- 搭建一个最小的浏览器环境来加载 util.js ---------- */
function makeSandbox() {
  const store = new Map();
  const sandbox = {
    console,
    setTimeout, clearTimeout,
    Math, Date, JSON, Object, Array, String, Number, Boolean, Error, RegExp,
    Uint8Array, Promise, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
    unescape, escape
  };
  sandbox.window = sandbox;
  sandbox.window.btoa = (s) => Buffer.from(s, 'latin1').toString('base64');
  sandbox.window.atob = (s) => Buffer.from(s, 'base64').toString('latin1');
  sandbox.window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
  sandbox.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {} }),
    addEventListener() {},
    body: { appendChild() {}, classList: { add() {}, remove() {} } },
    head: { appendChild() {} }
  };
  sandbox.navigator = { userAgent: 'node-selftest', languages: ['zh-CN'] };
  sandbox.crypto = crypto.webcrypto;
  return sandbox;
}

console.log('\n=== 1. 加载 assets/js/core/util.js ===');
const utilSrc = fs.readFileSync(path.join(ROOT, 'assets/js/core/util.js'), 'utf8');
const sandbox = makeSandbox();
vm.createContext(sandbox);
vm.runInContext(utilSrc, sandbox, { filename: 'util.js' });
const U = sandbox.window.ENPO.util;
console.log('  ✅ 加载成功');

console.log('\n=== 2. SHA-256 一致性 ===');
const samples = ['', 'abc', 'enpo-admin-2026', 'ABCD1234', '中文测试-西安交通大学'];
for (const s of samples) {
  const expected = crypto.createHash('sha256').update(s, 'utf8').digest('hex');
  check(`sha256Hex(${JSON.stringify(s)})`, U.sha256Hex(s), expected);
}

console.log('\n=== 3. 联系方式加密往返 ===');
const contacts = ['xjtu_nd_demo1', '123456789', '13800001111', 'someone@xjtu.edu.cn', 'a-b_c.d+e'];
for (const c of contacts) {
  const blob = U.obfuscate(c);
  check(`obfuscate→deobfuscate 往返：${c}`, U.deobfuscate(blob), c);
}

console.log('\n=== 4. 打码显示 ===');
check('maskText("13800001111")', U.maskText('13800001111'), '138＊＊＊＊＊＊11');
check('maskText("abc")', U.maskText('abc'), 'a＊＊＊');

console.log('\n=== 5. 示例数据里的联系方式能否还原 ===');
const seedSrc = fs.readFileSync(path.join(ROOT, 'data/seed-books.js'), 'utf8');
const seedSandbox = makeSandbox();
vm.createContext(seedSandbox);
vm.runInContext(seedSrc, seedSandbox, { filename: 'seed-books.js' });
const seeds = seedSandbox.window.ENPO_DATA.seedBooks;
console.log(`  共 ${seeds.length} 条初始出书数据`);
let qqOk = 0;
seeds.forEach((b, i) => {
  const plain = U.deobfuscate(b.qqBlob);
  const looksOk = /^\d{5,12}$/.test(plain);
  if (looksOk) qqOk++;
  if (!looksOk) {
    failed++;
    console.log(`  ❌ ${b.id} 的 QQ 号无法还原：${JSON.stringify(plain)}`);
  } else if (i < 3) {
    console.log(`  ✅ ${b.id} → ${plain.slice(0, 3)}****${plain.slice(-2)}（已加密还原成功）`);
  }
});
console.log(`  ${qqOk === seeds.length ? '✅' : '❌'} ${qqOk}/${seeds.length} 条记录的 QQ 号都能正确还原`);

console.log('\n=== 6. 配置项检查 ===');
const cfgSrc = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
const cfgSandbox = makeSandbox();
vm.createContext(cfgSandbox);
vm.runInContext(cfgSrc, cfgSandbox, { filename: 'config.js' });
const CFG = cfgSandbox.window.ENPO.config;
check('默认口令 enpo-admin-2026 的摘要',
  U.sha256Hex(CFG.adminSalt + 'enpo-admin-2026'), CFG.adminPasswordHash);
check('数据层默认是自动判断模式', CFG.adapter, 'auto');

console.log('\n=== 7. 数据文件语法检查 ===');
const DATA_FILES = [
  'data/site.js', 'data/faq.js', 'data/links.js', 'data/general-edu.js',
  'data/plans.js', 'data/book-options.js', 'data/seed-books.js'
];
for (const f of DATA_FILES) {
  try {
    const sb = makeSandbox();
    vm.createContext(sb);
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sb, { filename: f });
    const keys = Object.keys(sb.window.ENPO_DATA);
    if (!keys.length) throw new Error('没有导出任何内容');
    console.log(`  ✅ ${f} 语法正确（导出键：${keys.join(', ')}）`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${f} 有语法错误：${e.message}`);
  }
}

console.log('\n=== 8. 后端种子数据与前端是否一致 ===');
{
  const apiSeed = fs.readFileSync(path.join(ROOT, 'api/seed.js'), 'utf8');
  const m = apiSeed.match(/export const SEED_BOOKS = (\[[\s\S]*\]);/);
  if (!m) {
    failed++;
    console.log('  ❌ api/seed.js 格式不对');
  } else {
    let apiList = [];
    try { apiList = JSON.parse(m[1]); } catch (e) { /* ignore */ }
    check('api/seed.js 与 data/seed-books.js 条数一致', apiList.length, seeds.length);
    const a = JSON.stringify(apiList[0]);
    const b = JSON.stringify(seeds[0]);
    check('第一条内容一致', a === b, true);
  }
}

console.log(`\n${failed === 0 ? '🎉 全部通过' : `⚠️  有 ${failed} 项未通过`}\n`);
process.exit(failed === 0 ? 0 : 1);
