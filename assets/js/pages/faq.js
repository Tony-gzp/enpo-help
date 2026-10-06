/* ============================================================================
 * pages/faq.js —— 常见问题页
 * 支持关键字搜索，按分类折叠展示。内容在 data/faq.js（后台也能改）。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, el = U.el, $ = U.$;

  function init() {
    var host = $('#app-content');
    if (!host) return;

    var DATA = ENPO.content.get('faq', { categories: [] });

    /* ---------------- 开头说明 ---------------- */
    host.appendChild(UI.notice('📌', [DATA.intro || '', DATA.note || ''].filter(Boolean), 'plain'));

    /* ---------------- 搜索框 ---------------- */
    var searchInput = el('input', {
      class: 'input', type: 'search', id: 'faq-search',
      placeholder: '搜索关键词，例如：通识课、体育、成绩、图书馆…',
      autocomplete: 'off', 'aria-label': '搜索常见问题'
    });
    var countLabel = el('p', { class: 'section__desc', style: 'margin:.7rem 0 0' });

    host.appendChild(el('div', { class: 'toolbar', style: 'margin-top:1.1rem' }, [
      el('label', { class: 'field toolbar__field', for: 'faq-search' }, [
        el('span', { class: 'field__label', text: '🔍 搜索' }),
        searchInput
      ])
    ]));
    host.appendChild(countLabel);

    var resultHost = el('div', { id: 'faq-results' });
    host.appendChild(resultHost);

    function render(keyword) {
      U.clear(resultHost);
      var kw = String(keyword || '').trim().toLowerCase();
      var categories = DATA.categories || [];
      var total = 0;

      if (!kw) {
        categories.forEach(function (cat, ci) {
          var items = (cat.items || []).map(function (i) { return { q: i.q, a: i.a }; });
          total += items.length;
          if (!items.length) return;
          resultHost.appendChild(el('section', { class: 'section' }, [
            UI.sectionTitle((cat.icon ? cat.icon + ' ' : '') + cat.name, ''),
            UI.accordionList(items, { idPrefix: 'cat' + ci })
          ]));
        });
        countLabel.textContent = '共 ' + total + ' 条问答，点击问题即可展开答案。';
      } else {
        var matched = [];
        categories.forEach(function (cat, ci) {
          var items = (cat.items || []).filter(function (i) {
            return (i.q + ' ' + i.a).toLowerCase().indexOf(kw) >= 0;
          });
          if (!items.length) return;
          total += items.length;
          matched.push({ cat: cat, items: items, ci: ci });
        });
        if (!total) {
          resultHost.appendChild(UI.empty('🔍', '没有找到包含「' + keyword + '」的问答。',
            '换个关键词试试，或者到「意见建议」把问题发给我，我会补充进来。'));
        } else {
          matched.forEach(function (m) {
            resultHost.appendChild(el('section', { class: 'section' }, [
              UI.sectionTitle((m.cat.icon ? m.cat.icon + ' ' : '') + m.cat.name, ''),
              UI.accordionList(m.items.map(function (i) { return { q: i.q, a: i.a }; }),
                { idPrefix: 'f' + m.ci })
            ]));
          });
        }
        countLabel.textContent = '找到 ' + total + ' 条相关问答。';
      }
    }

    searchInput.addEventListener('input', U.debounce(function () {
      render(searchInput.value);
    }, 180));
    render('');

    host.appendChild(el('div', { class: 'section' }, [
      UI.notice('💡', [
        '没有找到想问的问题？可以在「意见建议」页面匿名留言，我会把常见的问题整理进这一页。',
        '涉及具体规定的答案请以教务处、学院官网的正式通知为准。'
      ])
    ]));
  }

  ENPO.ready().then(init);
})();
