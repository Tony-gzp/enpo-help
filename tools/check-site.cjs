/* ============================================================================
 * tools/check-site.cjs —— 静态站点自检（需要 Node.js）
 * ----------------------------------------------------------------------------
 * 用法（在网站根目录执行）：
 *     node tools/check-site.cjs
 *
 * 检查内容：
 *   1. 所有 .js 文件语法是否正确
 *   2. 每个 HTML 引用的 css / js / 图片文件是否真实存在
 *   3. 所有站内链接（xxx.html）是否有对应的文件
 *   4. data/ 里配置的导航链接是否都存在
 *   5. 每个页面的 data-page 是否都能找到渲染脚本
 *   6. 是否所有页面都带了 noindex 标记
 * ==========================================================================*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let errors = 0;
let warnings = 0;

function err(msg) { errors++; console.log('  ❌ ' + msg); }
function warn(msg) { warnings++; console.log('  ⚠️  ' + msg); }
function ok(msg) { console.log('  ✅ ' + msg); }

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(ROOT);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

/* ==================== 1. JS 语法检查 ==================== */
console.log('\n=== 1. JavaScript 语法检查 ===');
const jsFiles = allFiles.filter((f) => f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.mjs'));

// 浏览器里跑的普通脚本：用 vm.Script 只解析不执行
// Node 的 ES 模块（api/、functions/、tools/*.mjs）：用动态 import 检查（会解析所有 import）
function isEsm(f) {
  const r = rel(f);
  return r.startsWith('api/') || r.startsWith('functions/') || r.startsWith('worker/') || r.endsWith('.mjs');
}

let syntaxBad = 0;
(async () => {
  for (const f of jsFiles) {
    if (isEsm(f)) continue;
    const source = fs.readFileSync(f, 'utf8');
    try {
      new vm.Script(source, { filename: f });   // 只解析、不执行
    } catch (e) {
      syntaxBad++;
      err(rel(f) + ' 语法错误：' + e.message);
    }
  }

  // ES 模块（api/、functions/、tools/*.mjs）用 node --check 检查。
  // 注意：这里必须用 stdio:'ignore'，否则沙箱不允许捕获子进程输出。
  const esmFiles = jsFiles.filter(isEsm);
  for (const f of esmFiles) {
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'ignore' });
    } catch (e) {
      syntaxBad++;
      err(rel(f) + ' 语法错误（用 node --check 检出）');
    }
  }
  if (!syntaxBad) ok(jsFiles.length + ' 个 JS 文件语法全部正确（含 ' + esmFiles.length + ' 个后端模块）');

  runRest();
})();

function runRest() {
/* ==================== 2. HTML 引用完整性 ==================== */
console.log('\n=== 2. HTML 引用的资源是否存在 ===');
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
let refBad = 0;

for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const refs = new Set();

  // <script src="...">
  for (const m of src.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) refs.add(m[1]);
  // <link href="...">
  for (const m of src.matchAll(/<link[^>]+href=["']([^"']+)["']/g)) refs.add(m[1]);
  // <img src="...">
  for (const m of src.matchAll(/<img[^>]+src=["']([^"']+)["']/g)) refs.add(m[1]);

  for (const r of refs) {
    if (/^(https?:)?\/\//.test(r) || r.startsWith('data:') || r.startsWith('#')) continue;
    const target = path.join(path.dirname(f), r.split('?')[0].split('#')[0]);
    if (!fs.existsSync(target)) {
      refBad++;
      err(rel(f) + ' 引用了不存在的文件：' + r);
    }
  }
}
if (!refBad) ok('所有 HTML 引用的 CSS / JS / 图片都存在');

/* ==================== 3. 站内链接 ==================== */
console.log('\n=== 3. 站内页面链接 ===');
let linkBad = 0;
const htmlNames = new Set(htmlFiles.map((f) => path.basename(f)));

for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/href=["']([^"'#?]+\.html)(\?[^"']*)?["']/g)) {
    const target = path.basename(m[1]);
    if (!htmlNames.has(target)) {
      linkBad++;
      err(rel(f) + ' 链接到不存在的页面：' + m[1]);
    }
  }
}
if (!linkBad) ok('HTML 里的站内页面链接全部有效');

/* ==================== 4. 数据文件里的导航 / 链接 ==================== */
console.log('\n=== 4. 数据文件配置检查 ===');
function loadData(file) {
  const sandbox = { console, window: {}, Date, JSON, Math, Object, Array };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
  return sandbox.ENPO_DATA || sandbox.window.ENPO_DATA || {};
}

let dataBad = 0;
try {
  /* ---- 站点基础信息与导航 ---- */
  const site = loadData('data/site.js');
  (site.nav || []).forEach((item) => {
    if (!htmlNames.has(item.href)) {
      dataBad++;
      err('data/site.js 导航里的 href 不存在：' + item.key + ' → ' + item.href);
    }
  });
  if (!site.site || !site.site.disclaimer) { dataBad++; err('data/site.js 缺少免责声明'); }

  /* ---- 常见问题 ---- */
  const faq = loadData('data/faq.js');
  if (!(faq.faq && faq.faq.categories && faq.faq.categories.length)) {
    dataBad++;
    err('data/faq.js 里没有常见问题内容');
  } else {
    let n = 0;
    faq.faq.categories.forEach((c) => {
      (c.items || []).forEach((i) => {
        n++;
        if (!i.q || !i.a) { dataBad++; err('data/faq.js 有问答缺少问题或回答'); }
      });
    });
    if (!n) { dataBad++; err('data/faq.js 里一条问答都没有'); }
  }

  /* ---- 校内网站 ---- */
  const links = loadData('data/links.js');
  let siteCount = 0;
  ((links.links || {}).groups || []).forEach((g) => {
    (g.items || []).forEach((it) => {
      siteCount++;
      if (!/^https?:\/\//.test(it.url || '')) {
        dataBad++;
        err('data/links.js 里不是 http(s) 地址：' + g.name + ' → ' + it.name + ' → ' + it.url);
      }
      if (!it.icon) { warn('data/links.js 里 ' + it.name + ' 没有图标'); }
    });
  });
  if (!siteCount) { dataBad++; err('data/links.js 里没有任何网站'); }
  if (!(links.iconSet || []).length) { dataBad++; err('data/links.js 缺少图标库 iconSet'); }

  /* ---- 必选通识课 ---- */
  const ge = loadData('data/general-edu.js');
  const geData = ge.generalEdu || {};
  if (!(geData.modules || []).length) { dataBad++; err('data/general-edu.js 里没有课程模块'); }
  if (!geData.map || !(geData.map.branches || []).length) { dataBad++; err('data/general-edu.js 缺少思维导图结构'); }
  const geText = JSON.stringify(geData);
  if (/考核方式|选课建议/.test(geText)) {
    warn('data/general-edu.js 里出现了「考核方式 / 选课建议」字样（按需求这一页不应做推荐）');
  }

  /* ---- 培养方案 ---- */
  const plans = loadData('data/plans.js');
  (plans.plans ? plans.plans.order : []).forEach((y) => {
    if (!htmlNames.has('plan-' + y + '.html')) {
      dataBad++;
      err('data/plans.js 里的年级 ' + y + ' 没有对应的 plan-' + y + '.html 页面');
    }
    if (!plans.plans.years[y]) {
      dataBad++;
      err('data/plans.js 里 order 包含 ' + y + '，但 years 里没有这一级的数据');
    } else if (!(plans.plans.years[y].terms || []).length) {
      warn('data/plans.js 里 ' + y + ' 级没有任何学期数据');
    }
  });

  /* ---- 表单选项 ---- */
  const opts = loadData('data/book-options.js');
  const o = opts.bookOptions || {};
  ['majors', 'terms', 'statuses', 'bookGroups'].forEach((k) => {
    if (!(o[k] || []).length) { dataBad++; err('data/book-options.js 缺少 ' + k); }
  });
  (o.statuses || []).forEach((s) => {
    if (!s.value || !s.label) { dataBad++; err('data/book-options.js 的状态选项缺少 value 或 label'); }
  });

  /* ---- 初始出书数据 ---- */
  const seed = loadData('data/seed-books.js');
  (seed.seedBooks || []).forEach((b) => {
    if (!b.id) { dataBad++; err('data/seed-books.js 有条目缺少 id'); }
    if (!b.qqBlob) { dataBad++; err('data/seed-books.js 的 ' + b.id + ' 缺少 qqBlob'); }
    if (!Array.isArray(b.terms) || !Array.isArray(b.books)) {
      dataBad++;
      err('data/seed-books.js 的 ' + b.id + ' 的 terms / books 不是数组');
    }
    if (!b.status) { dataBad++; err('data/seed-books.js 的 ' + b.id + ' 缺少 status'); }
  });

  /* ---- 部署配置文件检查 ---- */
  {
    const cfgPath = path.join(ROOT, 'wrangler.jsonc');
    if (!fs.existsSync(cfgPath)) {
      warn('没有找到 wrangler.jsonc，Cloudflare Workers 方式部署会失败');
    } else {
      // JSONC：先去掉整行注释，再当普通 JSON 解析
      const raw = fs.readFileSync(cfgPath, 'utf8');
      const stripped = raw
        .split('\n')
        .filter((line) => !line.trim().startsWith('//'))
        .join('\n');
      try {
        const cfg = JSON.parse(stripped);
        if (!cfg.main) { dataBad++; err('wrangler.jsonc 缺少 main 字段'); }
        if (!cfg.assets || cfg.assets.directory !== '.') {
          dataBad++;
          err('wrangler.jsonc 的 assets.directory 应该是 "."');
        }
        const d1 = (cfg.d1_databases || [])[0];
        if (!d1 || d1.binding !== 'DB') {
          dataBad++;
          err('wrangler.jsonc 里缺少 binding 为 DB 的 d1_databases');
        } else if (/换成|填|xxxx/i.test(d1.database_id || '')) {
          warn('wrangler.jsonc 里的 database_id 还是占位符，部署前要换成真实的数据库 ID');
        }
      } catch (e) {
        dataBad++;
        err('wrangler.jsonc 不是合法的 JSONC：' + e.message);
      }
    }
    if (!fs.existsSync(path.join(ROOT, '.assetsignore'))) {
      warn('没有 .assetsignore，部署后 tools/ 等内部文件会被公开下载');
    }
  }

  /* ---- 建表语句是否同步 ---- */
  const schemaJs = fs.readFileSync(path.join(ROOT, 'api/schema.js'), 'utf8');
  const schemaSql = fs.readFileSync(path.join(ROOT, 'api/schema.sql'), 'utf8');
  const sqlMatch = schemaJs.match(/export const SCHEMA_SQL = `([\s\S]*?)`;/);
  if (!sqlMatch) {
    dataBad++;
    err('api/schema.js 里找不到 SCHEMA_SQL');
  } else if (schemaSql.trim().indexOf(sqlMatch[1].trim()) < 0) {
    dataBad++;
    err('api/schema.sql 和 api/schema.js 不一致，请运行 node tools/build-schema.cjs');
  }

  /* ---- 后端种子数据是否与 data/seed-books.js 一致 ---- */
  const apiSeed = fs.readFileSync(path.join(ROOT, 'api/seed.js'), 'utf8');
  const seedJs = fs.readFileSync(path.join(ROOT, 'data/seed-books.js'), 'utf8');
  const countA = (apiSeed.match(/"id": "/g) || []).length;
  const countB = (seedJs.match(/"id": "/g) || []).length;
  if (countA !== countB || countA === 0) {
    dataBad++;
    err('api/seed.js 与 data/seed-books.js 不一致（' + countA + ' vs ' + countB + '），请运行 python tools/parse-xlsx.py');
  }
} catch (e) {
  dataBad++;
  err('读取数据文件失败：' + e.message);
}
if (!dataBad) ok('导航、常见问题、校内网站、通识课、培养方案、表单选项、初始数据都正确');

/* ==================== 5. 每页都要有 noindex ==================== */
console.log('\n=== 5. 反收录标记 ===');
let noindexBad = 0;
for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  if (!/name=["']robots["'][^>]*noindex/.test(src)) {
    noindexBad++;
    err(rel(f) + ' 缺少 <meta name="robots" content="noindex...">');
  }
}
if (!noindexBad) ok(htmlFiles.length + ' 个页面都带了 noindex 标记');

/* ==================== 6. 每个 data-page 是否有渲染脚本 ==================== */
console.log('\n=== 6. 页面渲染脚本 ===');
const pagesNeedScript = {
  home: 'assets/js/pages/home.js',
  faq: 'assets/js/pages/faq.js',
  books: 'assets/js/pages/books.js',
  'book-submit': 'assets/js/pages/book-submit.js',
  'book-mine': 'assets/js/pages/book-mine.js',
  'plan-2026': 'assets/js/pages/plan.js',
  'plan-2025': 'assets/js/pages/plan.js',
  'plan-2024': 'assets/js/pages/plan.js',
  'general-edu': 'assets/js/pages/general-edu.js',
  links: 'assets/js/pages/links.js',
  suggest: 'assets/js/pages/suggest.js',
  admin: 'assets/js/pages/admin.js',
  welcome: 'assets/js/pages/gate.js',
  '404': null,          // 纯静态页，不需要单独的渲染脚本
  'logic-test': null    // tools/ 下的自检页，自带内联脚本
};
let scriptBad = 0;
for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const m = src.match(/<body[^>]*data-page=["']([^"']+)["']/);
  if (!m) { warn(rel(f) + ' 的 <body> 没有 data-page 属性'); continue; }
  const page = m[1];
  if (!(page in pagesNeedScript)) {
    warn(rel(f) + ' 的 data-page="' + page + '" 没有登记对应的渲染脚本');
    continue;
  }
  const need = pagesNeedScript[page];
  if (need && !src.includes(need)) { scriptBad++; err(rel(f) + ' 没有引入 ' + need); }
}
if (!scriptBad) ok('每个页面的渲染脚本都正确引入');

/* ==================== 汇总 ==================== */
console.log('\n' + '='.repeat(60));
console.log(`结果：${errors} 个错误，${warnings} 个提醒`);
console.log('='.repeat(60) + '\n');
process.exit(errors === 0 ? 0 : 1);
}  // runRest()
