-- ============================================================================
-- schema.sql —— 数据库结构
-- ----------------------------------------------------------------------------
-- 【注意】这个文件是由 tools/build-schema.cjs 从 api/schema.js 自动生成的，
--         请不要直接改这里；要改结构请改 api/schema.js，然后重新运行：
--             node tools/build-schema.cjs
--
-- 部署到 Cloudflare 时用这条命令执行：
--     npx wrangler d1 execute enpo --remote --file=./api/schema.sql
-- ============================================================================
-- 二手教材 ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id             TEXT PRIMARY KEY,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  qq_blob        TEXT NOT NULL,
  major          TEXT DEFAULT '',
  terms          TEXT DEFAULT '[]',
  books          TEXT DEFAULT '[]',
  status         TEXT DEFAULT 'no',
  note           TEXT DEFAULT '',
  review         TEXT DEFAULT 'pending',
  review_note    TEXT DEFAULT '',
  needs_review   INTEGER DEFAULT 0,
  reviewed_at    INTEGER,
  edit_code_hash TEXT DEFAULT '',
  origin         TEXT DEFAULT 'user'
);

CREATE INDEX IF NOT EXISTS idx_books_review ON books(review);
CREATE INDEX IF NOT EXISTS idx_books_updated ON books(updated_at DESC);

-- 意见建议（全匿名，不保存联系方式）----------------------------------------
CREATE TABLE IF NOT EXISTS suggestions (
  id          TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  category    TEXT DEFAULT '',
  content     TEXT NOT NULL,
  page        TEXT DEFAULT '',
  handled     INTEGER DEFAULT 0,
  admin_reply TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_suggestions_created ON suggestions(created_at DESC);

-- 站主在后台改过的内容（覆盖 data/*.js 里的默认值，改完立即对所有人生效）----
CREATE TABLE IF NOT EXISTS content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 后台登录会话 -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- 频率限制（防刷）--------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

-- 后台登录失败次数（防暴力破解）------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
  ip           TEXT PRIMARY KEY,
  fails        INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);
