/* ============================================================================
 * api/store.js —— 数据存取层
 * ----------------------------------------------------------------------------
 * 这里只依赖 Cloudflare D1 的接口（prepare / bind / first / all / run / batch）。
 * 本地开发时 tools/dev-server.mjs 会用 node:sqlite 做一个同样接口的替身，
 * 所以同一份 SQL 在本地和线上跑的是完全一样的代码，不会出现"本地能跑线上报错"。
 * ==========================================================================*/

/* ------------------------------ 行 <-> 对象 ------------------------------ */
function rowToBook(r) {
  if (!r) return null;
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    qqBlob: r.qq_blob,
    major: r.major || '',
    terms: safeParse(r.terms, []),
    books: safeParse(r.books, []),
    status: r.status || 'unknown',
    note: r.note || '',
    review: r.review || 'pending',
    reviewNote: r.review_note || '',
    needsReview: !!r.needs_review,
    reviewedAt: r.reviewed_at || null,
    origin: r.origin || 'user'
  };
}

function safeParse(text, fallback) {
  try {
    const v = JSON.parse(text);
    return v === null || v === undefined ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function rowToSuggestion(r) {
  if (!r) return null;
  return {
    id: r.id,
    createdAt: r.created_at,
    category: r.category || '',
    content: r.content || '',
    page: r.page || '',
    handled: !!r.handled,
    adminReply: r.admin_reply || ''
  };
}

/* ------------------------------ 建表 ------------------------------ */
export async function migrate(db, schemaSql) {
  // 先按行去掉注释，再按分号切分——否则开头那一大段注释会把第一条建表语句一起吞掉
  const cleaned = String(schemaSql)
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = cleaned.split(';').map((s) => s.trim()).filter(Boolean);
  for (const sql of statements) {
    await db.prepare(sql).run();
  }
}

/* ------------------------------ Store ------------------------------ */
export function createStore(db) {
  return {
    /* ---------------- 二手教材 ---------------- */
    async listBooks({ review = null } = {}) {
      const sql = review
        ? 'SELECT * FROM books WHERE review = ? ORDER BY updated_at DESC'
        : 'SELECT * FROM books ORDER BY updated_at DESC';
      const stmt = review ? db.prepare(sql).bind(review) : db.prepare(sql);
      const res = await stmt.all();
      return (res.results || []).map(rowToBook);
    },

    async getBookRaw(id) {
      const r = await db.prepare('SELECT * FROM books WHERE id = ?').bind(id).first();
      if (!r) return null;
      const book = rowToBook(r);
      book.editCodeHash = r.edit_code_hash || '';
      return book;
    },

    async insertBook(doc) {
      await db.prepare(
        `INSERT INTO books (id, created_at, updated_at, qq_blob, major, terms, books, status, note,
                            review, review_note, needs_review, reviewed_at, edit_code_hash, origin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        doc.id, doc.createdAt, doc.updatedAt, doc.qqBlob, doc.major || '',
        JSON.stringify(doc.terms || []), JSON.stringify(doc.books || []),
        doc.status || 'no', doc.note || '', doc.review || 'pending',
        doc.reviewNote || '', doc.needsReview ? 1 : 0, doc.reviewedAt || null,
        doc.editCodeHash || '', doc.origin || 'user'
      ).run();
      return doc;
    },

    async updateBook(id, patch) {
      const fields = [];
      const values = [];
      const map = {
        qqBlob: 'qq_blob', major: 'major', status: 'status', note: 'note',
        review: 'review', reviewNote: 'review_note', reviewedAt: 'reviewed_at',
        origin: 'origin', updatedAt: 'updated_at'
      };
      for (const [k, col] of Object.entries(map)) {
        if (patch[k] !== undefined) { fields.push(col + ' = ?'); values.push(patch[k]); }
      }
      if (patch.terms !== undefined) { fields.push('terms = ?'); values.push(JSON.stringify(patch.terms)); }
      if (patch.books !== undefined) { fields.push('books = ?'); values.push(JSON.stringify(patch.books)); }
      if (patch.needsReview !== undefined) { fields.push('needs_review = ?'); values.push(patch.needsReview ? 1 : 0); }
      if (!fields.length) return false;
      values.push(id);
      await db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      return true;
    },

    async deleteBook(id) {
      await db.prepare('DELETE FROM books WHERE id = ?').bind(id).run();
      return true;
    },

    async countBooks() {
      const r = await db.prepare('SELECT COUNT(*) AS n FROM books').first();
      return (r && r.n) || 0;
    },

    /* ---------------- 意见建议 ---------------- */
    async listSuggestions() {
      const res = await db.prepare('SELECT * FROM suggestions ORDER BY created_at DESC').all();
      return (res.results || []).map(rowToSuggestion);
    },

    async insertSuggestion(doc) {
      await db.prepare(
        `INSERT INTO suggestions (id, created_at, category, content, page, handled, admin_reply)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(doc.id, doc.createdAt, doc.category || '', doc.content, doc.page || '',
        doc.handled ? 1 : 0, doc.adminReply || '').run();
      return doc;
    },

    async updateSuggestion(id, patch) {
      const fields = [];
      const values = [];
      if (patch.category !== undefined) { fields.push('category = ?'); values.push(patch.category); }
      if (patch.content !== undefined) { fields.push('content = ?'); values.push(patch.content); }
      if (patch.adminReply !== undefined) { fields.push('admin_reply = ?'); values.push(patch.adminReply); }
      if (patch.handled !== undefined) { fields.push('handled = ?'); values.push(patch.handled ? 1 : 0); }
      if (!fields.length) return false;
      values.push(id);
      await db.prepare(`UPDATE suggestions SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      return true;
    },

    async deleteSuggestion(id) {
      await db.prepare('DELETE FROM suggestions WHERE id = ?').bind(id).run();
      return true;
    },

    /* ---------------- 内容覆盖 ---------------- */
    async listContent(keys) {
      const out = {};
      if (!keys || !keys.length) {
        const res = await db.prepare('SELECT key, value FROM content').all();
        for (const r of res.results || []) out[r.key] = safeParse(r.value, null);
        return out;
      }
      for (const key of keys) {
        const r = await db.prepare('SELECT value FROM content WHERE key = ?').bind(key).first();
        if (r) out[key] = safeParse(r.value, null);
      }
      return out;
    },

    async setContent(key, value) {
      await db.prepare(
        `INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(key, JSON.stringify(value), Date.now()).run();
      return true;
    },

    async deleteContent(key) {
      await db.prepare('DELETE FROM content WHERE key = ?').bind(key).run();
      return true;
    },

    /* ---------------- 会话 ---------------- */
    async createSession(token, ttlMs) {
      const now = Date.now();
      await db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now).run();
      await db.prepare('INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
        .bind(token, now, now + ttlMs).run();
      return now + ttlMs;
    },

    async getSession(token) {
      if (!token) return null;
      const r = await db.prepare('SELECT * FROM admin_sessions WHERE token = ?').bind(token).first();
      if (!r) return null;
      if (r.expires_at < Date.now()) {
        await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
        return null;
      }
      return { token: r.token, createdAt: r.created_at, expiresAt: r.expires_at };
    },

    async deleteSession(token) {
      await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
      return true;
    },

    /* ---------------- 频率限制 ---------------- */
    /** @returns {{allowed:boolean, remaining:number, retryAfterMs:number}} */
    async rateLimit(bucket, max, windowMs) {
      const now = Date.now();
      const r = await db.prepare('SELECT count, window_start FROM rate_limits WHERE bucket = ?').bind(bucket).first();
      if (!r || now - r.window_start > windowMs) {
        await db.prepare(
          `INSERT INTO rate_limits (bucket, count, window_start) VALUES (?, 1, ?)
           ON CONFLICT(bucket) DO UPDATE SET count = 1, window_start = excluded.window_start`
        ).bind(bucket, now).run();
        return { allowed: true, remaining: max - 1, retryAfterMs: 0 };
      }
      if (r.count >= max) {
        return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - r.window_start) };
      }
      await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE bucket = ?').bind(bucket).run();
      return { allowed: true, remaining: max - r.count - 1, retryAfterMs: 0 };
    },

    /* ---------------- 后台登录失败次数 ---------------- */
    async getLoginState(ip) {
      const r = await db.prepare('SELECT fails, locked_until FROM login_attempts WHERE ip = ?').bind(ip).first();
      return { fails: (r && r.fails) || 0, lockedUntil: (r && r.locked_until) || 0 };
    },

    async setLoginState(ip, fails, lockedUntil) {
      await db.prepare(
        `INSERT INTO login_attempts (ip, fails, locked_until) VALUES (?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET fails = excluded.fails, locked_until = excluded.locked_until`
      ).bind(ip, fails, lockedUntil || 0).run();
      return true;
    },

    /** 只在本地开发时使用：清空频率限制和登录失败记录 */
    async clearRateLimits() {
      await db.prepare('DELETE FROM rate_limits').run();
      await db.prepare('DELETE FROM login_attempts').run();
      return true;
    },

    /* ---------------- 初始化种子数据 ---------------- */
    async seedIfEmpty(seedBooks) {
      const n = await this.countBooks();
      if (n > 0) return 0;
      if (!Array.isArray(seedBooks) || !seedBooks.length) return 0;
      for (const b of seedBooks) {
        await this.insertBook({
          id: b.id,
          createdAt: b.createdAt || Date.now(),
          updatedAt: b.updatedAt || Date.now(),
          qqBlob: b.qqBlob || '',
          major: b.major || '',
          terms: b.terms || [],
          books: b.books || [],
          status: b.status || 'unknown',
          note: b.note || '',
          review: b.review || 'approved',
          reviewNote: '',
          needsReview: false,
          reviewedAt: b.reviewedAt || null,
          editCodeHash: '',
          origin: 'seed'
        });
      }
      return seedBooks.length;
    }
  };
}
