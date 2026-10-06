/* ============================================================================
 * pages/plan.js —— 培养方案与教材（2026 / 2025 / 2024 三个年级共用这个脚本）
 * ----------------------------------------------------------------------------
 * 页面通过 <body data-year="2026"> 告诉脚本显示哪一级。
 * 交互：先选学期 → 再选专业组 → 表格里就是该组的课程与教材，
 *       还可以再用搜索框和"只看必修"筛选。
 *
 * 特别注意：「三选一必修」「24选1必修」这类多选一的课程会被合并成一个
 *           可展开的条目，而不是散成十几行，这样才看得清楚。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, el = U.el, $ = U.$;

  var state = { termIndex: 0, groupIndex: 0, keyword: '', only: '' };

  /* 「N 选 M 必修」这类要求 → 应该合并展示 */
  function isChoiceRequirement(req) {
    var r = String(req || '');
    if (!r) return false;
    if (/[0-9一二三四五六七八九十]+\s*选\s*[0-9一二三四五六七八九十]*\s*必修/.test(r)) return true;
    if (r.indexOf('要求见备注') >= 0) return true;   // 表格里这类课靠备注说明"几选一"
    return false;
  }

  function catOf(course) {
    var r = course.requirement || '';
    if (isChoiceRequirement(r)) return 'multi';
    if (r.indexOf('必修') >= 0) return 'required';
    if (r.indexOf('选修') >= 0) return 'elective';
    return 'other';
  }

  /* 版次文案：纯数字补成「第 6 版」，已经是完整文案就原样用 */
  function editionText(v) {
    var s = String(v === undefined || v === null ? '' : v).trim();
    if (!s) return '';
    if (/^\d+(\.\d+)?$/.test(s)) return '第 ' + s + ' 版';
    return s;
  }

  function bookLine(b) {
    var parts = [];
    if (b.author) parts.push('主编：' + b.author);
    if (b.edition) parts.push('版次：' + editionText(b.edition));
    if (b.publisher) parts.push('出版社：' + b.publisher);
    return el('li', null, [
      el('span', { class: 'book-title', text: b.title }),
      parts.length ? el('span', { class: 'book-meta', text: '　' + parts.join('　·　') }) : null
    ]);
  }

  function booksCell(course) {
    if (course.noBook) return el('span', { class: 'muted-text', text: '无教材' });
    if (!course.books || !course.books.length) return el('span', { class: 'muted-text', text: '未标注' });
    return el('ul', { class: 'course-books' }, course.books.map(bookLine));
  }

  function noteCell(course) {
    if (!course.note) return '—';
    return el('div', { class: 'pre-line', style: 'font-size:.86rem', text: course.note });
  }

  function init() {
    var host = $('#app-content');
    if (!host) return;

    var year = document.body.getAttribute('data-year') || '2026';
    var PLANS = ENPO.content.get('plans', { order: [], years: {} });
    var data = (PLANS.years || {})[year];

    host.appendChild(UI.yearSwitch(PLANS.order || [], year));

    if (!data) {
      host.appendChild(UI.empty('🚧', '还没有 ' + year + ' 级的培养方案内容。',
        '可以到「意见建议」提醒站主补充。'));
      return;
    }

    document.title = data.title + ' · 西安交通大学能源与动力工程学院本科生互助网站（民间）';

    host.appendChild(UI.notice('🎓', [data.intro || '', data.note || ''].filter(Boolean), 'plain'));

    var terms = data.terms || [];
    if (!terms.length) {
      host.appendChild(el('div', { style: 'margin-top:1.4rem' }, [
        UI.empty('📭', '这个年级还没有录入课程数据。')
      ]));
      return;
    }

    /* ---------------- 界面骨架 ---------------- */
    var termBar = el('div', { class: 'year-switch', style: 'margin-top:1.4rem' });
    var groupBar = el('div', { class: 'plan-groups' });
    var countLabel = el('p', { class: 'section__desc' });
    var tableHost = el('div');
    var searchInput = el('input', {
      class: 'input', type: 'search', autocomplete: 'off',
      placeholder: '搜索课程名或教材名，例如：传热学、高数、电工',
      'aria-label': '搜索课程或教材'
    });
    var filterBar = el('div', { class: 'chip-row' });

    searchInput.addEventListener('input', U.debounce(function () {
      state.keyword = searchInput.value.trim();
      renderTable();
    }, 150));

    host.appendChild(el('section', { class: 'section' }, [
      UI.sectionTitle('选择学期', ''), termBar
    ]));
    host.appendChild(el('section', { class: 'section' }, [
      UI.sectionTitle('选择专业组', '不同专业方向的课程不完全相同，请确认自己所属的组。'), groupBar
    ]));
    host.appendChild(el('section', { class: 'section' }, [
      el('div', { class: 'toolbar' }, [
        el('label', { class: 'field toolbar__field' }, [
          el('span', { class: 'field__label', text: '🔍 搜索' }), searchInput
        ]),
        el('div', { class: 'toolbar__field' }, [
          el('span', { class: 'field__label', text: '只看' }), filterBar
        ])
      ]),
      countLabel,
      tableHost
    ]));

    host.appendChild(el('section', { class: 'section' }, [
      UI.notice('⚠️', [
        '本页内容由学长学姐根据教务系统整理，教材版次可能随任课教师要求变化。',
        '选课前请先确认任课教师指定的版本，再决定买新书还是二手书。',
        '二手教材可以在本站的「二手教材」页面找，也可以通过「我要出书」登记自己闲置的书。'
      ], 'warn'),
      data.source && data.source.url
        ? el('p', { style: 'margin-top:.9rem' }, [
          '官方查询入口：',
          el('a', { href: data.source.url, target: '_blank', rel: 'noopener noreferrer nofollow' },
            data.source.label || data.source.url)
        ])
        : null
    ]));

    /* ---------------- 渲染 ---------------- */
    function currentTerm() { return terms[state.termIndex] || { groups: [] }; }
    function currentGroup() {
      var t = currentTerm();
      return (t.groups || [])[state.groupIndex] || { courses: [] };
    }

    function renderTermBar() {
      U.clear(termBar);
      terms.forEach(function (t, i) {
        termBar.appendChild(el('button', {
          class: 'chip' + (i === state.termIndex ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': i === state.termIndex ? 'true' : 'false',
          onclick: function () {
            state.termIndex = i;
            state.groupIndex = 0;
            state.keyword = '';
            state.only = '';
            searchInput.value = '';
            renderAll();
          }
        }, t.name + '（' + (t.groups || []).length + ' 个专业组）'));
      });
    }

    function renderGroupBar() {
      U.clear(groupBar);
      var t = currentTerm();
      if (t.remark) {
        groupBar.appendChild(el('p', { class: 'section__desc', style: 'flex:1 1 100%', text: t.remark }));
      }
      (t.groups || []).forEach(function (g, i) {
        groupBar.appendChild(el('button', {
          class: 'chip' + (i === state.groupIndex ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': i === state.groupIndex ? 'true' : 'false',
          onclick: function () {
            state.groupIndex = i;
            renderGroupBar();
            renderFilterBar();
            renderTable();
          }
        }, g.name + '（' + (g.courses || []).length + ' 门）'));
      });
    }

    var CATS = [
      { key: '', label: '全部' },
      { key: 'required', label: '必修' },
      { key: 'multi', label: '多选一必修' },
      { key: 'elective', label: '选修' },
      { key: 'other', label: '未标注' }
    ];

    function renderFilterBar() {
      U.clear(filterBar);
      var rows = buildRows(currentGroup().courses || []);
      CATS.forEach(function (c) {
        var n = c.key ? rows.filter(function (x) { return catOf(rowProto(x)) === c.key; }).length : rows.length;
        if (c.key && !n) return;
        filterBar.appendChild(el('button', {
          class: 'chip chip--sm' + (state.only === c.key ? ' is-active' : ''),
          type: 'button',
          onclick: function () {
            state.only = c.key;
            renderFilterBar();
            renderTable();
          }
        }, c.label + '（' + n + '）'));
      });
    }

    /**
     * 把课程列表整理成"显示行"：
     *   普通课程 → 它自己
     *   多选一必修 → 合并成一个 { __group:true, requirement, courses:[] }
     * 合并后仍然放在第一门课原来的位置，保持顺序。
     */
    function buildRows(courses) {
      var groups = {};
      var out = [];
      courses.forEach(function (c) {
        var req = String(c.requirement || '').trim();
        if (isChoiceRequirement(req)) {
          if (!groups[req]) {
            groups[req] = { __group: true, requirement: req, courses: [] };
            out.push(groups[req]);
          }
          groups[req].courses.push(c);
        } else {
          out.push(c);
        }
      });
      // 只有一门课的"多选一"没必要折叠，还原成普通课程
      return out.map(function (row) {
        if (row.__group && row.courses.length === 1) return row.courses[0];
        return row;
      });
    }

    function rowProto(row) {
      return row.__group ? { requirement: row.requirement } : row;
    }

    function rowMatches(row, kw, only) {
      if (only && catOf(rowProto(row)) !== only) return false;
      if (!kw) return true;
      var items = row.__group ? row.courses : [row];
      return items.some(function (c) {
        var hay = [c.name, c.code, c.requirement, c.note]
          .concat((c.books || []).map(function (b) { return b.title + ' ' + b.author + ' ' + b.publisher; }))
          .join(' ').toLowerCase();
        return hay.indexOf(kw) >= 0;
      });
    }

    /* ---------------- 多选一组 ---------------- */
    function groupRow(row) {
      var courses = row.courses;
      var listHost = el('div', { class: 'choice-group__list', hidden: true });

      courses.forEach(function (c) {
        listHost.appendChild(el('div', { class: 'choice-course' }, [
          el('div', { class: 'choice-course__head' }, [
            el('span', { class: 'choice-course__name', text: c.name }),
            c.code ? el('code', { text: c.code }) : null,
            c.credits ? UI.badge(c.credits + ' 学分', 'muted') : null,
            c.kind ? UI.badge(c.kind, 'muted') : null
          ]),
          bookOrNote(c)
        ]));
      });

      var toggle = el('button', {
        class: 'choice-group__toggle', type: 'button', 'aria-expanded': 'false',
        onclick: function () {
          var open = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
          listHost.hidden = open;
          toggle.querySelector('.choice-group__arrow').textContent = open ? '▸' : '▾';
        }
      }, [
        el('span', { class: 'choice-group__arrow', 'aria-hidden': 'true', text: '▸' }),
        el('span', { text: '展开查看这 ' + courses.length + ' 门课程' })
      ]);

      // 学分：都相同就显示一个，否则列出来
      var creditSet = [];
      courses.forEach(function (c) {
        if (c.credits && creditSet.indexOf(c.credits) < 0) creditSet.push(c.credits);
      });

      // 教材：把这一组涉及的教材去重后列出来
      var bookTitles = [];
      courses.forEach(function (c) {
        (c.books || []).forEach(function (b) {
          if (b.title && bookTitles.indexOf(b.title) < 0) bookTitles.push(b.title);
        });
      });

      // 备注：把有备注的课程的备注拼起来（含换行）
      var notes = courses.filter(function (c) { return c.note; })
        .map(function (c) { return c.name + '：' + c.note; });

      return {
        courses: el('div', { class: 'choice-group' }, [
          el('div', { class: 'choice-group__label' }, [
            UI.badge(row.requirement, 'warn'),
            el('span', { class: 'muted-text', text: '　共 ' + courses.length + ' 门，按备注要求选其中一门' })
          ]),
          toggle,
          listHost
        ]),
        credits: creditSet.length === 1 ? creditSet[0] : (creditSet.join(' / ') || '—'),
        requirement: UI.badge(row.requirement, 'warn'),
        books: bookTitles.length
          ? el('ul', { class: 'course-books' }, bookTitles.map(function (t) { return el('li', { text: t }); }))
          : el('span', { class: 'muted-text', text: '未标注' }),
        note: notes.length
          ? el('div', { class: 'pre-line', style: 'font-size:.86rem', text: notes.join('\n') })
          : '—'
      };
    }

    function bookOrNote(c) {
      var parts = [];
      if (c.noBook) parts.push(el('div', { class: 'muted-text', style: 'font-size:.82rem', text: '无教材' }));
      else if (c.books && c.books.length) {
        parts.push(el('ul', { class: 'course-books' }, c.books.map(bookLine)));
      }
      if (c.note) parts.push(el('div', { class: 'pre-line', style: 'font-size:.82rem;color:var(--text-muted)', text: c.note }));
      return parts.length ? el('div', { class: 'choice-course__body' }, parts) : null;
    }

    /* ---------------- 表格 ---------------- */
    function renderTable() {
      var g = currentGroup();
      var allRows = buildRows(g.courses || []);
      var kw = state.keyword.toLowerCase();
      var rows = allRows.filter(function (r) { return rowMatches(r, kw, state.only); });

      var totalCourses = (g.courses || []).length;
      countLabel.textContent = '当前：' + currentTerm().name + ' · ' + g.name
        + '　共 ' + totalCourses + ' 门课程'
        + (rows.length !== allRows.length ? '，筛选出 ' + rows.length + ' 项' : '') + '。';

      var display = rows.map(function (row) {
        if (!row.__group) {
          return {
            courses: el('div', null, [
              el('span', { class: 'course-name', text: row.name }),
              row.code ? el('div', { style: 'font-size:.76rem;color:var(--text-faint);margin-top:.15rem' }, [
                el('code', { text: row.code })
              ]) : null
            ]),
            credits: row.credits || '—',
            requirement: row.requirement
              ? UI.badge(row.requirement, catOf(row) === 'multi' ? 'warn' : 'muted')
              : '—',
            books: booksCell(row),
            note: noteCell(row),
            _raw: row
          };
        }
        var built = groupRow(row);
        built._raw = row;
        return built;
      });

      U.clear(tableHost);
      tableHost.appendChild(UI.dataTable([
        { key: 'courses', label: '课程' },
        { key: 'credits', label: '学分', className: 'num nowrap' },
        { key: 'requirement', label: '要求', className: 'nowrap' },
        { key: 'books', label: '教材（主编 / 版次 / 出版社）' },
        { key: 'note', label: '备注' }
      ], display, {
        emptyText: '没有符合条件的课程。',
        emptyDesc: '试试清空搜索词或换个筛选条件。'
      }));
    }

    function renderAll() {
      renderTermBar();
      renderGroupBar();
      renderFilterBar();
      renderTable();
    }

    renderAll();
  }

  ENPO.ready().then(init);
})();
