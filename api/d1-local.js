/* ============================================================================
 * api/d1-local.js —— 让 node:sqlite 表现得像 Cloudflare D1
 * ----------------------------------------------------------------------------
 * 这样本地开发用的 SQL 和线上 D1 用的 SQL 完全一样，
 * 不会出现"本地能跑、部署后报错"的情况。
 * 只在本地开发服务器里使用，不会上传到线上的后端。
 * ==========================================================================*/
import { DatabaseSync } from 'node:sqlite';

/** SQLite 只接受 null / number / string / bigint / Uint8Array */
function normalize(args) {
  return args.map((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'bigint') return v;
    if (v instanceof Uint8Array) return v;
    return String(v);
  });
}

export function createLocalD1(filePath) {
  const raw = new DatabaseSync(filePath);
  raw.exec('PRAGMA foreign_keys = ON;');

  function prepare(sql) {
    let params = [];
    const stmt = {
      bind(...args) {
        params = args;
        return stmt;
      },
      async first(column) {
        const row = raw.prepare(sql).get(...normalize(params));
        if (row === undefined || row === null) return null;
        if (column) return row[column];
        return row;
      },
      async all() {
        const rows = raw.prepare(sql).all(...normalize(params));
        return { results: rows, success: true, meta: {} };
      },
      async run() {
        const info = raw.prepare(sql).run(...normalize(params));
        return {
          success: true,
          meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
          results: []
        };
      },
      /** D1 支持直接 await prepare()，这里也兼容一下 */
      then(resolve, reject) {
        return stmt.run().then(resolve, reject);
      }
    };
    return stmt;
  }

  return {
    prepare,
    async batch(statements) {
      const out = [];
      for (const s of statements) out.push(await s.run());
      return out;
    },
    async exec(sql) {
      raw.exec(sql);
      return { count: 0, duration: 0 };
    },
    /** 仅供本地调试使用 */
    __raw: raw
  };
}
