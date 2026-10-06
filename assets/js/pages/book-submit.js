/* ============================================================================
 * pages/book-submit.js —— 我要出书
 * ----------------------------------------------------------------------------
 * 流程：点选填写 → 安全验证 → 提交 → 显示编辑码（务必保存）
 * 另外做了「草稿自动保存」：填到一半关掉网页，下次进来会问你要不要接着填。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, S = ENPO.store, CFG = ENPO.config;
  var el = U.el, $ = U.$;

  var DRAFT_KEY = 'draft.book-submit';

  function init() {
    var host = $('#app-content');
    if (!host) return;

    host.appendChild(UI.notice('📝', [
      '点几下就能登记你要转手的教材：选专业、选年级、勾上要出的书，填个 QQ 号就行。',
      '提交后站主审核通过，你的信息就会出现在「二手教材」页面。',
      '提交成功后你会拿到一个 8 位编辑码，凭它可以随时修改自己的信息、把状态改成「是」，或者删除这条记录。'
    ], 'plain'));

    host.appendChild(el('div', { class: 'steps', style: 'margin:1.2rem 0 1.6rem' }, [
      el('div', { class: 'step' }, [
        el('div', { class: 'step__title', text: '点选填写' }),
        el('p', { class: 'step__text', text: '大部分内容点一下就行，不用打很多字。' })
      ]),
      el('div', { class: 'step' }, [
        el('div', { class: 'step__title', text: '保存编辑码' }),
        el('p', { class: 'step__text', text: '提交后会显示一串 8 位字符，请截图或复制保存。丢了就只能重新发布。' })
      ]),
      el('div', { class: 'step' }, [
        el('div', { class: 'step__title', text: '等待审核' }),
        el('p', { class: 'step__text', text: '站主会尽快审核。审核期间你可以在「我发布的」里查看进度。' })
      ])
    ]));

    /* ---------------- 草稿提示条 ---------------- */
    var draftBannerHost = el('div');
    host.appendChild(draftBannerHost);

    var formHost = el('div', { id: 'form-host' });
    host.appendChild(formHost);

    var form = ENPO.bookForm.build(formHost, {}, { mode: 'create' });
    var guard = ENPO.guard.form(form.el, { key: 'book-submit' });

    /* ---------------- 草稿自动保存 ---------------- */
    var draftConfig = CFG.draft || {};
    var draftEnabled = draftConfig.enabled !== false;
    var lastDraft = readDraft();

    if (draftEnabled && lastDraft) {
      showResumeBanner(lastDraft);
    }

    var saveDraft = U.debounce(function () {
      if (!draftEnabled || form.el.dataset.submitted === '1') return;
      var v = form.getValue();
      if (!hasContent(v)) { U.storage.remove(DRAFT_KEY); return; }
      U.storage.setJSON(DRAFT_KEY, { value: v, at: Date.now() });
    }, 400);

    form.el.addEventListener('input', saveDraft);
    form.el.addEventListener('change', saveDraft);
    form.el.addEventListener('click', function () { setTimeout(saveDraft, 0); });
    window.addEventListener('beforeunload', function () {
      if (!draftEnabled || form.el.dataset.submitted === '1') return;
      var v = form.getValue();
      if (hasContent(v)) U.storage.setJSON(DRAFT_KEY, { value: v, at: Date.now() });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') saveDraft();
    });

    /* ---------------- 提交 ---------------- */
    form.el.addEventListener('submit', function (e) {
      e.preventDefault();
      form.setError('');

      var errs = form.validate();
      if (errs.length) { form.setError(errs[0]); return; }

      var check = guard.validate();
      if (!check.ok) { form.setError(check.message); return; }

      form.setBusy(true);
      var values = form.getValue();
      values.startedAt = guard.getStartedAt();
      values.website = guard.honeypotValue();

      S.createBook(values).then(function (res) {
        guard.commit();
        form.el.dataset.submitted = '1';
        U.storage.remove(DRAFT_KEY);
        showSuccess(res);
      }).catch(function (err) {
        form.setBusy(false);
        form.setError('提交失败：' + ((err && err.message) || '未知错误'));
      });
    });

    /* ======================================================================
     * 草稿相关
     * ==================================================================== */
    function hasContent(v) {
      return !!(v.qq || v.major || (v.terms && v.terms.length) || (v.books && v.books.length) || v.note);
    }

    function readDraft() {
      if (!draftEnabled) return null;
      var d = U.storage.getJSON(DRAFT_KEY, null);
      if (!d || !d.value || !d.at) return null;
      var maxAge = (draftConfig.maxAgeDays || 30) * 86400000;
      if (Date.now() - d.at > maxAge) { U.storage.remove(DRAFT_KEY); return null; }
      if (!hasContent(d.value)) { U.storage.remove(DRAFT_KEY); return null; }
      return d;
    }

    function showResumeBanner(draft) {
      U.clear(draftBannerHost);
      var when = U.timeAgo(draft.at);
      var summary = [];
      if (draft.value.major) summary.push('专业：' + draft.value.major);
      if ((draft.value.terms || []).length) summary.push('年级：' + draft.value.terms.join('、'));
      if ((draft.value.books || []).length) summary.push('已选 ' + draft.value.books.length + ' 本书');

      var banner = el('div', { class: 'draft-banner' }, [
        el('span', { 'aria-hidden': 'true', text: '💾' }),
        el('div', { class: 'draft-banner__text' }, [
          el('p', { style: 'margin:0 0 .25rem;font-weight:700' }, '检测到上次没有提交完的内容'),
          el('p', { style: 'margin:0;font-size:.86rem;color:var(--text-muted)' },
            when + '填写过' + (summary.length ? '（' + summary.join('，') + '）' : '') + '，要接着填吗？')
        ]),
        el('button', {
          class: 'btn btn--primary btn--tiny', type: 'button',
          onclick: function () {
            form.setValue(draft.value);
            // 把开始时间提前，避免刚点进来就被判定为"填得太快"
            guard.setStartedAt(draft.at);
            U.clear(draftBannerHost);
            form.el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            U.toast('已恢复上次填写的内容', 'success');
          }
        }, '继续填写'),
        el('button', {
          class: 'btn btn--ghost btn--tiny', type: 'button',
          onclick: function () {
            U.storage.remove(DRAFT_KEY);
            form.setValue({ qq: '', major: '', terms: [], books: [], status: 'no', note: '' });
            U.clear(draftBannerHost);
            U.toast('已清空，重新填写吧', 'info');
          }
        }, '重新填写')
      ]);
      draftBannerHost.appendChild(banner);
    }

    /* ======================================================================
     * 提交成功
     * ==================================================================== */
    function showSuccess(res) {
      U.clear(host);

      var codeBox = el('div', { class: 'code-box' }, [
        el('span', { class: 'code-box__value', id: 'my-code', text: res.editCode }),
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            U.copyText(res.editCode).then(function (ok) {
              U.toast(ok ? '编辑码已复制到剪贴板' : '复制失败，请手动选中复制', ok ? 'success' : 'warn');
            });
          }
        }, '📋 复制编辑码'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () {
            U.download('出书编辑码-' + res.editCode + '.txt',
              '西安交通大学能源与动力工程学院本科生互助网站\n出书信息编辑码：' + res.editCode +
              '\n记录 ID：' + res.id +
              '\n\n凭这个编辑码可以在「我发布的」页面修改或删除你发布的信息。\n请妥善保存，丢失后无法找回。\n',
              'text/plain;charset=utf-8');
          }
        }, '💾 下载保存')
      ]);

      host.appendChild(el('div', { class: 'form-card' }, [
        el('h2', { class: 'section__title', text: '✅ 提交成功，等待站主审核' }),
        el('p', { style: 'color:var(--text-muted)' },
          '下面是你的编辑码，请立即保存。这个码只会显示这一次（本机浏览器也已经帮你记住，可以在「我发布的」里直接管理）。'),
        codeBox,
        el('div', { class: 'notice notice--warn', style: 'margin:1.1rem 0' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '⚠️' }),
          el('div', { class: 'notice__body' }, [
            el('p', { text: '编辑码是你修改这条信息的唯一凭证，站主也无法帮你找回。请截图、复制或下载保存。' }),
            el('p', { text: '换了手机或清了浏览器数据后，可以在「我发布的」页面用「记录 ID + 编辑码」找回。' })
          ])
        ]),
        el('div', { class: 'btn-row' }, [
          el('a', { class: 'btn btn--primary', href: 'books-mine.html' }, '🗂️ 去「我发布的」看看'),
          el('a', { class: 'btn btn--ghost', href: 'books.html' }, '📚 返回二手教材'),
          el('button', {
            class: 'btn btn--ghost', type: 'button',
            onclick: function () { window.location.reload(); }
          }, '➕ 再发一条')
        ])
      ]));

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ENPO.ready().then(init);
})();
