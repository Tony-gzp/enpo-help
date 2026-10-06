/* ============================================================================
 * pages/home.js —— 导航页（首页）
 * 布局：标题 → 各模块跳转按钮（带一句介绍）→ 底部免责声明
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, CFG = ENPO.config, S = ENPO.store;
  var el = U.el, $ = U.$;

  function init() {
    var site = ENPO.content.get('site', {});
    var nav = ENPO.content.get('nav', []);

    /* ---------------- 顶部标题区 ---------------- */
    var hero = $('#home-hero');
    if (hero) {
      hero.appendChild(el('h1', { class: 'hero__title', text: CFG.siteName }));
      hero.appendChild(el('p', { class: 'hero__subtitle', text: site.tagline || '' }));
      hero.appendChild(el('p', { class: 'hero__subtitle', text: site.intro || '' }));

      hero.appendChild(el('div', { class: 'hero__meta' }, [
        UI.badge('📱 手机 / 电脑都能用', 'brand'),
        UI.badge('🌙 支持日间 / 夜间模式', 'brand'),
        UI.badge('🔒 QQ 号默认打码', 'success'),
        UI.badge('🙋 民间非官方', 'muted')
      ]));

      /* ---------------- 实时数据小结 ---------------- */
      var statHost = el('div', { class: 'stat-row', style: 'margin-top:1.6rem;text-align:left' });
      hero.appendChild(statHost);
      S.listPublicBooks().then(function (list) {
        var available = list.filter(function (b) { return b.status !== 'yes'; }).length;
        var bookCount = list.reduce(function (n, b) { return n + (b.books || []).length; }, 0);
        U.clear(statHost);
        statHost.appendChild(el('div', { class: 'stat stat--brand' }, [
          el('div', { class: 'stat__num', text: String(list.length) }),
          el('div', { class: 'stat__label', text: '出书信息（条）' })
        ]));
        statHost.appendChild(el('div', { class: 'stat stat--success' }, [
          el('div', { class: 'stat__num', text: String(available) }),
          el('div', { class: 'stat__label', text: '还能联系（条）' })
        ]));
        statHost.appendChild(el('div', { class: 'stat' }, [
          el('div', { class: 'stat__num', text: String(bookCount) }),
          el('div', { class: 'stat__label', text: '被登记的书（本）' })
        ]));
      }).catch(function () { /* 拿不到就不显示 */ });
    }

    /* ---------------- 模块入口卡片 ---------------- */
    var grid = $('#module-grid');
    if (grid) {
      var cards = nav.filter(function (item) {
        return item.key !== 'home' && item.key !== 'admin';
      });
      cards.forEach(function (item) {
        grid.appendChild(el('a', { class: 'module-card', href: item.href }, [
          el('div', { class: 'module-card__head' }, [
            el('span', { class: 'module-card__icon', 'aria-hidden': 'true', text: item.icon || '📄' }),
            el('h2', { class: 'module-card__title', text: item.title })
          ]),
          el('p', { class: 'module-card__desc', text: item.desc || '' }),
          el('div', { class: 'module-card__foot' }, [
            el('span', { text: '进入' }),
            el('span', { 'aria-hidden': 'true', text: '→' })
          ])
        ]));
      });
    }

    /* ---------------- 培养方案快捷入口 ---------------- */
    var quick = $('#quick-plans');
    if (quick) {
      quick.appendChild(el('p', { class: 'section__desc', text: '直接跳到对应年级的培养方案与教材：' }));
      quick.appendChild(el('div', { class: 'year-switch' }, ['2026', '2025', '2024'].map(function (y) {
        return el('a', { href: 'plan-' + y + '.html' }, y + ' 级');
      })));
    }

    /* ---------------- 底部免责声明 ---------------- */
    var discHost = $('#home-disclaimer');
    if (discHost) {
      var disc = (site.disclaimer && site.disclaimer.footer) || '';
      discHost.appendChild(UI.notice('⚠️', [disc], 'warn'));
      discHost.appendChild(el('p', { style: 'margin-top:.9rem;font-size:.85rem;color:var(--text-faint)' }, [
        el('a', { href: (CFG.welcomePage || 'index.html') + '?welcome=1' }, '查看完整免责声明'),
        ' · ',
        el('a', { href: 'suggest.html' }, '匿名提建议'),
        ' · ',
        el('a', { href: 'admin.html', rel: 'nofollow' }, '站主入口')
      ]));
    }
  }

  ENPO.ready().then(init);
})();
