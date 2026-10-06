/* ============================================================================
 * tools/build-schema.cjs —— 由 api/schema.js 生成 api/schema.sql
 * ----------------------------------------------------------------------------
 * 用法（在网站根目录执行）：
 *     node tools/build-schema.cjs
 *
 * 为什么要生成两份：线上后端（Cloudflare）不能读文件，所以建表语句必须是
 * JS 模块；而 wrangler 命令行需要 .sql 文件。以 api/schema.js 为准，
 * 这个脚本负责同步 schema.sql。
 * ==========================================================================*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'api', 'schema.js'), 'utf8');

const m = src.match(/export const SCHEMA_SQL = `([\s\S]*?)`;/);
if (!m) {
  console.error('无法从 api/schema.js 里找到 SCHEMA_SQL');
  process.exit(1);
}

const header = `-- ============================================================================
-- schema.sql —— 数据库结构
-- ----------------------------------------------------------------------------
-- 【注意】这个文件是由 tools/build-schema.cjs 从 api/schema.js 自动生成的，
--         请不要直接改这里；要改结构请改 api/schema.js，然后重新运行：
--             node tools/build-schema.cjs
--
-- 部署到 Cloudflare 时用这条命令执行：
--     npx wrangler d1 execute enpo --remote --file=./api/schema.sql
-- ============================================================================
`;

const out = header + m[1].replace(/^\n/, '');
fs.writeFileSync(path.join(ROOT, 'api', 'schema.sql'), out, 'utf8');
console.log('已生成 api/schema.sql（' + out.length + ' 字节）');
