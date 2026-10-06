/* ============================================================================
 * pages/book-mine.js —— 「我发布的」页面
 * ----------------------------------------------------------------------------
 * 只有两拨人能改一条出书信息：
 *   1. 站主（在 admin.html 里操作）
 *   2. 发布者本人（在这个页面，凭编辑码）
 * 其中「是否已出」这个状态只有发布者本人能改，站主也改不了。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, S = ENPO.store;
  var el = U.el, $ = U.$;

  function init() {
    var host = $('#app-content');
    if (!host) return;

    host.appendChild(UI.notice('🗂️', [
      '这一页列出你在这台设备上发布过的出书信息。你可以修改内容、改「是否已出」的状态，或者删除记录。',
      '换了设备或清了浏览器数据后，用提交时拿到的「记录 ID + 编辑码」也能把记录找回来。'
    ], 'plain'));

    var listHost = el('div', { id: 'mine-list', style: 'margin-top:1.4rem' });
    host.appendChild(listHost);

    /* ---------------- 找回表单 ---------------- */
    var idInput = el('input', { class: 'input', id: 'claim-id', placeholder: '例如：bk_xxxxxxxxx', autocomplete: 'off' });
    var codeInput = el('input', {
      class: 'input', id: 'claim-code', placeholder: '8 位编辑码', autocomplete: 'off',
      style: 'text-transform:uppercase'
    });
    var claimError = el('div', { class: 'form-error', role: 'alert' });
    var claimForm = el('form', { class: 'form-card', style: 'margin-top:2rem' }, [
      el('h2', { class: 'section__title', text: '🔑 在其它设备上找回我的记录' }),
      el('p', { class: 'section__desc' },
        '如果你换了手机或电脑，用发布时拿到的记录 ID 和编辑码可以把记录重新绑定到这台设备。'),
      el('div', { class: 'field-row' }, [
        el('label', { class: 'field', for: 'claim-id' }, [
          el('span', { class: 'field__label', text: '记录 ID' }), idInput
        ]),
        el('label', { class: 'field', for: 'claim-code' }, [
          el('span', { class: 'field__label', text: '编辑码' }), codeInput
        ])
      ]),
      claimError,
      el('button', { class: 'btn btn--primary', type: 'submit' }, '找回记录')
    ]);
    host.appendChild(claimForm);

    claimForm.addEventListener('submit', function (e) {
      e.preventDefault();
      claimError.textContent = '';
      var id = idInput.value.trim();
      var code = codeInput.value.trim().toUpperCase();
      if (!id || !code) { claimError.textContent = '请同时填写记录 ID 和编辑码。'; return; }

      S.lookup(id, code).then(function () {
        U.toast('找回成功！', 'success');
        idInput.value = '';
        codeInput.value = '';
        load();
      }).catch(function (err) {
        claimError.textContent = (err && err.message) || '找回失败。';
      });
    });

    /* ---------------- 加载 ---------------- */
    function load() {
      U.clear(listHost);
      S.listMyBooks().then(function (rows) {
        if (!rows.length) {
          listHost.appendChild(UI.empty('📭', '这台设备上还没有你发布过的记录。',
            '如果是换过设备，请用下面的表单找回；如果还没发布过，可以去「我要出书」登记一条。'));
          listHost.appendChild(el('div', { class: 'btn-row', style: 'justify-content:center;margin-top:1rem' }, [
            el('a', { class: 'btn btn--primary', href: 'books-submit.html' }, '✍️ 我要出书')
          ]));
          return;
        }

        var valid = rows.filter(function (r) { return r.book; });
        var missing = rows.filter(function (r) { return !r.book; });

        if (missing.length) {
          listHost.appendChild(UI.notice('⚠️',
            ['有 ' + missing.length + ' 条记录在服务器上已经找不到了（可能已被删除），已从本机列表移除。'], 'warn'));
          missing.forEach(function (m) {
            var list = (U.storage.getJSON('myEntries', []) || []).filter(function (x) { return x.id !== m.mine.id; });
            U.storage.setJSON('myEntries', list);
          });
        }

        valid.forEach(function (r) {
          listHost.appendChild(manageCard(r.book, r.mine.code, load));
        });
      }).catch(function (err) {
        listHost.appendChild(UI.empty('⚠️', '加载失败：' + ((err && err.message) || '未知错误')));
      });
    }

    load();
  }

  /* ======================================================================
   * 一张"我的记录"卡片
   * ==================================================================== */
  function manageCard(book, code, reload) {
    var reviewText = S.REVIEW_TEXT[book.review] || '未知';
    var reviewType = { pending: 'warn', approved: 'success', rejected: 'danger' }[book.review] || 'muted';

    var detailHost = el('div', { hidden: true });

    var actions = [
      el('button', {
        class: 'btn btn--ghost btn--tiny', type: 'button',
        onclick: function () {
          detailHost.hidden = !detailHost.hidden;
          this.textContent = detailHost.hidden ? '✏️ 修改信息' : '✖ 收起';
          if (!detailHost.hidden && !detailHost.dataset.built) {
            buildEditor(detailHost, book, code, reload);
            detailHost.dataset.built = '1';
          }
        }
      }, '✏️ 修改信息'),
      el('button', {
        class: 'btn btn--danger btn--tiny', type: 'button',
        onclick: function () {
          U.confirm({
            title: '确定删除这条记录吗？',
            message: '删除后这条出书信息将从网站上消失，且无法恢复。',
            okText: '确定删除', cancelText: '再想想'
          }).then(function (ok) {
            if (!ok) return;
            S.deleteBook(book.id, { actor: 'submitter', editCode: code }).then(function () {
              U.toast('已删除', 'success');
              reload();
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
        }
      }, '🗑️ 删除')
    ];

    return el('article', { class: 'book-card', style: 'margin-bottom:1rem' }, [
      el('div', { class: 'book-card__head' }, [
        el('h3', { class: 'book-card__title', text: book.major || '未注明专业' }),
        el('div', { class: 'book-card__badges' }, [
          UI.badge(reviewText, reviewType),
          el('span', {
            class: 'status-pill status--' + (book.status || 'unknown'),
            text: '是否已出：' + (S.STATUS_TEXT[book.status] || '未注明')
          }),
          book.needsReview ? UI.badge('有修改待站主复核', 'warn') : null
        ])
      ]),
      (book.terms || []).length
        ? el('div', { class: 'book-card__terms' },
          book.terms.map(function (t) { return el('span', { class: 'term-pill', text: t }); }))
        : null,
      (book.books || []).length
        ? el('div', { class: 'book-card__books' },
          book.books.map(function (t) { return el('span', { class: 'book-pill', text: t }); }))
        : null,
      book.note ? el('p', { class: 'book-card__note', text: book.note }) : null,
      book.review === 'rejected' && book.reviewNote
        ? UI.notice('❌', ['站主未通过的原因：' + book.reviewNote], 'warn')
        : null,

      /* ---- 状态快捷切换（只有本人能改） ---- */
      statusSwitch(book, code, reload),

      el('p', { class: 'book-card__meta' }, [
        el('span', null, [el('b', { text: '记录 ID：' }), el('code', { text: book.id })]),
        el('span', null, [el('b', { text: '更新于 ' }), U.timeAgo(book.updatedAt)])
      ]),
      el('div', { class: 'btn-row' }, actions),
      detailHost
    ]);
  }

  function statusSwitch(book, code, reload) {
    var statuses = (ENPO.bookForm.optionsList().statuses) || [];
    var row = el('div', { class: 'chip-row', style: 'margin:.3rem 0 .6rem' });
    row.appendChild(el('span', { class: 'field__label', style: 'margin:0 .5rem 0 0;align-self:center' }, '是否已出：'));
    statuses.forEach(function (s) {
      var active = book.status === s.value;
      row.appendChild(el('button', {
        class: 'chip chip--sm' + (active ? ' is-active' : ''),
        type: 'button',
        'aria-pressed': active ? 'true' : 'false',
        onclick: function () {
          if (active) return;
          S.updateBook(book.id, { status: s.value }, { actor: 'submitter', editCode: code })
            .then(function () {
              U.toast('已更新为「' + s.label + '」', 'success');
              reload();
            })
            .catch(function (err) { U.toast(err.message, 'error'); });
        }
      }, s.label));
    });
    return row;
  }

  /* ======================================================================
   * 内嵌编辑表单
   * ==================================================================== */
  function buildEditor(host, book, code, reload) {
    host.appendChild(el('p', { class: 'section__desc' },
      '改完点保存即可。除了「是否已出」以外的内容改动，站主会再看一眼。带 * 的是必填项。'));

    var formHost = el('div');
    host.appendChild(formHost);

    var form = ENPO.bookForm.build(formHost, {
      qq: U.deobfuscate(book.qqBlob),
      major: book.major,
      terms: book.terms,
      books: book.books,
      status: book.status,
      note: book.note
    }, { mode: 'edit', submitText: '保存修改' });

    var guard = ENPO.guard.form(form.el, { key: 'book-edit' });

    form.el.addEventListener('submit', function (e) {
      e.preventDefault();
      form.setError('');
      var errs = form.validate();
      if (errs.length) { form.setError(errs[0]); return; }

      var check = guard.validate();
      if (!check.ok) { form.setError(check.message); return; }

      form.setBusy(true);
      var v = form.getValue();

      S.updateBook(book.id, {
        qq: v.qq,
        major: v.major,
        terms: v.terms,
        books: v.books,
        note: v.note
      }, { actor: 'submitter', editCode: code }).then(function () {
        guard.commit();
        U.toast('已保存，谢谢！', 'success');
        reload();
      }).catch(function (err) {
        form.setBusy(false);
        form.setError('保存失败：' + ((err && err.message) || '未知错误'));
      });
    });
  }

  ENPO.ready().then(init);
})();
