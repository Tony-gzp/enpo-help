/* ============================================================================
 * content.js —— 内容层
 * ----------------------------------------------------------------------------
 * 网站的文字内容有两层：
 *   1) 默认值：data/*.js 里的静态内容（跟着网站一起发布）
 *   2) 覆盖值：站主在后台改过的内容（存在云端数据库里，改完立即对所有人生效）
 *
 * 页面通过 ENPO.content.get('faq') 取值，拿到的永远是"合并后"的结果，
 * 所以页面代码不用关心内容到底来自哪一层。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util, CFG = ENPO.config;

  /* data/*.js 里出现的所有内容块 */
  var ALL_KEYS = ['site', 'nav', 'faq', 'links', 'generalEdu', 'plans', 'bookOptions', 'iconSet'];

  var state = {
    mode: 'loading',     // 'loading' | 'api' | 'local'
    overrides: {},
    error: ''
  };

  /** 只有页面真的加载了对应的 data/*.js 才去请求覆盖值，避免白跑一趟 */
  function keysOnThisPage() {
    return ALL_KEYS.filter(function (k) {
      return window.ENPO_DATA && window.ENPO_DATA[k] !== undefined;
    });
  }

  function apiUrl(path) {
    // 用相对地址，部署在子目录（例如 GitHub Pages 的 /enpo-help/）也能正常工作
    try { return new URL(path, window.location.href).href; }
    catch (e) { return path; }
  }

  var ready = (function () {
    // 页面没加载任何内容块（例如欢迎页只加载了 site）就不必请求
    var keys = keysOnThisPage();
    if (CFG.adapter === 'local' || !keys.length) {
      state.mode = 'local';
      return Promise.resolve(state);
    }

    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 6000);

    return fetch(apiUrl('api/content?keys=' + keys.join(',')), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined,
      cache: 'no-store'
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      clearTimeout(timer);
      if (!data || !data.ok) throw new Error('接口返回异常');
      state.overrides = data.content || {};
      state.mode = 'api';
      applyOverrides();
      return state;
    }).catch(function (err) {
      clearTimeout(timer);
      // 拿不到云端内容时，继续用 data/*.js 里的默认值，网站照样能看
      state.mode = 'local';
      state.error = (err && err.message) || String(err);
      return state;
    });
  })();

  function applyOverrides() {
    Object.keys(state.overrides).forEach(function (key) {
      var value = state.overrides[key];
      if (value === null || value === undefined) return;
      window.ENPO_DATA[key] = value;
    });
  }

  ENPO.content = {
    ready: ready,
    state: state,
    /** 取内容（已经合并过覆盖值） */
    get: function (key, fallback) {
      var v = window.ENPO_DATA ? window.ENPO_DATA[key] : undefined;
      return v === undefined ? fallback : v;
    },
    /** 这一块是不是被站主在后台改过 */
    isOverridden: function (key) {
      return Object.prototype.hasOwnProperty.call(state.overrides, key);
    },
    /** 把所有内容块打包（后台导出用） */
    snapshot: function (keys) {
      var out = {};
      (keys || ALL_KEYS).forEach(function (k) {
        if (window.ENPO_DATA && window.ENPO_DATA[k] !== undefined) out[k] = window.ENPO_DATA[k];
      });
      return out;
    },
    ALL_KEYS: ALL_KEYS
  };

  /** 页面脚本统一用这个：等两层内容都就绪后再渲染 */
  ENPO.ready = function () {
    var waits = [ready];
    if (ENPO.store && ENPO.store.ready) waits.push(ENPO.store.ready);
    return Promise.all(waits);
  };
})();
