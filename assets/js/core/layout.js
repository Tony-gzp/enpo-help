/* ============================================================================
 * layout.js —— 全站统一的页头、页脚、日夜模式、移动端导航
 * ----------------------------------------------------------------------------
 * 每个页面只要写：
 *     <header id="app-header"></header>
 *     ...
 *     <footer id="app-footer"></footer>
 * 这个文件会自动把标题栏、导航按钮、页脚填进去。
 * 导航条目在 data/site.js 的 nav 数组里，增删改都在那里。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var CFG = ENPO.config || {};
  var el = U.el, $ = U.$, $$ = U.$$;

  var THEME_KEY = 'theme';

  /* ------------------------------ 日夜模式 ------------------------------ */
  function currentTheme() {
    var saved = U.storage.get(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) { /* ignore */ }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d1117' : '#0a4a9e');
    $$('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到白天模式' : '切换到黑夜模式');
      btn.setAttribute('title', theme === 'dark' ? '切换到白天模式' : '切换到黑夜模式');
      var icon = btn.querySelector('.theme-toggle__icon');
      var label = btn.querySelector('.theme-toggle__label');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      if (label) label.textContent = theme === 'dark' ? '白天' : '黑夜';
    });
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    U.storage.set(THEME_KEY, next);
    applyTheme(next);
    return next;
  }

  /* ------------------------------ 导航数据 ------------------------------ */
  function navItems() {
    var data = (window.ENPO_DATA && window.ENPO_DATA.nav) || [];
    return data.slice();
  }

  function isActive(item, page) {
    if (item.match) return item.match.indexOf(page) >= 0;
    return item.key === page;
  }

  /* ------------------------------ 页头 ------------------------------ */
  function buildHeader() {
    var host = $('#app-header');
    if (!host) return;
    var page = document.body.getAttribute('data-page') || '';
    var items = navItems();
    var inline = items.filter(function (i) { return i.inHeader; });
    var title = CFG.siteName || '本科生互助网站';

    var brand = el('a', { class: 'brand', href: CFG.homePage || 'home.html', 'aria-label': '返回首页' }, [
      el('span', { class: 'brand__logo', 'aria-hidden': 'true' }, [
        (function () {
          var img = el('img', { src: 'assets/img/logo.svg', alt: '', width: '36', height: '36' });
          return img;
        })()
      ]),
      el('span', { class: 'brand__text' }, [
        el('span', { class: 'brand__short', text: CFG.shortName || '能动互助站' }),
        el('span', { class: 'brand__full', text: title })
      ])
    ]);

    var nav = el('nav', { class: 'nav', id: 'primary-nav', 'aria-label': '主导航' },
      inline.map(function (item) {
        return el('a', {
          class: 'nav__link' + (isActive(item, page) ? ' is-active' : ''),
          href: item.href,
          'aria-current': isActive(item, page) ? 'page' : null
        }, item.short || item.title);
      })
    );

    var themeBtn = el('button', {
      class: 'icon-btn theme-toggle', type: 'button',
      onclick: function () {
        var t = toggleTheme();
        U.toast(t === 'dark' ? '已切换到黑夜模式 🌙' : '已切换到白天模式 ☀️', 'info', 1600);
      }
    }, [
      el('span', { class: 'theme-toggle__icon', 'aria-hidden': 'true', text: '🌙' }),
      el('span', { class: 'theme-toggle__label', text: '黑夜' })
    ]);

    var menuBtn = el('button', {
      class: 'icon-btn menu-btn', type: 'button',
      'aria-controls': 'mobile-nav', 'aria-expanded': 'false',
      'aria-label': '打开菜单',
      onclick: function () { toggleMenu(); }
    }, [
      el('span', { class: 'menu-btn__bar', 'aria-hidden': 'true' }),
      el('span', { class: 'menu-btn__bar', 'aria-hidden': 'true' }),
      el('span', { class: 'menu-btn__bar', 'aria-hidden': 'true' })
    ]);

    U.clear(host);
    host.className = 'site-header';
    host.appendChild(el('div', { class: 'site-header__inner container' }, [
      brand,
      el('div', { class: 'site-header__actions' }, [nav, themeBtn, menuBtn])
    ]));

    /* ------- 移动端展开菜单：包含所有条目（含"我的发布"和"管理后台"） ------- */
    var panel = el('div', { class: 'mobile-nav', id: 'mobile-nav', hidden: true }, [
      el('div', { class: 'mobile-nav__inner container' }, [
        el('p', { class: 'mobile-nav__title', text: '全部功能' }),
        el('div', { class: 'mobile-nav__grid' }, items.map(function (item) {
          return el('a', {
            class: 'mobile-nav__item' + (isActive(item, page) ? ' is-active' : ''),
            href: item.href
          }, [
            el('span', { class: 'mobile-nav__icon', 'aria-hidden': 'true', text: item.icon || '•' }),
            el('span', { class: 'mobile-nav__body' }, [
              el('span', { class: 'mobile-nav__name', text: item.title }),
              item.desc ? el('span', { class: 'mobile-nav__desc', text: item.desc }) : null
            ])
          ]);
        })),
        el('div', { class: 'mobile-nav__foot' }, [
          el('a', { class: 'link-quiet', href: (CFG.welcomePage || 'index.html') + '?welcome=1' }, '查看免责声明'),
          el('span', { class: 'dot-sep', 'aria-hidden': 'true', text: '·' }),
          el('a', { class: 'link-quiet', href: 'admin.html' }, '站主入口')
        ])
      ])
    ]);
    document.body.appendChild(panel);

    var themeBtn2 = themeBtn.cloneNode(true);
    themeBtn2.addEventListener('click', function () {
      var t = toggleTheme();
      U.toast(t === 'dark' ? '已切换到黑夜模式 🌙' : '已切换到白天模式 ☀️', 'info', 1600);
    });
    panel.querySelector('.mobile-nav__foot').insertBefore(themeBtn2, panel.querySelector('.mobile-nav__foot').firstChild);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', U.debounce(function () {
      if (window.innerWidth > 1040) closeMenu();
    }, 200));
    applyTheme(currentTheme());
  }

  function toggleMenu() {
    var panel = $('#mobile-nav');
    if (!panel) return;
    if (panel.hidden) openMenu(); else closeMenu();
  }
  function openMenu() {
    var panel = $('#mobile-nav');
    var btn = $('.menu-btn');
    if (!panel) return;
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    document.body.classList.add('is-menu-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    var panel = $('#mobile-nav');
    var btn = $('.menu-btn');
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 200);
  }

  /* ------------------------------ 页脚 ------------------------------ */
  function buildFooter() {
    var host = $('#app-footer');
    if (!host) return;
    var disclaimer = (window.ENPO_DATA && window.ENPO_DATA.site && window.ENPO_DATA.site.disclaimer) || {};
    var summary = disclaimer.footer || '本站为同学自发建立的民间互助平台，与学校及学院官方无隶属关系。站内信息由用户自行发布，仅供参考。';

    U.clear(host);
    host.className = 'site-footer';
    host.appendChild(el('div', { class: 'container site-footer__inner' }, [
      el('div', { class: 'site-footer__main' }, [
        el('h2', { class: 'site-footer__title', text: '免责声明' }),
        el('p', { class: 'site-footer__text', text: summary }),
        el('p', { class: 'site-footer__text site-footer__text--muted' },
          '联系方式由发布者自愿提供，仅用于本校同学之间的学习交流，禁止用于广告推销、骚扰或任何商业用途。如发现不当信息，请通过「意见建议」告知站主删除。')
      ]),
      el('div', { class: 'site-footer__side' }, [
        el('nav', { class: 'site-footer__links', 'aria-label': '页脚导航' }, [
          el('a', { href: CFG.homePage || 'home.html' }, '首页'),
          el('a', { href: 'books.html' }, '二手教材'),
          el('a', { href: 'suggest.html' }, '意见建议'),
          el('a', { href: (CFG.welcomePage || 'index.html') + '?welcome=1' }, '完整免责声明'),
          el('a', { href: 'admin.html', rel: 'nofollow' }, '站主入口')
        ]),
        CFG.showUpdatedAt ? el('p', { class: 'site-footer__meta' }, [
          '版本 ' + (CFG.version || '1.0') + ' · 更新于 ' + (CFG.updatedAt || '')
        ]) : null
      ])
    ]));
  }

  /* ------------------------------ 回到顶部 ------------------------------ */
  function buildBackTop() {
    if (document.body.hasAttribute('data-no-backtop')) return;
    var btn = el('button', {
      class: 'back-top', type: 'button', 'aria-label': '回到顶部', hidden: true,
      onclick: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    }, '↑');
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.hidden = window.scrollY < 500;
    }, { passive: true });
  }

  /* ------------------------------ 防嵌套（防止别人把你的网站塞进 iframe） ------------------------------ */
  function framebust() {
    try {
      if (window.top !== window.self) {
        window.top.location.href = window.self.location.href;
      }
    } catch (e) { /* 跨域时忽略 */ }
  }

  /* ------------------------------ 离线模式提示条 ------------------------------ */
  function buildOfflineBanner() {
    if (!ENPO.store || !ENPO.store.isLocal) return;
    if (document.body.getAttribute('data-page') === 'welcome') return;

    var header = $('#app-header');
    if (!header || header.nextSibling && header.nextSibling.id === 'offline-banner') return;

    var banner = el('div', { class: 'offline-banner', id: 'offline-banner' }, [
      el('div', { class: 'container offline-banner__inner' }, [
        el('span', { 'aria-hidden': 'true', text: '⚠️' }),
        el('p', null, [
          el('strong', { text: '离线预览模式：' }),
          '目前数据只保存在你自己的浏览器里，其他同学看不到你提交的内容。'
        ]),
        el('button', {
          class: 'btn btn--tiny btn--ghost', type: 'button',
          onclick: function () { banner.parentNode.removeChild(banner); }
        }, '知道了')
      ])
    ]);
    header.parentNode.insertBefore(banner, header.nextSibling);
  }

  /* ------------------------------ 启动 ------------------------------ */
  function start() {
    applyTheme(currentTheme());   // 尽早应用，避免闪白
    buildHeader();
    buildFooter();
    buildBackTop();
    framebust();
    // 等数据层判断完"在线 / 离线"之后再决定要不要提示
    if (ENPO.ready) {
      ENPO.ready().then(buildOfflineBanner).catch(function () { /* 忽略 */ });
    }
  }

  ENPO.layout = {
    start: start,
    applyTheme: applyTheme,
    currentTheme: currentTheme,
    toggleTheme: toggleTheme
  };

  // 主题要在 CSS 渲染前尽快设好，所以 DOM 一就绪就先执行一次
  if (document.readyState === 'loading') {
    applyTheme(currentTheme());
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
