/* ============================================================================
 * api/schema.js —— 数据库结构（唯一真源）
 * ----------------------------------------------------------------------------
 * 这里用 JS 模块保存建表语句，是为了让"线上后端"能直接 import，
 * 因为它不能像本地那样读取文件。
 *
 * 同目录下的 schema.sql 是给 wrangler 命令行用的，由 tools/build-schema.cjs
 * 从这个文件生成，两者内容完全一致（tools/check-site.cjs 会校验）。
 * ==========================================================================*/
export const SCHEMA_SQL = `
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
`;
