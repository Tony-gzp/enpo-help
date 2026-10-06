/* ============================================================================
 * pages/suggest.js —— 意见建议页
 * ----------------------------------------------------------------------------
 * 完全匿名：不收集任何联系方式，站主也看不到是谁提的。
 * 留言只有站主登录后台才能看到，不会公开展示。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, S = ENPO.store;
  var el = U.el, $ = U.$;

  var CATEGORIES = ['内容有误 / 已过时', '想新增的内容', '网站功能建议', '界面 / 配色建议',
    '举报不当信息', '其它'];

  function init() {
    var host = $('#app-content');
    if (!host) return;

    host.appendChild(UI.notice('💡', [
      '这里是留给同学们的留言板：觉得哪个页面的内容过时了、想补充什么信息、网站哪里不好用，都可以写在这里。',
      '留言完全匿名，不需要填写任何联系方式，也只有站主（网站维护者）能看到，不会公开展示给其他访问者。'
    ]));

    /* ---------------- 表单 ---------------- */
    var categorySelect = el('select', { class: 'select', name: 'category', id: 'sg-category' },
      CATEGORIES.map(function (c) { return el('option', { value: c }, c); }));

    var contentInput = el('textarea', {
      class: 'textarea', name: 'content', id: 'sg-content', maxlength: 2000, required: '',
      placeholder: '请写清楚你遇到的问题或建议'
    });

    var errorBox = el('div', { class: 'form-error', role: 'alert' });
    var successBox = el('div', { class: 'form-success', hidden: true, role: 'status' });

    var form = el('form', { class: 'form-card', style: 'margin-top:1.4rem', novalidate: '' }, [
      el('div', { class: 'section__head' }, [el('h2', { class: 'section__title', text: '写下你的想法' })]),
      el('label', { class: 'field', for: 'sg-category' }, [
        el('span', { class: 'field__label', text: '建议类型' }), categorySelect
      ]),
      el('label', { class: 'field', for: 'sg-content' }, [
        el('span', { class: 'field__label' }, [
          '具体内容', el('span', { class: 'field__req', text: '*', 'aria-hidden': 'true' })
        ]),
        contentInput,
        el('span', { class: 'field__hint' },
          '最多 2000 字。不需要留联系方式——如果站主需要回复，会直接把你的建议内容更新到网站上。')
      ]),
      el('div', { class: 'notice notice--plain', style: 'margin-bottom:1.1rem' }, [
        el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '🕶️' }),
        el('div', { class: 'notice__body' }, [
          el('p', { style: 'margin:0' },
            '本站不收集、不保存你的任何身份信息。请不要在留言里主动填写自己的姓名、学号或联系方式。')
        ])
      ]),
      el('div', { class: 'section__head', style: 'margin-top:1rem' }, [
        el('h2', { class: 'section__title', text: '安全验证' })
      ]),
      el('div', { 'data-challenge': '' }),
      errorBox,
      successBox,
      el('button', { class: 'btn btn--primary btn--lg btn--block', type: 'submit' }, '匿名提交给站主')
    ]);
    host.appendChild(form);

    var guard = ENPO.guard.form(form, { key: 'suggest' });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.textContent = '';
      successBox.hidden = true;

      var content = contentInput.value.trim();
      if (content.length < 5) { errorBox.textContent = '请至少写 5 个字，方便站主理解你的意思。'; return; }
      if (/\d{6,}/.test(content) && /(微信|qq|QQ|vx|VX|电话|手机)/.test(content)) {
        errorBox.textContent = '留言是匿名的，不需要留联系方式。如果确实需要，请只写与网站内容相关的信息。';
        return;
      }

      var check = guard.validate();
      if (!check.ok) { errorBox.textContent = check.message; return; }

      S.createSuggestion({
        category: categorySelect.value,
        content: content,
        page: document.referrer || '',
        startedAt: guard.getStartedAt(),
        website: guard.honeypotValue()
      }).then(function () {
        guard.commit();
        contentInput.value = '';
        successBox.hidden = false;
        successBox.textContent = '✅ 已经收到你的留言，谢谢！站主看到后会尽快处理。';
        U.toast('留言提交成功', 'success');
        successBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }).catch(function (err) {
        errorBox.textContent = '提交失败：' + ((err && err.message) || '未知错误');
      });
    });

    host.appendChild(el('div', { class: 'section', style: 'margin-top:1.6rem' }, [
      UI.notice('🔒', [
        '你的留言不会显示在网站上，其他访客看不到，站主也看不到你是谁。',
        '站主可能会在回复中引用你的建议内容，但不会（也无法）公开你的身份。'
      ], 'plain')
    ]));
  }

  ENPO.ready().then(init);
})();
