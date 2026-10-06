/* ============================================================================
 * store.js —— 数据层（二手教材 + 意见建议 + 内容覆盖）
 * ----------------------------------------------------------------------------
 * 有两种工作模式，页面代码完全不用区分：
 *   'api'   在线模式：数据存在云端数据库里，所有访客看到的是同一份内容
 *   'local' 离线模式：数据存在访客自己的浏览器里（直接双击打开网页时用）
 *
 * 页面启动时先 ENPO.ready().then(init)，等模式判断和内容加载完成后才渲染。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var CFG = ENPO.config || {};

  var KEY_BOOKS = 'books';
  var KEY_SUGGEST = 'suggestions';
  var KEY_MINE = 'myEntries';
  var KEY_SEEDED = 'seeded';
  var KEY_DATA_VERSION = 'dataVersion';
  var KEY_TOKEN = 'adminToken';
  var KEY_TOKEN_EXP = 'adminTokenExp';

  /* 本机数据结构的版本号。结构变了就 +1，老数据会自动迁移或替换。
     版本 1：早期的 title / contactBlob 结构
     版本 2：现在的 qqBlob / terms / books / status 结构 */
  var DATA_VERSION = 2;

  var STATUS_VALUES = ['no', 'contacting', 'partial', 'yes', 'unknown'];

  /** 把版本 1 的记录转成版本 2 的结构（能转的尽量转，转不了的字段丢掉） */
  function toV2(b) {
    var status = b.status;
    if (status === 'available') status = 'no';
    else if (status === 'sold') status = 'yes';
    else if (STATUS_VALUES.indexOf(status) < 0) status = 'unknown';

    return {
      id: b.id,
      createdAt: b.createdAt || Date.now(),
      updatedAt: b.updatedAt || Date.now(),
      qqBlob: b.qqBlob || b.contactBlob || '',
      major: b.major || b.course || '',
      terms: Array.isArray(b.terms) ? b.terms : (b.grade ? [b.grade] : []),
      books: Array.isArray(b.books) ? b.books : (b.title ? [b.title] : []),
      status: status,
      note: b.note || '',
      review: b.review || 'pending',
      reviewNote: b.reviewNote || '',
      needsReview: !!b.needsReview,
      reviewedAt: b.reviewedAt || null,
      editCodeHash: b.editCodeHash || '',
      origin: b.origin || 'user'
    };
  }

  var REVIEW = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };
  var STATUS = { NO: 'no', CONTACTING: 'contacting', PARTIAL: 'partial', YES: 'yes', UNKNOWN: 'unknown' };

  var mode = 'local';
  var apiError = '';

  /* ======================================================================
   * 本地存储实现（离线模式）
   * ==================================================================== */
  /**
   * 把本机里的老版本数据升级到当前结构。
   * 早期版本存的是 title / contactBlob / status='available'，
   * 现在存的是 qqBlob / terms / books / status='no'，
   * 不迁移的话页面就会显示成"信息全空"，看起来像数据丢了。
   */
  function migrateLocalData() {
    var old = U.storage.getJSON(KEY_BOOKS, []);
    if (!Array.isArray(old) || !old.length) {
      U.storage.remove(KEY_SEEDED);   // 让新的初始数据重新导入一次
      return;
    }
    var hadSeed = old.some(function (b) { return b && b.origin === 'seed'; });
    var kept = old
      .filter(function (b) { return b && b.id && b.origin !== 'seed'; })
      .map(toV2);

    if (hadSeed && window.ENPO_DATA && Array.isArray(window.ENPO_DATA.seedBooks)) {
      // 老的一批初始数据（只有 4 条示例）作废，换成现在的这一批
      var ids = {};
      kept.forEach(function (b) { ids[b.id] = 1; });
      window.ENPO_DATA.seedBooks.forEach(function (b) {
        if (!ids[b.id]) { kept.push(b); ids[b.id] = 1; }
      });
      U.storage.set(KEY_SEEDED, '1');
    }
    U.storage.setJSON(KEY_BOOKS, kept);
  }

  var LocalAdapter = {
    init: function () {
      if (!U.storage.available) return;
      if (!window.ENPO_DATA || !Array.isArray(window.ENPO_DATA.seedBooks)) return;

      // 1) 先看本机存的是不是老结构，是的话先迁移（否则会出现"信息不见了"）
      if (U.storage.get(KEY_DATA_VERSION) !== String(DATA_VERSION)) {
        migrateLocalData();
        U.storage.set(KEY_DATA_VERSION, String(DATA_VERSION));
      }

      // 2) 第一次访问时导入初始数据
      var seeded = U.storage.get(KEY_SEEDED);
      var books = U.storage.getJSON(KEY_BOOKS, null);
      if (!seeded && (!books || !books.length)) {
        U.storage.setJSON(KEY_BOOKS, window.ENPO_DATA.seedBooks.slice());
        U.storage.set(KEY_SEEDED, '1');
      } else if (!seeded) {
        U.storage.set(KEY_SEEDED, '1');
      }
    },
    listBooks: function () { return U.storage.getJSON(KEY_BOOKS, []); },
    getBook: function (id) {
      var all = this.listBooks();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    },
    saveBook: function (doc) {
      var all = this.listBooks();
      var found = false;
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === doc.id) { all[i] = doc; found = true; break; }
      }
      if (!found) all.unshift(doc);
      U.storage.setJSON(KEY_BOOKS, all);
      return doc;
    },
    deleteBook: function (id) {
      U.storage.setJSON(KEY_BOOKS, this.listBooks().filter(function (b) { return b.id !== id; }));
      return true;
    },
    replaceBooks: function (list) { U.storage.setJSON(KEY_BOOKS, list || []); return true; },
    listSuggestions: function () { return U.storage.getJSON(KEY_SUGGEST, []); },
    saveSuggestion: function (doc) {
      var all = this.listSuggestions();
      var found = false;
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === doc.id) { all[i] = doc; found = true; break; }
      }
      if (!found) all.unshift(doc);
      U.storage.setJSON(KEY_SUGGEST, all);
      return doc;
    },
    deleteSuggestion: function (id) {
      U.storage.setJSON(KEY_SUGGEST, this.listSuggestions().filter(function (s) { return s.id !== id; }));
      return true;
    },
    listMine: function () { return U.storage.getJSON(KEY_MINE, []); },
    saveMine: function (list) { U.storage.setJSON(KEY_MINE, list); return true; }
  };

  /* ======================================================================
   * 网络请求小工具
   * ==================================================================== */
  function apiUrl(path) {
    try { return new URL(path, window.location.href).href; }
    catch (e) { return path; }
  }

  function apiFetch(path, options) {
    options = options || {};
    var headers = { 'Accept': 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.token) headers['Authorization'] = 'Bearer ' + options.token;
    return fetch(apiUrl(path), {
      method: options.method || 'GET',
      headers: headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store'
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
        if (!res.ok || data.ok === false) {
          var err = new Error(data.error || ('请求失败（HTTP ' + res.status + '）'));
          err.status = res.status;
          err.code = data.code || '';
          throw err;
        }
        return data;
      });
    });
  }

  /* ======================================================================
   * 模式探测
   * ==================================================================== */
  var ready = (function () {
    if (CFG.adapter === 'local') {
      LocalAdapter.init();
      mode = 'local';
      return Promise.resolve('local');
    }

    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 6000);

    return fetch(apiUrl('api/health'), {
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined,
      cache: 'no-store'
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || !data.ok) throw new Error('接口异常');
      mode = 'api';
      return 'api';
    }).catch(function (err) {
      clearTimeout(timer);
      apiError = (err && err.message) || String(err);
      LocalAdapter.init();
      mode = 'local';
      return 'local';
    });
  })();

  /* ======================================================================
   * 本机记录（两种模式都用）
   * ==================================================================== */
  function rememberMine(id, code) {
    var list = LocalAdapter.listMine();
    var found = false;
    list.forEach(function (m) { if (m.id === id) { m.code = code; found = true; } });
    if (!found) list.unshift({ id: id, code: code, at: Date.now() });
    LocalAdapter.saveMine(list.slice(0, 300));
  }
  function forgetMine(id) {
    LocalAdapter.saveMine(LocalAdapter.listMine().filter(function (m) { return m.id !== id; }));
  }
  function checkCode(doc, code) {
    if (!doc || !doc.editCodeHash) return false;
    return U.sha256Hex(String(code || '').trim().toUpperCase()) === doc.editCodeHash;
  }

  /** 对外输出的字段：和在线模式保持一致，绝不包含编辑码哈希和审核备注 */
  function toPublic(doc) {
    if (!doc) return doc;
    var out = {};
    Object.keys(doc).forEach(function (k) {
      if (k === 'editCodeHash' || k === 'reviewNote') return;
      out[k] = doc[k];
    });
    return out;
  }

  /* ======================================================================
   * 对外接口
   * ==================================================================== */
  var store = {
    REVIEW: REVIEW,
    STATUS: STATUS,
    STATUS_TEXT: { no: '否', contacting: '正在联系中', partial: '未出完', yes: '是', unknown: '未注明' },
    REVIEW_TEXT: { pending: '待审核', approved: '已通过', rejected: '未通过' },

    ready: ready,
    get mode() { return mode; },
    get isLocal() { return mode === 'local'; },
    get apiError() { return apiError; },

    /* ---------------- 二手教材 ---------------- */

    listPublicBooks: function () {
      if (mode === 'api') {
        return apiFetch('api/books').then(function (r) { return r.books || []; });
      }
      return Promise.resolve(LocalAdapter.listBooks()
        .filter(function (b) { return b.review === REVIEW.APPROVED; })
        .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })
        .map(toPublic));
    },

    listAllBooks: function () {
      if (mode === 'api') {
        if (!store.adminToken()) return Promise.reject(new Error('需要先登录后台'));
        return apiFetch('api/admin/books', { token: store.adminToken() })
          .then(function (r) { return r.books || []; });
      }
      return Promise.resolve(LocalAdapter.listBooks());
    },

    getBook: function (id) {
      if (mode === 'api') return Promise.resolve(null);
      var b = LocalAdapter.getBook(id);
      return Promise.resolve(b || null);
    },

    createBook: function (payload) {
      if (mode === 'api') {
        return apiFetch('api/books', {
          method: 'POST',
          body: {
            qq: payload.qq,
            major: payload.major,
            terms: payload.terms,
            books: payload.books,
            status: payload.status,
            note: payload.note,
            startedAt: payload.startedAt,
            website: payload.website || '',
            turnstileToken: payload.turnstileToken || ''
          }
        }).then(function (r) {
          rememberMine(r.id, r.editCode);
          return { id: r.id, editCode: r.editCode };
        });
      }
      /* ---- 离线模式 ---- */
      var editCode = U.randomCode(8);
      var now = Date.now();
      var doc = {
        id: U.randomId('bk_'),
        createdAt: now, updatedAt: now,
        qqBlob: U.obfuscate(payload.qq),
        major: payload.major || '',
        terms: payload.terms || [],
        books: payload.books || [],
        status: payload.status || STATUS.NO,
        note: payload.note || '',
        review: REVIEW.PENDING,
        reviewNote: '',
        needsReview: false,
        reviewedAt: null,
        editCodeHash: U.sha256Hex(editCode),
        origin: 'user'
      };
      LocalAdapter.saveBook(doc);
      rememberMine(doc.id, editCode);
      return Promise.resolve({ id: doc.id, editCode: editCode });
    },

    /**
     * 修改一条记录
     * @param opts { actor:'owner'|'submitter', editCode, token }
     */
    updateBook: function (id, patch, opts) {
      opts = opts || {};
      if (mode === 'api') {
        var body = Object.assign({}, patch);
        if (opts.editCode) body.editCode = opts.editCode;
        return apiFetch('api/books/' + encodeURIComponent(id) + '/update', {
          method: 'POST', body: body, token: opts.token || store.adminToken()
        }).then(function (r) { return r.book; });
      }
      /* ---- 离线模式 ---- */
      var doc = LocalAdapter.getBook(id);
      if (!doc) return Promise.reject(new Error('找不到这条记录，可能已被删除。'));
      if (opts.actor === 'submitter' && !checkCode(doc, opts.editCode)) {
        return Promise.reject(new Error('编辑码不正确，无法修改。'));
      }
      var contentFields = ['major', 'terms', 'books', 'note'];
      var contentChanged = false;
      Object.keys(patch).forEach(function (k) {
        if (k === 'status' && opts.actor === 'owner') return;      // 站主改不了状态
        if (k === 'review' && opts.actor === 'submitter') return;  // 本人改不了审核状态
        if (k === 'qq' || k === 'qqBlob') {
          var blob = (k === 'qq') ? U.obfuscate(patch.qq) : patch.qqBlob;
          if (blob !== doc.qqBlob) { doc.qqBlob = blob; contentChanged = true; }
          return;
        }
        if (JSON.stringify(doc[k]) !== JSON.stringify(patch[k])) {
          if (contentFields.indexOf(k) >= 0) contentChanged = true;
          doc[k] = patch[k];
        }
      });
      if (opts.actor === 'submitter' && contentChanged) doc.needsReview = true;
      if (opts.actor === 'owner' && patch.review !== undefined) {
        doc.reviewedAt = Date.now();
        if (patch.review === REVIEW.APPROVED) doc.needsReview = false;
      }
      doc.updatedAt = Date.now();
      LocalAdapter.saveBook(doc);
      return Promise.resolve(toPublic(doc));
    },

    deleteBook: function (id, opts) {
      opts = opts || {};
      if (mode === 'api') {
        return apiFetch('api/books/' + encodeURIComponent(id) + '/delete', {
          method: 'POST',
          body: { editCode: opts.editCode || '' },
          token: opts.token || store.adminToken()
        }).then(function () { forgetMine(id); return true; });
      }
      var doc = LocalAdapter.getBook(id);
      if (!doc) return Promise.reject(new Error('找不到这条记录。'));
      if (opts.actor === 'submitter' && !checkCode(doc, opts.editCode)) {
        return Promise.reject(new Error('编辑码不正确，无法删除。'));
      }
      LocalAdapter.deleteBook(id);
      forgetMine(id);
      return Promise.resolve(true);
    },

    /* ---------------- 我发布的 ---------------- */
    listMine: function () { return Promise.resolve(LocalAdapter.listMine() || []); },

    /** 用 ID + 编辑码取回一条记录（换设备时用） */
    lookup: function (id, code) {
      if (mode === 'api') {
        return apiFetch('api/books/lookup', {
          method: 'POST', body: { id: id, editCode: String(code || '').toUpperCase() }
        }).then(function (r) {
          rememberMine(r.book.id, String(code).toUpperCase());
          return r.book;
        });
      }
      var doc = LocalAdapter.getBook(id);
      if (!doc) return Promise.reject(new Error('找不到 ID 为 ' + id + ' 的记录。'));
      if (!checkCode(doc, code)) return Promise.reject(new Error('编辑码不正确。'));
      rememberMine(doc.id, String(code).toUpperCase());
      return Promise.resolve(toPublic(doc));
    },

    /** 取回自己所有的记录（本机记着 id + 编辑码） */
    listMyBooks: function () {
      return store.listMine().then(function (mines) {
        if (!mines.length) return [];
        return Promise.all(mines.map(function (m) {
          return store.lookup(m.id, m.code)
            .then(function (book) { return { mine: m, book: book }; })
            .catch(function () { return { mine: m, book: null }; });
        }));
      });
    },

    /* ---------------- 意见建议 ---------------- */
    createSuggestion: function (payload) {
      if (mode === 'api') {
        return apiFetch('api/suggestions', {
          method: 'POST',
          body: {
            category: payload.category,
            content: payload.content,
            page: payload.page,
            startedAt: payload.startedAt,
            website: payload.website || '',
            turnstileToken: payload.turnstileToken || ''
          }
        }).then(function (r) { return r.id; });
      }
      var doc = {
        id: U.randomId('sg_'),
        createdAt: Date.now(),
        category: payload.category || '其他',
        content: payload.content,
        page: payload.page || '',
        handled: false,
        adminReply: ''
      };
      LocalAdapter.saveSuggestion(doc);
      return Promise.resolve(doc.id);
    },

    listSuggestions: function () {
      if (mode === 'api') {
        if (!store.adminToken()) return Promise.reject(new Error('需要先登录后台'));
        return apiFetch('api/admin/suggestions', { token: store.adminToken() })
          .then(function (r) { return r.suggestions || []; });
      }
      return Promise.resolve(LocalAdapter.listSuggestions().slice().sort(function (a, b) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }));
    },

    updateSuggestion: function (id, patch) {
      if (mode === 'api') {
        return apiFetch('api/admin/suggestions/' + encodeURIComponent(id), {
          method: 'POST', body: patch, token: store.adminToken()
        }).then(function () { return true; });
      }
      var doc = null;
      LocalAdapter.listSuggestions().forEach(function (s) { if (s.id === id) doc = s; });
      if (!doc) return Promise.reject(new Error('找不到该建议。'));
      Object.keys(patch || {}).forEach(function (k) { doc[k] = patch[k]; });
      LocalAdapter.saveSuggestion(doc);
      return Promise.resolve(doc);
    },

    deleteSuggestion: function (id) {
      if (mode === 'api') {
        return apiFetch('api/admin/suggestions/' + encodeURIComponent(id), {
          method: 'DELETE', token: store.adminToken()
        }).then(function () { return true; });
      }
      LocalAdapter.deleteSuggestion(id);
      return Promise.resolve(true);
    },

    /* ---------------- 内容覆盖 ---------------- */
    saveContent: function (key, value) {
      if (mode === 'api') {
        return apiFetch('api/admin/content/' + encodeURIComponent(key), {
          method: 'PUT', body: { value: value }, token: store.adminToken()
        }).then(function () {
          if (window.ENPO_DATA) window.ENPO_DATA[key] = value;
          return true;
        });
      }
      // 离线模式：存在本机，只有自己这台设备能看到
      U.storage.setJSON('content.' + key, value);
      if (window.ENPO_DATA) window.ENPO_DATA[key] = value;
      return Promise.resolve(true);
    },

    resetContent: function (key) {
      if (mode === 'api') {
        return apiFetch('api/admin/content/' + encodeURIComponent(key), {
          method: 'DELETE', token: store.adminToken()
        }).then(function () { return true; });
      }
      U.storage.remove('content.' + key);
      return Promise.resolve(true);
    },

    /** 离线模式启动时把本机存的内容覆盖读回来 */
    loadLocalContent: function () {
      if (mode !== 'local' || !window.ENPO_DATA) return;
      ENPO.content.ALL_KEYS.forEach(function (k) {
        var v = U.storage.getJSON('content.' + k, null);
        if (v !== null && window.ENPO_DATA[k] !== undefined) window.ENPO_DATA[k] = v;
      });
    },

    /* ---------------- 后台登录 ---------------- */
    adminToken: function () {
      var token = U.storage.get(KEY_TOKEN);
      var exp = Number(U.storage.get(KEY_TOKEN_EXP) || 0);
      if (!token) return '';
      if (exp && Date.now() > exp) { U.storage.remove(KEY_TOKEN); U.storage.remove(KEY_TOKEN_EXP); return ''; }
      return token;
    },

    adminLogin: function (password) {
      if (mode === 'api') {
        return apiFetch('api/admin/login', { method: 'POST', body: { password: password } })
          .then(function (r) {
            U.storage.set(KEY_TOKEN, r.token);
            U.storage.set(KEY_TOKEN_EXP, String(r.expiresAt || (Date.now() + 12 * 3600 * 1000)));
            return true;
          });
      }
      /* ---- 离线模式：用 config.js 里的口令哈希校验 ---- */
      var hash = U.sha256Hex(String(CFG.adminSalt || '') + String(password));
      if (hash !== CFG.adminPasswordHash) {
        return Promise.reject(new Error('口令不正确。'));
      }
      U.storage.set(KEY_TOKEN, 'offline-token');
      U.storage.set(KEY_TOKEN_EXP, String(Date.now() + (CFG.adminSessionHours || 12) * 3600 * 1000));
      return Promise.resolve(true);
    },

    adminLogout: function () {
      var token = store.adminToken();
      U.storage.remove(KEY_TOKEN);
      U.storage.remove(KEY_TOKEN_EXP);
      if (mode === 'api' && token) {
        return apiFetch('api/admin/logout', { method: 'POST', token: token })
          .catch(function () { return true; });
      }
      return Promise.resolve(true);
    },

    isAdmin: function () { return !!store.adminToken(); },

    /* ---------------- 统计 / 维护 ---------------- */
    stats: function () {
      return store.listAllBooks().then(function (list) {
        var s = { total: list.length, pending: 0, approved: 0, rejected: 0, needsReview: 0, sold: 0, available: 0 };
        list.forEach(function (b) {
          if (b.review === REVIEW.PENDING) s.pending++;
          else if (b.review === REVIEW.APPROVED) s.approved++;
          else if (b.review === REVIEW.REJECTED) s.rejected++;
          if (b.needsReview) s.needsReview++;
          if (b.status === STATUS.YES) s.sold++; else s.available++;
        });
        return s;
      });
    },

    exportAll: function () {
      return Promise.all([
        store.listAllBooks().catch(function () { return []; }),
        store.listSuggestions().catch(function () { return []; })
      ]).then(function (r) {
        return {
          exportedAt: new Date().toISOString(),
          version: 2,
          books: r[0],
          suggestions: r[1]
        };
      });
    },

    resetSeed: function () {
      if (mode === 'api') {
        return apiFetch('api/admin/reset-seed', { method: 'POST', token: store.adminToken() })
          .then(function (r) { return r.removed; });
      }
      var kept = LocalAdapter.listBooks().filter(function (b) { return b.origin !== 'seed'; });
      LocalAdapter.replaceBooks(kept);
      return Promise.resolve(true);
    },

    /** 把 data/seed-books.js 里的初始数据导入云端（首次部署后点一次即可） */
    importSeed: function () {
      var seed = (window.ENPO_DATA && window.ENPO_DATA.seedBooks) || [];
      if (!seed.length) return Promise.resolve(0);
      if (mode === 'api') {
        return apiFetch('api/admin/import-seed', {
          method: 'POST', body: { books: seed }, token: store.adminToken()
        }).then(function (r) { return r.imported; });
      }
      var existing = LocalAdapter.listBooks();
      var ids = {};
      existing.forEach(function (b) { ids[b.id] = 1; });
      var added = 0;
      seed.forEach(function (b) { if (!ids[b.id]) { existing.push(b); added++; } });
      LocalAdapter.replaceBooks(existing);
      return Promise.resolve(added);
    },

    resetEverything: function () {
      [KEY_BOOKS, KEY_SUGGEST, KEY_MINE, KEY_SEEDED].forEach(function (k) { U.storage.remove(k); });
      LocalAdapter.init();
      return Promise.resolve(true);
    }
  };

  ENPO.store = store;

  /* 离线模式下把本机保存的内容覆盖读回来 */
  ready.then(function () { store.loadLocalContent(); });
})();
