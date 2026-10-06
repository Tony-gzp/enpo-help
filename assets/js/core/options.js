/* ============================================================================
 * options.js —— 点选式表单组件
 * ----------------------------------------------------------------------------
 * 为了让填表尽量"点几下就完事"，这里提供两个组件：
 *   chipGroup  一行行可以点的按钮（单选 / 多选），每个都有「其它」可以自己写
 *   bookPicker 按学期分组、可搜索的书籍多选器，同样支持「其它」
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var el = U.el;

  /* ======================================================================
   * chipGroup —— 单选/多选按钮组
   * @param opts {
   *   options: [string], value: string|[string], multiple: bool,
   *   allowOther: bool, otherLabel, otherPlaceholder, onChange
   * }
   * ==================================================================== */
  function chipGroup(opts) {
    opts = opts || {};
    var options = opts.options || [];
    var multiple = !!opts.multiple;
    var allowOther = opts.allowOther !== false;

    var selected = [];   // 选中的预设项
    var customs = [];    // 自己写的项
    var otherActive = false;

    /* ---------------- 初值 ---------------- */
    (function initValue() {
      var v = opts.value;
      if (v === undefined || v === null) return;
      var list = Array.isArray(v) ? v.slice() : (v ? [v] : []);
      list.forEach(function (item) {
        var s = String(item);
        if (options.indexOf(s) >= 0) {
          if (selected.indexOf(s) < 0) selected.push(s);
        } else if (s.trim()) {
          if (customs.indexOf(s) < 0) customs.push(s);
          otherActive = true;
        }
      });
    })();

    var chipsHost = el('div', { class: 'chip-row', role: 'group' });
    var otherWrap = el('div', { class: 'other-input', hidden: !otherActive });
    var otherInput = el('input', {
      class: 'input', type: 'text', autocomplete: 'off',
      placeholder: opts.otherPlaceholder || '请填写具体内容'
    });
    if (customs.length) otherInput.value = customs.join('、');

    var group = el('div', { class: 'opt-group' });

    function emit() {
      if (typeof opts.onChange === 'function') opts.onChange(getValue());
    }

    function readCustoms() {
      var raw = otherInput.value.trim();
      if (!raw) return [];
      return raw.split(/[、,，;；\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function render() {
      U.clear(chipsHost);
      options.forEach(function (opt) {
        var active = selected.indexOf(opt) >= 0;
        chipsHost.appendChild(el('button', {
          class: 'chip' + (active ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': active ? 'true' : 'false',
          onclick: function () {
            if (multiple) {
              var i = selected.indexOf(opt);
              if (i >= 0) selected.splice(i, 1); else selected.push(opt);
            } else {
              selected = (selected[0] === opt) ? [] : [opt];
              if (selected.length) { otherActive = false; otherWrap.hidden = true; }
            }
            render();
            emit();
          }
        }, [
          active ? el('span', { 'aria-hidden': 'true', text: '✓' }) : null,
          el('span', { text: opt })
        ]));
      });

      if (allowOther) {
        chipsHost.appendChild(el('button', {
          class: 'chip chip--other' + (otherActive ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': otherActive ? 'true' : 'false',
          onclick: function () {
            otherActive = !otherActive;
            otherWrap.hidden = !otherActive;
            if (otherActive) {
              if (!multiple) selected = [];
              render();
              setTimeout(function () { otherInput.focus(); }, 30);
            } else {
              otherInput.value = '';
              if (!multiple) customs = [];
            }
            emit();
          }
        }, [
          otherActive ? el('span', { 'aria-hidden': 'true', text: '✓' }) : null,
          el('span', { text: opts.otherLabel || '其它' })
        ]));
      }
    }

    otherInput.addEventListener('input', function () {
      customs = readCustoms();
      emit();
    });

    otherWrap.appendChild(otherInput);
    group.appendChild(chipsHost);
    group.appendChild(otherWrap);
    render();

    function getValue() {
      customs = readCustoms();
      if (multiple) {
        return selected.concat(customs);
      }
      if (otherActive) return customs[0] || '';
      return selected[0] || '';
    }

    function setValue(v) {
      selected = [];
      customs = [];
      otherActive = false;
      var list = Array.isArray(v) ? v : (v ? [v] : []);
      list.forEach(function (item) {
        var s = String(item).trim();
        if (!s) return;
        if (options.indexOf(s) >= 0) selected.push(s);
        else { customs.push(s); otherActive = true; }
      });
      otherInput.value = customs.join('、');
      otherWrap.hidden = !otherActive;
      render();
    }

    return { el: group, getValue: getValue, setValue: setValue, input: otherInput };
  }

  /* ======================================================================
   * bookPicker —— 可搜索、按学期分组的书籍多选器
   * @param opts { groups:[{term, items:[]}], value:[string], onChange }
   * ==================================================================== */
  function bookPicker(opts) {
    opts = opts || {};
    var groups = opts.groups || [];
    var selected = Array.isArray(opts.value) ? opts.value.slice() : [];
    var customs = [];
    var keyword = '';

    // 把不在预设清单里的值当作"自己写的"
    var known = {};
    groups.forEach(function (g) { (g.items || []).forEach(function (i) { known[i] = 1; }); });
    selected = selected.filter(function (s) {
      if (known[s]) return true;
      if (customs.indexOf(s) < 0) customs.push(s);
      return false;
    });

    var root = el('div', { class: 'book-picker' });
    var tagsHost = el('div', { class: 'picker-tags' });
    var searchInput = el('input', {
      class: 'input', type: 'search', autocomplete: 'off',
      placeholder: '搜索书名，例如：高数、传热学、四级…', 'aria-label': '搜索书名'
    });
    var groupsHost = el('div', { class: 'picker-groups' });
    var otherInput = el('input', {
      class: 'input', type: 'text', autocomplete: 'off',
      placeholder: '清单里没有？在这里补充书名，多个用「、」隔开'
    });
    if (customs.length) otherInput.value = customs.join('、');

    var collapsed = {};
    groups.forEach(function (g) { collapsed[g.term] = true; });

    function emit() {
      if (typeof opts.onChange === 'function') opts.onChange(getValue());
    }

    function readCustoms() {
      var raw = otherInput.value.trim();
      if (!raw) return [];
      return raw.split(/[、,，;；\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function toggle(title) {
      var i = selected.indexOf(title);
      if (i >= 0) selected.splice(i, 1); else selected.push(title);
      render();
      emit();
    }

    function renderTags() {
      U.clear(tagsHost);
      var all = selected.concat(readCustoms());
      if (!all.length) {
        tagsHost.appendChild(el('span', { class: 'picker-tags__empty', text: '还没有选择书籍' }));
        return;
      }
      tagsHost.appendChild(el('span', { class: 'picker-tags__label', text: '已选 ' + all.length + ' 项：' }));
      all.forEach(function (t) {
        tagsHost.appendChild(el('button', {
          class: 'tag', type: 'button', title: '点击移除',
          onclick: function () {
            var i = selected.indexOf(t);
            if (i >= 0) { selected.splice(i, 1); }
            else {
              customs = readCustoms().filter(function (x) { return x !== t; });
              otherInput.value = customs.join('、');
            }
            render();
            emit();
          }
        }, [el('span', { text: t }), el('span', { class: 'tag__x', 'aria-hidden': 'true', text: '×' })]));
      });
    }

    function renderGroups() {
      U.clear(groupsHost);
      var kw = keyword.trim().toLowerCase();
      var shown = 0;

      groups.forEach(function (g) {
        var items = (g.items || []).filter(function (i) {
          return !kw || i.toLowerCase().indexOf(kw) >= 0;
        });
        if (!items.length) return;
        shown++;

        var isCollapsed = kw ? false : collapsed[g.term];
        var pickedCount = items.filter(function (i) { return selected.indexOf(i) >= 0; }).length;

        var head = el('button', {
          class: 'picker-group__head', type: 'button',
          'aria-expanded': isCollapsed ? 'false' : 'true',
          onclick: function () {
            collapsed[g.term] = !collapsed[g.term];
            renderGroups();
          }
        }, [
          el('span', { class: 'picker-group__arrow', 'aria-hidden': 'true', text: isCollapsed ? '▸' : '▾' }),
          el('span', { class: 'picker-group__name', text: g.term }),
          el('span', { class: 'picker-group__count', text: items.length + ' 项' }),
          pickedCount ? el('span', { class: 'badge badge--brand', text: '已选 ' + pickedCount }) : null
        ]);

        var body = el('div', { class: 'picker-group__body', hidden: isCollapsed },
          items.map(function (item) {
            var active = selected.indexOf(item) >= 0;
            return el('button', {
              class: 'chip chip--sm' + (active ? ' is-active' : ''),
              type: 'button',
              'aria-pressed': active ? 'true' : 'false',
              onclick: function () { toggle(item); }
            }, [
              active ? el('span', { 'aria-hidden': 'true', text: '✓' }) : null,
              el('span', { text: item })
            ]);
          }));

        groupsHost.appendChild(el('div', { class: 'picker-group' }, [head, body]));
      });

      if (!shown) {
        groupsHost.appendChild(el('p', { class: 'picker-empty', text: '没有找到包含「' + keyword + '」的书，可以在下面自己填写。' }));
      }
    }

    function render() {
      renderTags();
      renderGroups();
    }

    searchInput.addEventListener('input', U.debounce(function () {
      keyword = searchInput.value;
      renderGroups();
    }, 150));

    otherInput.addEventListener('input', function () {
      renderTags();
      emit();
    });

    root.appendChild(el('div', { class: 'picker-top' }, [searchInput]));
    root.appendChild(tagsHost);
    root.appendChild(el('div', { class: 'picker-actions' }, [
      el('button', {
        class: 'btn btn--tiny btn--ghost', type: 'button',
        onclick: function () {
          var unfold = Object.keys(collapsed).some(function (k) { return collapsed[k]; });
          Object.keys(collapsed).forEach(function (k) { collapsed[k] = !unfold; });
          renderGroups();
        }
      }, '展开 / 收起全部'),
      el('button', {
        class: 'btn btn--tiny btn--ghost', type: 'button',
        onclick: function () { selected = []; render(); emit(); }
      }, '清空已选')
    ]));
    root.appendChild(groupsHost);
    root.appendChild(el('div', { class: 'picker-other' }, [
      el('span', { class: 'picker-other__label', text: '其它（清单里没有的）' }),
      otherInput
    ]));
    render();

    function getValue() {
      return selected.concat(readCustoms());
    }
    function setValue(v) {
      selected = [];
      customs = [];
      (Array.isArray(v) ? v : []).forEach(function (s) {
        s = String(s).trim();
        if (!s) return;
        if (known[s]) selected.push(s); else customs.push(s);
      });
      otherInput.value = customs.join('、');
      render();
    }

    return { el: root, getValue: getValue, setValue: setValue };
  }

  ENPO.options = { chipGroup: chipGroup, bookPicker: bookPicker };
})();
