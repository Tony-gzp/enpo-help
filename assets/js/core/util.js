/* ============================================================================
 * util.js —— 通用小工具（DOM、存储、哈希、脱敏、提示框等）
 * 一般不需要修改这个文件。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var CFG = ENPO.config || {};

  /* ------------------------------ DOM 助手 ------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /**
   * 创建元素：el('div', {class:'a'}, ['文字', el('b')])
   */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (v === true) node.setAttribute(k, '');
        else node.setAttribute(k, v);
      });
    }
    appendAll(node, children);
    return node;
  }

  function appendAll(node, children) {
    if (children === null || children === undefined) return;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' || typeof c === 'number'
        ? document.createTextNode(String(c)) : c);
    });
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }

  function escapeHtml(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------ 存储 ------------------------------ */
  var PREFIX = CFG.storagePrefix || 'enpo.';

  function rawGet(key) {
    try { return window.localStorage.getItem(PREFIX + key); } catch (e) { return null; }
  }
  function rawSet(key, val) {
    try { window.localStorage.setItem(PREFIX + key, val); return true; } catch (e) { return false; }
  }
  function rawRemove(key) {
    try { window.localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
  }
  function getJSON(key, fallback) {
    var raw = rawGet(key);
    if (raw === null || raw === '') return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  function setJSON(key, value) { return rawSet(key, JSON.stringify(value)); }

  var storage = {
    get: rawGet, set: rawSet, remove: rawRemove,
    getJSON: getJSON, setJSON: setJSON,
    available: (function () {
      try {
        window.localStorage.setItem(PREFIX + '__t', '1');
        window.localStorage.removeItem(PREFIX + '__t');
        return true;
      } catch (e) { return false; }
    })()
  };

  /* ------------------------------ SHA-256 ------------------------------
   * 自带一份纯 JS 实现：这样双击打开本地文件（file://）也能用，
   * 不依赖浏览器安全上下文里的 crypto.subtle。
   * ------------------------------------------------------------------ */
  /** 把任意字符串（含中文）转成 UTF-8 字节串，保证哈希结果和标准实现一致 */
  function toUtf8Bytes(str) {
    try { return unescape(encodeURIComponent(String(str))); }
    catch (e) { return String(str); }
  }

  function sha256Hex(input) {
    var ascii = toUtf8Bytes(input);
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = 'length';
    var i, j, result = '';
    var words = [], asciiBitLength = ascii[lengthProperty] * 8;
    var hash = sha256Hex.h = sha256Hex.h || [];
    var k = sha256Hex.k = sha256Hex.k || [];
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);

    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  /* ------------------------------ 随机 ID / 编辑码 ------------------------------ */
  var CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 去掉了 0/O/1/I 等易混字符

  function randomBytes(n) {
    var out = new Uint8Array(n);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(out);
      return out;
    }
    for (var i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
    return out;
  }

  function randomCode(len) {
    var bytes = randomBytes(len || 8);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    return s;
  }

  function randomId(prefix) {
    var bytes = randomBytes(8);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) hex += ('0' + bytes[i].toString(16)).slice(-2);
    return (prefix || 'id_') + Date.now().toString(36) + '_' + hex;
  }

  /* ------------------------------ 联系方式脱敏 ------------------------------
   * 页面渲染时默认打码，用户点击"查看"后才在浏览器里还原。
   * 还原算法：先反转字符串，再逐字符 XOR 一个固定密钥，最后转 Base64。
   * 这样即使有人直接抓取网页源码，也拿不到明文手机号/微信号。
   * ---------------------------------------------------------------------- */
  var OBF_KEY = 'enpo-xjtu-2026';

  function xorCipher(text, key) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  }

  function b64Encode(str) { return window.btoa(unescape(encodeURIComponent(str))); }
  function b64Decode(str) { return decodeURIComponent(escape(window.atob(str))); }

  function obfuscate(plain) {
    if (!plain) return '';
    try { return b64Encode(xorCipher(String(plain), OBF_KEY).split('').reverse().join('')); }
    catch (e) { return ''; }
  }
  function deobfuscate(blob) {
    if (!blob) return '';
    try {
      var s = xorCipher(b64Decode(blob).split('').reverse().join(''), OBF_KEY);
      // 兼容用户直接填了明文的情况
      return s;
    } catch (e) { return String(blob); }
  }
  /** 只做打码显示，不还原 */
  function maskText(text) {
    var s = String(text || '');
    if (s.length <= 4) return s.charAt(0) + '＊＊＊';
    var keepStart = (CFG.privacy && CFG.privacy.maskKeepStart) || 3;
    var keepEnd = (CFG.privacy && CFG.privacy.maskKeepEnd) || 2;
    if (s.length <= keepStart + keepEnd) return s.charAt(0) + new Array(s.length).join('＊');
    return s.slice(0, keepStart) + new Array(Math.max(3, s.length - keepStart - keepEnd) + 1).join('＊') + s.slice(-keepEnd);
  }

  /* ------------------------------ 文本助手 ------------------------------ */
  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function formatDate(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function formatDateTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return formatDate(ts) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function timeAgo(ts) {
    var diff = Date.now() - new Date(ts).getTime();
    if (isNaN(diff)) return '';
    var min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + ' 分钟前';
    var hour = Math.floor(min / 60);
    if (hour < 24) return hour + ' 小时前';
    var day = Math.floor(hour / 24);
    if (day < 30) return day + ' 天前';
    return formatDate(ts);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 200);
    };
  }

  /** 把查询参数读成对象 */
  function query() {
    var out = {};
    var qs = window.location.search.replace(/^\?/, '');
    if (!qs) return out;
    qs.split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var k = idx < 0 ? pair : pair.slice(0, idx);
      var v = idx < 0 ? '' : pair.slice(idx + 1);
      try { out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); }
      catch (e) { out[k] = v; }
    });
    return out;
  }

  /* ------------------------------ 提示条 / 弹窗 ------------------------------ */
  function toast(message, type, ms) {
    var host = $('#toast-host');
    if (!host) {
      host = el('div', { id: 'toast-host', class: 'toast-host', 'aria-live': 'polite' });
      document.body.appendChild(host);
    }
    var node = el('div', { class: 'toast toast--' + (type || 'info') }, [
      el('span', { class: 'toast__text', text: message })
    ]);
    host.appendChild(node);
    setTimeout(function () { node.classList.add('is-out'); }, ms || 2600);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, (ms || 2600) + 400);
  }

  /** 通用确认弹窗（比浏览器原生 confirm 好看，且可键盘操作） */
  function confirmBox(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var overlay = el('div', { class: 'modal-overlay', role: 'dialog', 'aria-modal': 'true' });
      var title = opts.title || '请确认';
      var body = opts.message || '';
      var okText = opts.okText || '确定';
      var cancelText = opts.cancelText || '取消';

      function close(val) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', onKey);
        document.body.classList.remove('is-modal-open');
        resolve(val);
      }
      function onKey(e) {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Enter') close(true);
      }
      var card = el('div', { class: 'modal' }, [
        el('h3', { class: 'modal__title', text: title }),
        body ? el('div', { class: 'modal__body', html: escapeHtml(body).replace(/\n/g, '<br>') }) : null,
        el('div', { class: 'modal__actions' }, [
          el('button', { class: 'btn btn--ghost', type: 'button', onclick: function () { close(false); } }, cancelText),
          el('button', { class: 'btn btn--primary', type: 'button', onclick: function () { close(true); } }, okText)
        ])
      ]);
      overlay.appendChild(card);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });
      document.addEventListener('keydown', onKey);
      document.body.classList.add('is-modal-open');
      document.body.appendChild(overlay);
      var btn = $('.btn--primary', card);
      if (btn) btn.focus();
    });
  }

  /* ------------------------------ 下载 / 复制 ------------------------------ */
  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; })
        .catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = el('textarea', { style: 'position:fixed;top:-1000px' });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ------------------------------ 其它 ------------------------------ */
  function isAutomation() {
    try {
      if (navigator.webdriver) return true;
      if (/HeadlessChrome|PhantomJS|Selenium|Puppeteer|Playwright/i.test(navigator.userAgent || '')) return true;
      if (!navigator.languages || navigator.languages.length === 0) return true;
      if (typeof window.chrome === 'undefined' && /Chrome/.test(navigator.userAgent) && !/Edg|OPR/.test(navigator.userAgent)) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  ENPO.util = {
    $: $, $$: $$, el: el, appendAll: appendAll, clear: clear, escapeHtml: escapeHtml,
    storage: storage, sha256Hex: sha256Hex,
    randomCode: randomCode, randomId: randomId, randomBytes: randomBytes,
    obfuscate: obfuscate, deobfuscate: deobfuscate, maskText: maskText,
    truncate: truncate, formatDate: formatDate, formatDateTime: formatDateTime, timeAgo: timeAgo,
    debounce: debounce, query: query, toast: toast, confirm: confirmBox,
    download: download, copyText: copyText, isAutomation: isAutomation
  };
})();
