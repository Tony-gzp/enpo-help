/* ============================================================================
 * pages/gate.js —— 欢迎页 / 免责声明页
 * ----------------------------------------------------------------------------
 * 逻辑：
 *   1. 老访客（本机浏览过）直接跳到首页，不再看免责声明
 *   2. 新访客看到"网站标题 + 免责声明 + 进入按钮"
 *   3. 必须勾选"我已阅读"才能点进入（一次性的，不烦人）
 *   4. 地址后加 ?welcome=1 可以随时重新查看免责声明
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, CFG = ENPO.config, el = U.el, $ = U.$;
  var VISIT_KEY = 'visited';

  function init() {
    var q = U.query();
    var visited = U.storage.get(VISIT_KEY);

    // 老访客且不是主动查看免责声明 → 直接进首页
    if (visited && q.welcome !== '1') {
      window.location.replace(CFG.homePage || 'home.html');
      return;
    }
    render();
  }

  function render() {
    var site = (window.ENPO_DATA && window.ENPO_DATA.site) || {};
    var disc = site.disclaimer || {};

    document.title = CFG.siteName + ' · 免责声明与使用说明';

    /* ---------- 顶部日夜模式开关（欢迎页没有导航条，单独放一个） ---------- */
    var themeHost = $('.welcome__theme');
    if (themeHost) {
      var btn = el('button', {
        class: 'icon-btn theme-toggle', type: 'button',
        onclick: function () {
          var t = ENPO.layout.toggleTheme();
          U.toast(t === 'dark' ? '已切换到黑夜模式 🌙' : '已切换到白天模式 ☀️', 'info', 1600);
        }
      }, [
        el('span', { class: 'theme-toggle__icon', 'aria-hidden': 'true', text: '🌙' }),
        el('span', { class: 'theme-toggle__label', text: '黑夜' })
      ]);
      themeHost.appendChild(btn);
      ENPO.layout.applyTheme(ENPO.layout.currentTheme());
    }

    /* ---------- 免责声明正文 ---------- */
    var box = $('#disclaimer');
    if (box) {
      (disc.sections || []).forEach(function (sec) {
        box.appendChild(el('h3', { text: sec.title }));
        var ol = el('ol');
        (sec.items || []).forEach(function (line) { ol.appendChild(el('li', { text: line })); });
        box.appendChild(ol);
      });
    }

    /* ---------- 勾选 + 进入按钮 ---------- */
    var checkbox = $('#agree');
    var enterBtn = $('#enter-btn');
    var hint = $('#enter-hint');

    function sync() {
      if (!enterBtn) return;
      var ok = checkbox && checkbox.checked;
      enterBtn.disabled = !ok;
      enterBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
      if (hint) hint.textContent = ok ? '' : '请先勾选上方选项，再进入网站。';
    }

    if (checkbox) checkbox.addEventListener('change', sync);
    sync();

    if (enterBtn) {
      enterBtn.addEventListener('click', function () {
        if (!checkbox || !checkbox.checked) { sync(); return; }
        U.storage.set(VISIT_KEY, '1');
        window.location.href = CFG.homePage || 'home.html';
      });
    }

    /* ---------- 页脚信息 ---------- */
    var foot = $('#welcome-foot');
    if (foot) {
      foot.textContent = '版本 ' + (CFG.version || '') + ' · 更新于 ' + (CFG.updatedAt || '') +
        ' · 继续使用即表示你已阅读并同意上述全部内容';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
