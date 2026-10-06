/* ============================================================================
 * pages/book-form.js —— 出书表单（提交页、"我发布的"、"站主后台"三处共用）
 * ----------------------------------------------------------------------------
 * 设计原则：能点选就不要打字。
 *   1. QQ 号          手填（数字）
 *   2. 专业            点选，带「其它」
 *   3. 出的年级 / 类型  点选（可多选），带「其它」
 *   4. 有哪些书        分组 + 搜索的多选器，带「其它」
 *   5. 是否已出        点选（否 / 正在联系中 / 未出完 / 是）
 *   6. 备注            手填（选填）
 * 选项来自 data/book-options.js，站主可以在后台的「选项管理」里改。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, el = U.el;

  var DEFAULT_MAJORS = ['能动A模块', '能动B模块', '能动C模块', '能动D模块', '新能源',
    '核工程A模块', '核工程B模块', '核工程C模块', '能动强基', '环境工程', '储能', '其它'];
  var DEFAULT_TERMS = ['大一上', '大一下', '大二上', '大二下', '大三上', '大三下', '大四上', '大四下', '通识课', '其它资料'];
  var DEFAULT_STATUSES = [
    { value: 'no', label: '否', desc: '都还在，随时可以联系' },
    { value: 'contacting', label: '正在联系中', desc: '有人在联系了，还没定下来' },
    { value: 'partial', label: '未出完', desc: '出了一部分，剩下的还可以联系' },
    { value: 'yes', label: '是', desc: '已经全部出掉了' }
  ];

  function optionsList() {
    var o = ENPO.content.get('bookOptions', {}) || {};
    return {
      majors: (o.majors && o.majors.length) ? o.majors : DEFAULT_MAJORS,
      terms: (o.terms && o.terms.length) ? o.terms : DEFAULT_TERMS,
      statuses: (o.statuses && o.statuses.length) ? o.statuses : DEFAULT_STATUSES,
      bookGroups: o.bookGroups || []
    };
  }

  function field(labelText, control, hint, required) {
    return el('div', { class: 'field' }, [
      el('span', { class: 'field__label' }, [
        labelText,
        required ? el('span', { class: 'field__req', text: '*', 'aria-hidden': 'true' }) : null
      ]),
      control,
      hint ? el('span', { class: 'field__hint', text: hint }) : null
    ]);
  }

  /**
   * @param host   容器
   * @param values 初始值
   * @param opts   { submitText, mode:'create'|'edit', onSubmit }
   */
  function build(host, values, opts) {
    opts = opts || {};
    values = values || {};
    var OPTS = optionsList();

    var form = el('form', { class: 'form-card', novalidate: '' });

    /* ---------------- 1. QQ 号 ---------------- */
    var qqInput = el('input', {
      class: 'input', type: 'text', name: 'qq', id: 'bk-qq',
      inputmode: 'numeric', autocomplete: 'off', maxlength: 12,
      placeholder: '你的 QQ 号，学弟学妹会通过它联系你'
    });

    /* ---------------- 2. 专业 ---------------- */
    var majorPicker = ENPO.options.chipGroup({
      options: OPTS.majors,
      value: values.major || '',
      multiple: false,
      allowOther: true,
      otherPlaceholder: '例如：储能科学与工程、双学位班…'
    });

    /* ---------------- 3. 出的年级 / 类型 ---------------- */
    var termPicker = ENPO.options.chipGroup({
      options: OPTS.terms,
      value: values.terms || [],
      multiple: true,
      allowOther: true,
      otherPlaceholder: '例如：大二小学期、暑期课程…'
    });

    /* ---------------- 4. 有哪些书 ---------------- */
    var bookPick = ENPO.options.bookPicker({
      groups: OPTS.bookGroups,
      value: values.books || []
    });

    /* ---------------- 5. 是否已出 ---------------- */
    var statusValue = values.status || 'no';
    var statusPicker = ENPO.options.chipGroup({
      options: OPTS.statuses.map(function (s) { return s.label; }),
      value: (OPTS.statuses.filter(function (s) { return s.value === statusValue; })[0] || OPTS.statuses[0]).label,
      multiple: false,
      allowOther: false
    });
    var statusDesc = el('p', { class: 'field__hint' });
    function syncStatusDesc() {
      var label = statusPicker.getValue();
      var found = OPTS.statuses.filter(function (s) { return s.label === label; })[0];
      statusDesc.textContent = found ? found.desc : '';
    }
    statusPicker.el.addEventListener('click', function () { setTimeout(syncStatusDesc, 0); });
    syncStatusDesc();

    /* ---------------- 6. 备注 ---------------- */
    var noteInput = el('textarea', {
      class: 'textarea', name: 'note', id: 'bk-note', maxlength: 1000,
      placeholder: '选填。可以写：书的版次、是否有笔记、缺哪几本、希望怎么交易等。'
    });
    if (values.note) noteInput.value = values.note;

    /* ---------------- 组装 ---------------- */
    form.appendChild(el('div', { class: 'section__head' }, [
      el('h2', { class: 'section__title', text: '出书信息' })
    ]));

    form.appendChild(field('QQ 号', qqInput,
      '只有 QQ 号会公开，页面上默认打码显示，同学点「查看联系方式」才会看到。', true));
    form.appendChild(field('专业', majorPicker.el,
      '选你所在的专业或模块。选项里没有的，可以点「其它」自己写。', true));
    form.appendChild(field('出的年级 / 类型', termPicker.el,
      '可以多选。例如同时出「大一上」「大一下」的书，就两个都点一下。', true));
    form.appendChild(field('有哪些书', bookPick.el,
      '可以搜索，也可以按学期一组一组地勾。清单里没有的书，写在最下面的「其它」里。'));
    form.appendChild(field('是否已出', statusPicker.el, '', true));
    form.appendChild(statusDesc);
    if (opts.lockStatus) {
      statusPicker.el.style.pointerEvents = 'none';
      statusPicker.el.style.opacity = '.6';
      statusPicker.el.setAttribute('aria-disabled', 'true');
      statusDesc.textContent = '这一项由发布者本人维护，站主不能修改（同学把书出掉后会自己改成「是」）。';
      statusDesc.style.color = 'var(--warn)';
    }
    form.appendChild(field('备注', noteInput, '选填，最多 1000 字。'));

    /* ---------------- 安全验证 + 提交 ---------------- */
    form.appendChild(el('hr'));
    form.appendChild(el('div', { class: 'section__head' }, [
      el('h2', { class: 'section__title', text: '安全验证' })
    ]));
    var challengeHost = el('div', { 'data-challenge': '' });
    form.appendChild(challengeHost);

    var errorBox = el('div', { class: 'form-error', role: 'alert' });
    form.appendChild(errorBox);

    var submitBtn = el('button', {
      class: 'btn btn--primary btn--lg btn--block', type: 'submit'
    }, opts.submitText || '提交，等待站主审核');
    form.appendChild(submitBtn);
    form.appendChild(el('p', { class: 'field__hint', style: 'text-align:center;margin-top:.7rem' },
      '提交后需要站主人工审核，通过后才会出现在「二手教材」页面。'));

    host.appendChild(form);

    /* ---------------- 取值 / 赋值 ---------------- */
    function getValue() {
      return {
        qq: qqInput.value.trim(),
        major: majorPicker.getValue(),
        terms: termPicker.getValue(),
        books: bookPick.getValue(),
        status: (OPTS.statuses.filter(function (s) {
          return s.label === statusPicker.getValue();
        })[0] || {}).value || 'no',
        note: noteInput.value.trim()
      };
    }

    function setValue(v) {
      v = v || {};
      if (v.qq !== undefined) qqInput.value = v.qq || '';
      if (v.major !== undefined) majorPicker.setValue(v.major || '');
      if (v.terms !== undefined) termPicker.setValue(v.terms || []);
      if (v.books !== undefined) bookPick.setValue(v.books || []);
      if (v.status !== undefined) {
        var found = OPTS.statuses.filter(function (s) { return s.value === v.status; })[0];
        statusPicker.setValue(found ? found.label : OPTS.statuses[0].label);
        syncStatusDesc();
      }
      if (v.note !== undefined) noteInput.value = v.note || '';
    }

    function validate() {
      var v = getValue();
      var errs = [];
      if (!/^\d{5,12}$/.test(v.qq)) errs.push('请填写正确的 QQ 号（5～12 位数字）');
      if (!v.major) errs.push('请选择专业');
      if (!v.terms.length) errs.push('请至少选择一个出的年级或类型');
      if (!v.books.length && !v.note) errs.push('请至少选择一本书，或者在备注里写清楚有哪些书');
      qqInput.setAttribute('aria-invalid', /^\d{5,12}$/.test(v.qq) ? 'false' : 'true');
      return errs;
    }

    function setError(msg) {
      errorBox.textContent = msg || '';
      if (msg) errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function setBusy(busy) {
      submitBtn.disabled = !!busy;
      submitBtn.textContent = busy ? '正在提交…' : (opts.submitText || '提交，等待站主审核');
    }

    if (opts.mode === 'edit') setValue(values);

    return {
      el: form, getValue: getValue, setValue: setValue,
      validate: validate, setError: setError, setBusy: setBusy,
      focus: function () { qqInput.focus(); }
    };
  }

  ENPO.bookForm = { build: build, optionsList: optionsList };
})();
