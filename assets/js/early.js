/* ============================================================================
 * early.js —— 必须放在 <head> 最前面执行的"抢跑"脚本
 * ----------------------------------------------------------------------------
 * 只做两件事，但都很重要：
 *   1. 在页面画出任何东西之前就把白天/黑夜模式定好，避免黑夜模式用户
 *      每次打开页面都先闪一下白屏。
 *   2. 如果是老访客还打开了欢迎页，立刻跳到首页（避免看到一闪而过的免责声明）。
 *
 * 因为要"抢跑"，这个文件不能依赖 config.js，里面的键名是写死的：
 *   localStorage 的 'enpo.theme' 和 'enpo.visited'
 * 如果你在 config.js 里改了 storagePrefix，记得这里也要一起改。
 * ==========================================================================*/
(function () {
  'use strict';

  var THEME_KEY = 'enpo.theme';
  var VISIT_KEY = 'enpo.visited';

  /* ---------------- 1. 抢先应用主题 ---------------- */
  try {
    var theme = window.localStorage.getItem(THEME_KEY);
    if (theme !== 'light' && theme !== 'dark') {
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);

    // 顺便把浏览器地址栏的颜色也定好（手机浏览器上会看到）
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0f16' : '#0a4a9e');
  } catch (e) { /* 无痕模式等情况下忽略 */ }

  /* ---------------- 2. 老访客跳过欢迎页 ---------------- */
  try {
    var path = window.location.pathname;
    var isWelcomePage = /(\/|^)(index\.html)?$/.test(path);
    var forceWelcome = /[?&]welcome=1/.test(window.location.search);
    if (isWelcomePage && !forceWelcome && window.localStorage.getItem(VISIT_KEY)) {
      window.location.replace('home.html');
    }
  } catch (e) { /* 忽略 */ }
})();
