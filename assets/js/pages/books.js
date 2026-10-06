/* ============================================================================
 * pages/books.js —— 二手教材浏览页
 * ----------------------------------------------------------------------------
 * 只显示「审核通过」的条目；QQ 号默认打码，点击后才在浏览器里还原。
 * 一条记录的内容：专业、出的年级/类型、有哪些书、是否已出、备注、QQ 号。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, S = ENPO.store;
  var el = U.el, $ = U.$;

  var ALL = [];

  function init() {
    var host = $('#app-content');
    if (!host) return;

    /* ---------------- 说明与入口 ---------------- */
    host.appendChild(UI.notice('📚', [
      '这里汇总学长学姐的出书信息。所有内容由发布者本人填写、站主人工审核，'
      + '站主不对书籍成色和交易安全作担保。',
      'QQ 号默认打码显示，点击「查看 QQ 号」后才会在你的浏览器里还原。请仅用于联系同学购书，谢绝广告与骚扰。'
    ]));

    host.appendChild(el('div', { class: 'btn-row', style: 'margin:1rem 0 1.4rem' }, [
      el('a', { class: 'btn btn--primary', href: 'books-submit.html' }, '✍️ 我要出书'),
      el('a', { class: 'btn btn--ghost', href: 'books-mine.html' }, '🗂️ 我发布的 / 改状态'),
      el('a', { class: 'btn btn--ghost', href: 'suggest.html' }, '💡 举报或反馈')
    ]));

    /* ---------------- 筛选 ---------------- */
    var searchInput = el('input', {
      class: 'input', type: 'search', id: 'book-search', autocomplete: 'off',
      placeholder: '书名、专业或备注…', 'aria-label': '搜索'
    });
    var majorSelect = el('select', { class: 'select', id: 'book-major', 'aria-label': '按专业筛选' });
    var termSelect = el('select', { class: 'select', id: 'book-term', 'aria-label': '按年级筛选' });
    var statusSelect = el('select', { class: 'select', id: 'book-status', 'aria-label': '按状态筛选' }, [
      el('option', { value: '' }, '全部状态')
    ]);
    var sortSelect = el('select', { class: 'select', id: 'book-sort', 'aria-label': '排序方式' }, [
      el('option', { value: 'updated' }, '最近更新'),
      el('option', { value: 'status' }, '还可联系优先'),
      el('option', { value: 'major' }, '按专业排序'),
      el('option', { value: 'books' }, '书多的优先')
    ]);

    host.appendChild(el('div', { class: 'toolbar' }, [
      el('label', { class: 'field toolbar__field', for: 'book-search' }, [
        el('span', { class: 'field__label', text: '🔍 搜索' }), searchInput
      ]),
      el('label', { class: 'field toolbar__field', for: 'book-major' }, [
        el('span', { class: 'field__label', text: '专业' }), majorSelect
      ]),
      el('label', { class: 'field toolbar__field', for: 'book-term' }, [
        el('span', { class: 'field__label', text: '年级 / 类型' }), termSelect
      ]),
      el('label', { class: 'field toolbar__field', for: 'book-status' }, [
        el('span', { class: 'field__label', text: '是否已出' }), statusSelect
      ]),
      el('label', { class: 'field toolbar__field', for: 'book-sort' }, [
        el('span', { class: 'field__label', text: '排序' }), sortSelect
      ])
    ]));

    var countLabel = el('p', { class: 'section__desc', id: 'book-count' });
    var listHost = el('div', { class: 'book-list', id: 'book-list' });
    host.appendChild(countLabel);
    host.appendChild(listHost);

    host.appendChild(el('div', { class: 'section', style: 'margin-top:2rem' }, [
      UI.notice('🔒', [
        '隐私说明：QQ 号在数据库里是加密保存的，页面源码里也不含明文，只有你点击「查看 QQ 号」时才在浏览器里还原。',
        '交易提醒：建议在校内公共场所当面交易；对方要求先转账、发链接付款、或者价格明显异常时请提高警惕。',
        '发布者会在书出掉之后把状态改成「是」，如果状态显示「未出完」或「正在联系中」，说明还剩一部分可以问。'
      ], 'plain')
    ]));

    /* ---------------- 加载 ---------------- */
    S.listPublicBooks().then(function (list) {
      ALL = list || [];

      /* 下拉选项：从数据里归纳出来 */
      var majors = {}, terms = {};
      ALL.forEach(function (b) {
        if (b.major) majors[b.major] = 1;
        (b.terms || []).forEach(function (t) { terms[t] = 1; });
      });
      majorSelect.appendChild(el('option', { value: '' }, '全部专业'));
      Object.keys(majors).sort().forEach(function (m) {
        majorSelect.appendChild(el('option', { value: m }, m));
      });
      var termOrder = (ENPO.content.get('bookOptions', {}).terms) || [];
      termSelect.appendChild(el('option', { value: '' }, '全部年级 / 类型'));
      var sortedTerms = Object.keys(terms).sort(function (a, b) {
        var ia = termOrder.indexOf(a), ib = termOrder.indexOf(b);
        if (ia < 0) ia = 99; if (ib < 0) ib = 99;
        return ia - ib;
      });
      sortedTerms.forEach(function (t) {
        termSelect.appendChild(el('option', { value: t }, t));
      });

      var statuses = (ENPO.content.get('bookOptions', {}).statuses) || [];
      var seen = {};
      statuses.forEach(function (s) {
        statusSelect.appendChild(el('option', { value: s.value }, s.label));
        seen[s.value] = 1;
      });
      ['unknown'].forEach(function (v) {
        if (!seen[v] && ALL.some(function (b) { return b.status === v; })) {
          statusSelect.appendChild(el('option', { value: v }, '未注明'));
        }
      });

      render();
    }).catch(function (err) {
      listHost.appendChild(UI.empty('⚠️', '数据加载失败：' + (err && err.message ? err.message : '未知错误')));
    });

    /* ---------------- 事件 ---------------- */
    searchInput.addEventListener('input', U.debounce(render, 160));
    majorSelect.addEventListener('change', render);
    termSelect.addEventListener('change', render);
    statusSelect.addEventListener('change', render);
    sortSelect.addEventListener('change', render);

    /* ---------------- 渲染 ---------------- */
    function render() {
      var kw = searchInput.value.trim().toLowerCase();
      var major = majorSelect.value;
      var term = termSelect.value;
      var status = statusSelect.value;
      var sort = sortSelect.value;

      var list = ALL.filter(function (b) {
        if (major && b.major !== major) return false;
        if (term && (b.terms || []).indexOf(term) < 0) return false;
        if (status && b.status !== status) return false;
        if (kw) {
          var hay = [b.major, b.note, (b.terms || []).join(' '), (b.books || []).join(' ')]
            .join(' ').toLowerCase();
          if (hay.indexOf(kw) < 0) return false;
        }
        return true;
      });

      list = list.slice().sort(function (a, b) {
        if (sort === 'status') {
          var rank = { no: 0, partial: 1, contacting: 2, unknown: 3, yes: 4 };
          var d = (rank[a.status] === undefined ? 9 : rank[a.status]) - (rank[b.status] === undefined ? 9 : rank[b.status]);
          if (d) return d;
        }
        if (sort === 'major') {
          var m = String(a.major || '').localeCompare(String(b.major || ''), 'zh');
          if (m) return m;
        }
        if (sort === 'books') {
          var n = (b.books || []).length - (a.books || []).length;
          if (n) return n;
        }
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });

      countLabel.textContent = '共 ' + list.length + ' 条'
        + (list.length !== ALL.length ? '（已按条件筛选，全部 ' + ALL.length + ' 条）' : '') + '。';

      U.clear(listHost);
      if (!list.length) {
        listHost.appendChild(UI.empty('📭',
          ALL.length ? '没有符合筛选条件的出书信息。' : '还没有已审核通过的出书信息。',
          ALL.length ? '试试清空搜索词或换一个筛选条件。' : '你可以先发布一条，站主审核通过后就会显示在这里。'));
        return;
      }
      list.forEach(function (b) { listHost.appendChild(bookCard(b)); });
    }
  }

  /* ======================================================================
   * 一条出书信息
   * ==================================================================== */
  function bookCard(b) {
    var sold = b.status === 'yes';
    var statusText = (ENPO.store.STATUS_TEXT[b.status] || '未注明');

    var head = el('div', { class: 'book-card__head' }, [
      el('h3', { class: 'book-card__title', text: b.major || '未注明专业' }),
      el('div', { class: 'book-card__badges' }, [
        el('span', { class: 'status-pill status--' + (b.status || 'unknown'), text: '是否已出：' + statusText }),
        b.updatedAt && Date.now() - b.updatedAt < 7 * 86400000 ? UI.badge('最近更新', 'brand') : null
      ])
    ]);

    var terms = el('div', { class: 'book-card__terms' },
      (b.terms || []).map(function (t) { return el('span', { class: 'term-pill', text: t }); }));
    if (!(b.terms || []).length) terms = null;

    var booksHost = null;
    if ((b.books || []).length) {
      booksHost = el('div', { class: 'book-card__books' },
        b.books.map(function (t) { return el('span', { class: 'book-pill', text: t }); }));
    }

    var contactBox = el('div', { class: 'contact-box', 'data-contact-box': '' }, [
      sold
        ? el('span', { class: 'badge badge--muted', text: '这位同学的书已经全部出掉了' })
        : el('button', {
          class: 'btn btn--soft btn--tiny', type: 'button',
          'data-reveal-contact': '', 'data-blob': b.qqBlob, 'data-type': 'QQ 号'
        }, '👀 查看 QQ 号')
    ]);

    return el('article', { class: 'book-card' + (sold ? ' book-card--sold' : '') }, [
      head,
      terms,
      booksHost,
      b.note ? el('p', { class: 'book-card__note', text: b.note }) : null,
      el('div', { class: 'book-card__foot' }, [
        contactBox,
        el('span', { class: 'book-card__time', text: '更新于 ' + U.timeAgo(b.updatedAt || b.createdAt) })
      ])
    ]);
  }

  ENPO.ready().then(init);
})();
