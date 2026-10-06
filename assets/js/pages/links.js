/* ============================================================================
 * pages/links.js —— 校内网站导航页
 * 内容在 data/links.js（后台也能改，图标可以在后台用图标选择器挑）
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, el = U.el, $ = U.$;

  function init() {
    var host = $('#app-content');
    if (!host) return;

    var D = ENPO.content.get('links', { groups: [] });

    host.appendChild(UI.notice('🔗', [D.intro || '', D.note || ''].filter(Boolean), 'plain'));

    var groups = D.groups || [];
    if (!groups.length) {
      host.appendChild(el('div', { style: 'margin-top:1.4rem' }, [
        UI.empty('📭', '还没有配置任何链接。', '打开 data/links.js 里的 groups 添加即可。')
      ]));
      return;
    }

    groups.forEach(function (g) {
      host.appendChild(el('section', { class: 'section', style: 'margin-top:1.6rem' }, [
        UI.sectionTitle((g.icon ? g.icon + ' ' : '') + g.name, ''),
        el('div', { class: 'link-list' }, (g.items || []).map(linkItem))
      ]));
    });

    host.appendChild(el('section', { class: 'section' }, [
      UI.notice('💡', [
        '所有链接都会在新标签页中打开，本站不对这些网站的内容负责。',
        '标注了「需要校园网」的网站，在校外请先连接 WebVPN。',
        '如果发现链接失效、或者有你觉得应该加进来的网站，欢迎通过「意见建议」告诉站主。'
      ], 'plain')
    ]));
  }

  /** 一条链接（支持一个网站有多个网址） */
  function linkItem(item) {
    var urls = [item.url].concat(item.altUrls || []).filter(Boolean);
    var body = el('span', { class: 'link-item__body' }, [
      el('span', { class: 'link-item__name' }, [
        item.name,
        el('span', { 'aria-hidden': 'true', text: '↗', style: 'font-size:.8em;color:var(--text-faint)' })
      ]),
      item.desc ? el('span', { class: 'link-item__desc', text: item.desc }) : null,
      el('span', { class: 'link-item__url', text: urls.map(UI.prettyUrl).join('  /  ') }),
      urls.length > 1
        ? el('span', { class: 'link-item__url', style: 'margin-top:.25rem' },
          urls.slice(1).map(function (u) {
            return el('a', {
              href: u, target: '_blank', rel: 'noopener noreferrer nofollow',
              style: 'margin-right:.6rem', onclick: function (e) { e.stopPropagation(); }
            }, '备用入口 ↗');
          }))
        : null
    ]);

    return el('a', {
      class: 'link-item', href: item.url,
      target: '_blank', rel: 'noopener noreferrer nofollow'
    }, [
      el('span', { class: 'link-item__icon', 'aria-hidden': 'true', text: item.icon || '🔗' }),
      body
    ]);
  }

  ENPO.ready().then(init);
})();
