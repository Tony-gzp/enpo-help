/* ============================================================================
 * pages/general-edu.js —— 能动学院必选通识课
 * ----------------------------------------------------------------------------
 * 页面结构：
 *   1. 学分与模块要求
 *   2. 思维导图（用 HTML + CSS 画出来，手机上会自动变成竖向排列）
 *   3. 各模块下的课程清单
 *
 * 说明：这一页只做信息展示，不做任何推荐，也不写考核方式和选课建议。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, el = U.el, $ = U.$;

  function init() {
    var host = $('#app-content');
    if (!host) return;

    var D = ENPO.content.get('generalEdu', {});
    var modules = D.modules || [];

    /* ================= 1. 学分与模块要求 ================= */
    if (D.rules && D.rules.length) {
      host.appendChild(el('section', { class: 'section' }, [
        UI.sectionTitle('学分与模块要求', '四年内修完即可，不要求在一个学期内学完。'),
        UI.statRow(D.rules.map(function (r) {
          return { label: r.label, value: r.value, type: /学分/.test(r.value) ? 'brand' : '' };
        })),
        el('div', { style: 'margin-top:1rem' }, [
          UI.dataTable([
            { key: 'label', label: '项目' },
            {
              key: 'value', label: '要求', className: 'num',
              render: function (r) { return el('strong', { text: r.value }); }
            },
            { key: 'note', label: '说明' }
          ], D.rules)
        ])
      ]));
    }

    /* ================= 2. 思维导图 ================= */
    if (D.map) {
      host.appendChild(el('section', { class: 'section' }, [
        UI.sectionTitle('要求一览（思维导图）',
          '下面这张图把学校要求和学院要求画在一起，手机上会自动变成竖向排列。'),
        renderMindMap(D.map)
      ]));
    }

    /* ================= 3. 各模块课程清单 ================= */
    if (modules.length) {
      var totalCourses = modules.reduce(function (n, m) { return n + ((m.courses || []).length); }, 0);
      var listHost = el('div');
      host.appendChild(el('section', { class: 'section' }, [
        UI.sectionTitle('各模块下的课程',
          '共 ' + modules.length + ' 个模块、' + totalCourses + ' 门课程。'
          + '课程代码以 CORE 开头的是通识类核心课，以 GNED 开头的是通识类选修课。'),
        listHost
      ]));
      modules.forEach(function (m, i) { listHost.appendChild(moduleBlock(m, i)); });
    }

    /* ================= 页尾 ================= */
    host.appendChild(el('section', { class: 'section' }, [
      UI.notice('⚠️', [
        D.note || '',
        '本站只是把「有哪些课可以选」这类信息公开地列出来，方便你查询，不做任何推荐。'
      ].filter(Boolean), 'warn'),
      D.source && D.source.url
        ? el('p', { style: 'margin-top:.9rem' }, [
          '官方查询入口：',
          el('a', { href: D.source.url, target: '_blank', rel: 'noopener noreferrer nofollow' },
            D.source.label || D.source.url)
        ])
        : null
    ]));
  }

  /* ======================================================================
   * 学分文案：把裸数字补成「需修 2 学分」，其它文案原样显示
   * ==================================================================== */
  function creditsText(raw) {
    var s = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!s) return '';
    if (s.indexOf('需修') === 0) return s;                 // 已经是完整文案
    if (/^\d+(\.\d+)?$/.test(s)) return '需修 ' + s + ' 学分';
    if (/^\d+(\.\d+)?\s*学分$/.test(s)) return '需修 ' + s;
    return s;                                              // 例如「不限学分」
  }

  /* ======================================================================
   * 思维导图
   * ==================================================================== */
  function renderMindMap(map) {
    var root = el('div', { class: 'mindmap__root' }, [
      el('div', { class: 'mindmap__root-title', text: map.root || '' }),
      el('ul', { class: 'mindmap__notes' }, (map.notes || []).map(function (n) {
        return el('li', { text: n });
      }))
    ]);

    var branches = el('div', { class: 'mindmap__branches' },
      (map.branches || []).map(function (b) {
        return el('div', { class: 'mindmap__branch' }, [
          el('div', { class: 'mindmap__branch-title' }, [
            b.icon ? el('span', { 'aria-hidden': 'true', text: b.icon }) : null,
            el('span', { text: b.title })
          ]),
          el('div', { class: 'mindmap__leaves' }, (b.children || []).map(leaf))
        ]);
      }));

    return el('div', {
      class: 'mindmap', role: 'group', 'aria-label': '通识课要求思维导图'
    }, [root, branches]);
  }

  function leaf(node) {
    if (node.children && node.children.length) {
      return el('div', { class: 'mindmap__leaf mindmap__leaf--group' }, [
        el('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:.5rem' }, [
          el('span', { class: 'mindmap__leaf-label' }, [
            node.icon ? el('span', { 'aria-hidden': 'true' }, node.icon + ' ') : null,
            el('span', { text: node.title })
          ]),
          node.value ? el('span', { class: 'mindmap__leaf-value', text: node.value }) : null
        ]),
        el('div', { class: 'mindmap__subleaves' }, node.children.map(function (c) {
          return el('div', { class: 'mindmap__subleaf', text: c.title + (c.value ? '　→　' + c.value : '') });
        }))
      ]);
    }
    return el('div', { class: 'mindmap__leaf' }, [
      el('span', { class: 'mindmap__leaf-label', text: node.title }),
      node.value ? el('span', { class: 'mindmap__leaf-value', text: node.value }) : null
    ]);
  }

  /* ======================================================================
   * 一个课程模块
   * ==================================================================== */
  function moduleBlock(m) {
    var courses = m.courses || [];
    var hasCollege = courses.some(function (c) { return c.college; });
    var body;

    if (m.unrestricted) {
      body = el('div', { class: 'module-block__body' }, [
        el('p', { style: 'margin:.9rem 0 .6rem' },
          '这个模块不限制具体课程，只要开课学院符合要求即可。可选的开课学院：'),
        el('div', { class: 'chip-row' }, (m.colleges || []).map(function (c) {
          return el('span', { class: 'badge badge--brand', text: c });
        }))
      ]);
    } else if (!courses.length) {
      body = el('div', { class: 'module-block__body' }, [
        el('p', { style: 'margin:.9rem 0' , text: m.emptyHint || '具体课程清单请到本科教务系统查询。' })
      ]);
    } else {
      var columns = [
        {
          key: 'code', label: '课程代码', className: 'nowrap',
          render: function (c) { return c.code ? el('code', { text: c.code }) : '—'; }
        },
        {
          key: 'name', label: '课程名称',
          render: function (c) {
            return el('span', {
              class: 'course-name' + (c.disabled ? ' course-name--disabled' : ''),
              text: c.name
            });
          }
        },
        {
          key: 'kind', label: '类型', className: 'nowrap',
          render: function (c) {
            return c.kind ? UI.badge(c.kind, c.kind === '核心课' ? 'brand' : 'muted') : '—';
          }
        },
        {
          key: 'credits', label: '学分', className: 'num nowrap',
          render: function (c) { return c.credits || '—'; }
        }
      ];
      if (hasCollege) columns.push({ key: 'college', label: '开课学院' });
      columns.push({
        key: 'note', label: '备注',
        render: function (c) {
          if (!c.note && !c.disabled) return '—';
          return el('div', null, [
            c.disabled ? el('span', { class: 'badge badge--danger', text: '不再计入学分' }) : null,
            c.note ? el('div', { class: 'pre-line', style: 'font-size:.85rem' + (c.disabled ? ';margin-top:.3rem' : ''), text: c.note }) : null
          ]);
        }
      });

      body = el('div', { class: 'module-block__body' }, [UI.dataTable(columns, courses)]);
    }

    return el('div', { class: 'module-block' }, [
      el('div', { class: 'module-block__head' }, [
        el('span', { class: 'module-block__icon', 'aria-hidden': 'true', text: m.icon || '📗' }),
        el('h3', { class: 'module-block__name', text: m.name }),
        el('div', { class: 'module-block__badges' }, [
          m.credits ? UI.badge(creditsText(m.credits), 'brand') : null,
          m.audience ? UI.badge(m.audience, 'muted') : null,
          (!m.unrestricted && courses.length) ? UI.badge(courses.length + ' 门可选', 'muted') : null
        ])
      ]),
      body
    ]);
  }

  ENPO.ready().then(init);
})();
