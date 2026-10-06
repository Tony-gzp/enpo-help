/* ============================================================================
 * ui.js —— 可复用的界面组件（标题、折叠面板、表格、徽章、空状态等）
 * 各页面脚本调用这里的方法拼界面，保证全站风格一致。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var el = U.el, $ = U.$;

  /* ------------------------------ 区块标题 ------------------------------ */
  function sectionTitle(title, desc) {
    return el('div', { class: 'section__head' }, [
      el('h2', { class: 'section__title', text: title }),
      desc ? el('p', { class: 'section__desc', text: desc }) : null
    ]);
  }

  /* ------------------------------ 徽章 ------------------------------ */
  function badge(text, type) {
    return el('span', { class: 'badge' + (type ? ' badge--' + type : ''), text: text });
  }

  /* ------------------------------ 折叠面板 ------------------------------ */
  /**
   * @param {Array} items [{ q, a, meta }]
   */
  function accordionList(items, opts) {
    opts = opts || {};
    var wrap = el('div', { class: 'accordion-list' });
    (items || []).forEach(function (item, idx) {
      var body = el('div', { class: 'accordion__body', hidden: true, id: 'acc-body-' + opts.idPrefix + '-' + idx });
      String(item.a || '').split('\n').forEach(function (line) {
        if (line.trim() === '') return;
        body.appendChild(el('p', { text: line }));
      });

      var btn = el('button', {
        class: 'accordion__head', type: 'button',
        'aria-expanded': 'false', 'aria-controls': 'acc-body-' + opts.idPrefix + '-' + idx
      }, [
        el('span', { class: 'accordion__q', text: item.q }),
        item.meta ? el('span', { class: 'badge badge--muted', text: item.meta }) : null,
        el('span', { class: 'accordion__mark', 'aria-hidden': 'true', text: '▾' })
      ]);
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        body.hidden = open;
      });

      wrap.appendChild(el('div', { class: 'accordion' }, [btn, body]));
    });
    return wrap;
  }

  /* ------------------------------ 表格 ------------------------------ */
  /**
   * @param {Array} columns [{ key, label, className, render }]
   * @param {Array} rows    数据对象数组
   * @param {Object} opts   { cardMode: true 手机上变成卡片, emptyText }
   */
  function dataTable(columns, rows, opts) {
    opts = opts || {};
    if (!rows || !rows.length) {
      return empty('📭', opts.emptyText || '暂时还没有内容。', opts.emptyDesc || '');
    }
    var thead = el('thead', null, [
      el('tr', null, columns.map(function (c) {
        return el('th', { class: c.className || '', scope: 'col' }, c.label);
      }))
    ]);
    var tbody = el('tbody', null, rows.map(function (row) {
      return el('tr', null, columns.map(function (c) {
        var td = el('td', { class: c.className || '', 'data-label': c.label });
        var val = c.render ? c.render(row) : row[c.key];
        if (val === null || val === undefined || val === '') {
          td.textContent = '—';
        } else if (typeof val === 'string' || typeof val === 'number') {
          td.textContent = String(val);
        } else {
          td.appendChild(val);
        }
        return td;
      }));
    }));
    var table = el('table', { class: 'data' + (opts.cardMode === false ? '' : ' data--cards') }, [thead, tbody]);
    return el('div', { class: 'table-wrap' }, [table]);
  }

  /* ------------------------------ 空状态 ------------------------------ */
  function empty(icon, title, desc) {
    return el('div', { class: 'empty' }, [
      el('span', { class: 'empty__icon', 'aria-hidden': 'true', text: icon || '📭' }),
      el('p', { text: title || '暂时还没有内容。' }),
      desc ? el('p', { style: 'font-size:.85rem', text: desc }) : null
    ]);
  }

  /* ------------------------------ 提示块 ------------------------------ */
  function notice(icon, content, type) {
    var body = el('div', { class: 'notice__body' });
    if (Array.isArray(content)) content.forEach(function (c) { body.appendChild(el('p', { text: c })); });
    else if (content instanceof Node) body.appendChild(content);
    else body.appendChild(el('p', { text: String(content) }));
    return el('div', { class: 'notice' + (type ? ' notice--' + type : '') }, [
      el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: icon || 'ℹ️' }),
      body
    ]);
  }

  /* ------------------------------ 统计卡片 ------------------------------ */
  function statRow(items) {
    return el('div', { class: 'stat-row' }, (items || []).map(function (s) {
      return el('div', { class: 'stat' + (s.type ? ' stat--' + s.type : '') }, [
        el('div', { class: 'stat__num', text: s.value }),
        el('div', { class: 'stat__label', text: s.label })
      ]);
    }));
  }

  /* ------------------------------ 外部链接条目 ------------------------------ */
  function linkItem(item) {
    return el('a', {
      class: 'link-item', href: item.url,
      target: '_blank', rel: 'noopener noreferrer nofollow'
    }, [
      el('span', { class: 'link-item__icon', 'aria-hidden': 'true', text: item.icon || '🔗' }),
      el('span', { class: 'link-item__body' }, [
        el('span', { class: 'link-item__name' }, [
          item.name,
          el('span', { 'aria-hidden': 'true', text: '↗', style: 'font-size:.8em;color:var(--text-faint)' })
        ]),
        item.desc ? el('span', { class: 'link-item__desc', text: item.desc }) : null,
        el('span', { class: 'link-item__url', text: prettyUrl(item.url) })
      ])
    ]);
  }

  function prettyUrl(url) {
    return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  /* ------------------------------ 工具：把节点挂到 #app-content ------------------------------ */
  function mount(nodeOrNodes) {
    var host = $('#app-content') || $('#main');
    if (!host) return;
    U.appendAll(host, nodeOrNodes);
  }

  /* ------------------------------ 年份切换 ------------------------------ */
  function yearSwitch(order, current) {
    return el('div', { class: 'year-switch' }, order.map(function (y) {
      return el('a', {
        href: 'plan-' + y + '.html',
        class: y === current ? 'is-active' : '',
        'aria-current': y === current ? 'page' : null
      }, y + ' 级');
    }));
  }

  ENPO.ui = {
    sectionTitle: sectionTitle,
    badge: badge,
    accordionList: accordionList,
    dataTable: dataTable,
    empty: empty,
    notice: notice,
    statRow: statRow,
    linkItem: linkItem,
    prettyUrl: prettyUrl,
    mount: mount,
    yearSwitch: yearSwitch
  };
})();
