/* ============================================================================
 * pages/admin-editors.js —— 站主后台用的结构化编辑器
 * ----------------------------------------------------------------------------
 * 目标：让站主不用碰代码、不用懂 JSON，也能增删改网站内容。
 *   editableList  通用"可增删改排序"的列表
 *   iconPicker    图标选择器（用网站自带的图标库，风格统一）
 *   linesToBooks / booksToLines  教材列表与文本框之间的互转
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var el = U.el;

  /* ======================================================================
   * 图标选择器
   * ==================================================================== */
  function iconPicker(current, onPick) {
    var host = el('div', { class: 'icon-picker', hidden: true });
    var sets = ENPO.content.get('iconSet', []) || [];

    sets.forEach(function (set) {
      var row = el('div', { class: 'icon-picker__row' });
      row.appendChild(el('div', { class: 'icon-picker__group-name', style: 'flex:1 1 100%', text: set.group }));
      (set.icons || []).forEach(function (ic) {
        row.appendChild(el('button', {
          class: 'icon-btn-cell' + (ic === current ? ' is-active' : ''),
          type: 'button', title: ic,
          onclick: function (e) {
            e.preventDefault();
            current = ic;
            Array.prototype.forEach.call(host.querySelectorAll('.icon-btn-cell'), function (b) {
              b.classList.remove('is-active');
            });
            e.currentTarget.classList.add('is-active');
            onPick(ic);
          }
        }, ic));
      });
      host.appendChild(row);
    });

    if (!sets.length) {
      host.appendChild(el('p', { class: 'field__hint', text: '图标库加载中…（需要 data/links.js）' }));
    }
    return host;
  }

  /* ======================================================================
   * 通用可编辑列表
   * @param items  数组（会被原地修改）
   * @param schema [{ key, label, type:'text'|'area'|'select'|'icon'|'number',
   *                  options:[], placeholder, rows, width, hint }]
   * @param opts   { title(item,i), onChange, addDefault, emptyText }
   * ==================================================================== */
  function editableList(items, schema, opts) {
    opts = opts || {};
    var list = items || [];
    var host = el('div', { class: 'editor-list' });

    function changed() { if (typeof opts.onChange === 'function') opts.onChange(); }

    function render() {
      U.clear(host);

      if (!list.length) {
        host.appendChild(el('p', { class: 'field__hint', text: opts.emptyText || '还没有内容，点下面的按钮添加一条。' }));
      }

      list.forEach(function (item, index) {
        host.appendChild(buildRow(item, index));
      });

      host.appendChild(el('div', { class: 'btn-row', style: 'margin-top:.6rem' }, [
        el('button', {
          class: 'btn btn--soft btn--tiny', type: 'button',
          onclick: function () {
            list.push(typeof opts.addDefault === 'function'
              ? opts.addDefault() : JSON.parse(JSON.stringify(opts.addDefault || {})));
            render();
            changed();
            var rows = host.querySelectorAll('.editor-row');
            if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }, '＋ 添加一条')
      ]));
    }

    function buildRow(item, index) {
      var head = el('div', { class: 'editor-row__head' }, [
        el('span', { class: 'editor-row__no', text: String(index + 1) }),
        el('span', {
          class: 'editor-row__title',
          text: typeof opts.title === 'function' ? opts.title(item, index) : ('第 ' + (index + 1) + ' 条')
        }),
        el('div', { class: 'editor-row__actions' }, [
          el('button', {
            class: 'btn btn--tiny btn--ghost', type: 'button', title: '上移',
            disabled: index === 0,
            onclick: function () {
              if (index === 0) return;
              var tmp = list[index - 1]; list[index - 1] = list[index]; list[index] = tmp;
              render(); changed();
            }
          }, '↑'),
          el('button', {
            class: 'btn btn--tiny btn--ghost', type: 'button', title: '下移',
            disabled: index === list.length - 1,
            onclick: function () {
              if (index === list.length - 1) return;
              var tmp = list[index + 1]; list[index + 1] = list[index]; list[index] = tmp;
              render(); changed();
            }
          }, '↓'),
          el('button', {
            class: 'btn btn--tiny btn--danger', type: 'button', title: '删除',
            onclick: function () {
              U.confirm({
                title: '删除这一条？',
                message: (typeof opts.title === 'function' ? opts.title(item, index) : '这一条') + ' 将被删除。',
                okText: '删除'
              }).then(function (ok) {
                if (!ok) return;
                list.splice(index, 1);
                render(); changed();
              });
            }
          }, '删除')
        ])
      ]);

      var body = el('div', { class: 'editor-row__body' });
      var iconPanel = null;

      schema.forEach(function (col) {
        var value = item[col.key];
        var control;
        var wrap;

        if (col.type === 'area') {
          control = el('textarea', {
            class: 'textarea', rows: col.rows || 3,
            placeholder: col.placeholder || '',
            style: col.mono ? 'font-family:var(--mono);font-size:.85rem' : ''
          });
          control.value = value === undefined || value === null ? '' : String(value);
          control.addEventListener('input', function () { item[col.key] = control.value; changed(); });
        } else if (col.type === 'select') {
          control = el('select', { class: 'select' }, (col.options || []).map(function (o) {
            var v = typeof o === 'string' ? o : o.value;
            var l = typeof o === 'string' ? o : o.label;
            return el('option', { value: v }, l);
          }));
          control.value = value === undefined ? '' : String(value);
          control.addEventListener('change', function () { item[col.key] = control.value; changed(); });
        } else if (col.type === 'bool') {
          // 是/否开关：存的是真正的布尔值，页面渲染时可以直接 if (item[key])
          control = el('select', { class: 'select' }, [
            el('option', { value: 'false' }, col.falseLabel || '否'),
            el('option', { value: 'true' }, col.trueLabel || '是')
          ]);
          control.value = item[col.key] ? 'true' : 'false';
          control.addEventListener('change', function () {
            item[col.key] = (control.value === 'true');
            changed();
          });
        } else if (col.type === 'icon') {
          var btn = el('button', {
            class: 'btn btn--ghost', type: 'button', style: 'font-size:1.2rem;min-width:64px',
            onclick: function (e) {
              e.preventDefault();
              if (iconPanel) {
                iconPanel.hidden = !iconPanel.hidden;
                return;
              }
              iconPanel = iconPicker(item[col.key], function (ic) {
                item[col.key] = ic;
                btn.textContent = ic;
                changed();
              });
              wrap.appendChild(iconPanel);
            }
          }, item[col.key] || '🔗');
          control = btn;
        } else {
          control = el('input', {
            class: 'input', type: col.type === 'number' ? 'number' : 'text',
            placeholder: col.placeholder || '',
            maxlength: col.maxlength || null
          });
          control.value = value === undefined || value === null ? '' : String(value);
          control.addEventListener('input', function () {
            item[col.key] = col.type === 'number' ? Number(control.value) : control.value;
            changed();
          });
        }

        wrap = el('div', { class: 'field', style: col.width ? 'flex:1 1 ' + col.width : '' }, [
          el('span', { class: 'field__label', text: col.label }),
          control,
          col.hint ? el('span', { class: 'field__hint', text: col.hint }) : null
        ]);
        body.appendChild(wrap);
      });

      // 同一行的字段排在一起更紧凑
      body.style.display = 'flex';
      body.style.flexWrap = 'wrap';
      body.style.gap = '.7rem';
      body.querySelectorAll('.field').forEach(function (f) { f.style.minWidth = '180px'; });

      return el('div', { class: 'editor-row' }, [head, body]);
    }

    render();
    return {
      el: host,
      getValue: function () { return list; },
      setValue: function (v) { list = v || []; render(); },
      render: render
    };
  }

  /* ======================================================================
   * 教材列表 <-> 文本框
   * 文本框格式：每行一本，字段用 | 分隔 —— 书名 | 主编 | 版次 | 出版社
   * ==================================================================== */
  function booksToLines(books) {
    return (books || []).map(function (b) {
      return [b.title || '', b.author || '', b.edition || '', b.publisher || ''].join(' | ')
        .replace(/\s+\|\s+\|\s+\|\s*$/, '').replace(/\s+\|\s*$/, '');
    }).join('\n');
  }

  function linesToBooks(text) {
    return String(text || '').split('\n').map(function (line) {
      line = line.trim();
      if (!line) return null;
      var parts = line.split('|').map(function (s) { return s.trim(); });
      return {
        title: parts[0] || '',
        author: parts[1] || '',
        edition: parts[2] || '',
        publisher: parts[3] || ''
      };
    }).filter(function (b) { return b && b.title; });
  }

  ENPO.adminEditors = {
    editableList: editableList,
    iconPicker: iconPicker,
    booksToLines: booksToLines,
    linesToBooks: linesToBooks
  };
})();
