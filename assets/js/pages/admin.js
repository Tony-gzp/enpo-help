/* ============================================================================
 * pages/admin.js —— 站主后台
 * ----------------------------------------------------------------------------
 * 能做的事：
 *   1. 概览：各类数据统计
 *   2. 待审核：审核同学提交的出书信息（通过 / 不通过）
 *   3. 全部条目：搜索、修改、删除（注意："是否已出"只有发布者本人能改）
 *   4. 建议箱：完全匿名的网站建议
 *   5. 内容编辑：常见问题 / 校内网站（带图标选择器）/ 通识课 / 培养方案
 *   6. 选项管理：专业、年级类型、是否已出、书籍清单
 *   7. 数据与设置：导出备份、导入、初始数据、口令
 *
 * 【安全提醒】在线模式下，口令校验、频率限制、权限判断都在服务端完成，
 *   这个页面拿到的令牌只是一个短期凭证，改不了别人不该改的东西。
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = window.ENPO;
  var U = ENPO.util, UI = ENPO.ui, S = ENPO.store, CFG = ENPO.config;
  var E = null;
  var el = U.el, $ = U.$;

  var TABS = [
    { key: 'overview', label: '概览', icon: '📊' },
    { key: 'pending', label: '待审核', icon: '🕵️' },
    { key: 'all', label: '全部条目', icon: '📚' },
    { key: 'suggestions', label: '建议箱', icon: '💡' },
    { key: 'content', label: '内容编辑', icon: '✏️' },
    { key: 'options', label: '选项管理', icon: '🎛️' },
    { key: 'settings', label: '数据与设置', icon: '⚙️' }
  ];
  var currentTab = 'overview';
  var tabHost = null;

  function init() {
    E = ENPO.adminEditors;
    var host = $('#app-content');
    if (!host) return;
    if (S.isAdmin()) renderAdmin(host); else renderLogin(host);
  }

  /* ======================================================================
   * 登录
   * ==================================================================== */
  function renderLogin(host) {
    U.clear(host);

    var errorBox = el('div', { class: 'form-error', role: 'alert' });
    var pwInput = el('input', {
      class: 'input', type: 'password', id: 'admin-pw', autocomplete: 'current-password',
      placeholder: '请输入站主口令'
    });
    var submitBtn = el('button', { class: 'btn btn--primary btn--lg btn--block', type: 'submit' }, '进入后台');

    var form = el('form', { class: 'form-card', style: 'max-width:520px;margin:0 auto' }, [
      el('h2', { class: 'section__title', text: '🔐 站主后台' }),
      el('p', { class: 'section__desc' },
        '这一页只有站主本人使用，用于审核出书信息、查看建议和维护网站内容。'),
      el('label', { class: 'field', for: 'admin-pw' }, [
        el('span', { class: 'field__label', text: '口令' }), pwInput
      ]),
      errorBox,
      submitBtn
    ]);
    host.appendChild(form);

    host.appendChild(el('div', { style: 'max-width:520px;margin:1.2rem auto 0' }, [
      UI.notice('ℹ️', [
        S.isLocal
          ? '当前是离线模式，口令用的是 assets/js/config.js 里的设置（默认 enpo-admin-2026）。'
          : '当前是在线模式，口令由服务器保存和校验，连续输错 5 次会锁定 10 分钟。',
        S.isLocal
          ? '离线模式下改的内容只存在你自己这台设备上。想让所有人看到，需要部署成在线模式（见 README）。'
          : '登录后 12 小时内不用重复输入。'
      ], 'plain'),
      el('p', { style: 'text-align:center;margin-top:1rem' }, [
        el('a', { href: 'home.html' }, '← 返回首页')
      ])
    ]));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.textContent = '';
      if (!pwInput.value) { errorBox.textContent = '请输入口令。'; return; }
      submitBtn.disabled = true;
      submitBtn.textContent = '正在验证…';
      S.adminLogin(pwInput.value).then(function () {
        U.toast('登录成功', 'success');
        renderAdmin($('#app-content'));
      }).catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = '进入后台';
        errorBox.textContent = (err && err.message) || '登录失败。';
        pwInput.value = '';
        pwInput.focus();
      });
    });

    pwInput.focus();
  }

  /* ======================================================================
   * 后台骨架
   * ==================================================================== */
  function renderAdmin(host) {
    U.clear(host);

    host.appendChild(el('div', { class: 'toolbar', style: 'justify-content:space-between' }, [
      el('div', null, [
        el('strong', { text: '🔐 站主后台' }),
        el('span', { style: 'color:var(--text-faint);font-size:.85rem;margin-left:.6rem' },
          S.isLocal ? '离线模式（数据只在本机）' : '在线模式（数据在云端，所有人共享）')
      ]),
      el('div', { class: 'toolbar__actions' }, [
        el('a', { class: 'btn btn--ghost btn--tiny', href: 'books.html' }, '看看前台'),
        el('button', {
          class: 'btn btn--ghost btn--tiny', type: 'button',
          onclick: function () {
            U.confirm({ title: '退出登录？', message: '退出后需要重新输入口令。', okText: '退出' })
              .then(function (ok) {
                if (!ok) return;
                S.adminLogout().then(function () { window.location.reload(); });
              });
          }
        }, '退出登录')
      ])
    ]));

    if (S.isLocal) {
      host.appendChild(el('div', { style: 'margin-bottom:1rem' }, [
        UI.notice('⚠️', [
          '当前是离线模式：你在这里改的内容只保存在本机浏览器里，其他同学看不到。',
          '想让所有人共享，请按 README 的说明部署成在线模式（Cloudflare Pages + D1 数据库）。'
        ], 'warn')
      ]));
    }

    var bar = el('div', { class: 'tabs', role: 'tablist' });
    tabHost = el('div', { id: 'admin-tab-host' });
    TABS.forEach(function (t) {
      var btn = el('button', {
        class: 'tab' + (t.key === currentTab ? ' is-active' : ''), type: 'button', role: 'tab',
        onclick: function () {
          currentTab = t.key;
          Array.prototype.forEach.call(bar.children, function (c) { c.classList.remove('is-active'); });
          btn.classList.add('is-active');
          renderTab();
        }
      }, [
        t.icon + ' ' + t.label,
        el('span', { class: 'tab__count', id: 'tab-count-' + t.key, hidden: true })
      ]);
      bar.appendChild(btn);
    });
    host.appendChild(bar);
    host.appendChild(tabHost);
    renderTab();
    refreshCounts();
  }

  function setCount(key, n) {
    var badge = $('#tab-count-' + key);
    if (!badge) return;
    if (n > 0) { badge.hidden = false; badge.textContent = String(n); }
    else { badge.hidden = true; }
  }

  function refreshCounts() {
    S.stats().then(function (s) { setCount('pending', s.pending + s.needsReview); }).catch(function () {});
    S.listSuggestions().then(function (list) {
      setCount('suggestions', (list || []).filter(function (x) { return !x.handled; }).length);
    }).catch(function () {});
  }

  function renderTab() {
    U.clear(tabHost);
    var map = {
      overview: renderOverview, pending: renderPending, all: renderAll,
      suggestions: renderSuggestions, content: renderContent,
      options: renderOptions, settings: renderSettings
    };
    (map[currentTab] || renderOverview)(tabHost);
  }
  function reload() { renderTab(); refreshCounts(); }

  /* ======================================================================
   * 概览
   * ==================================================================== */
  function renderOverview(host) {
    host.appendChild(UI.sectionTitle('数据概览', ''));
    S.stats().then(function (s) {
      host.appendChild(UI.statRow([
        { label: '出书信息总数', value: s.total, type: 'brand' },
        { label: '待审核', value: s.pending + s.needsReview, type: 'warn' },
        { label: '已通过', value: s.approved, type: 'success' },
        { label: '未通过', value: s.rejected },
        { label: '还能联系', value: s.available },
        { label: '已出完', value: s.sold }
      ]));
    }).catch(function (e) {
      host.appendChild(UI.notice('⚠️', ['读取统计失败：' + e.message], 'warn'));
    });

    host.appendChild(el('div', { style: 'margin-top:1.6rem' }, [
      UI.sectionTitle('常用操作', ''),
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () { currentTab = 'pending'; renderAdmin($('#app-content')); }
        }, '🕵️ 去审核出书信息'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () { currentTab = 'suggestions'; renderAdmin($('#app-content')); }
        }, '💡 看意见建议'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () { currentTab = 'content'; renderAdmin($('#app-content')); }
        }, '✏️ 改网站内容'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () { currentTab = 'options'; renderAdmin($('#app-content')); }
        }, '🎛️ 改表单选项')
      ])
    ]));

    host.appendChild(el('div', { style: 'margin-top:1.6rem' }, [
      UI.sectionTitle('使用建议', ''),
      UI.notice('💡', [
        '同学提交的出书信息会先进入「待审核」，通过后才会出现在前台。',
        '发布者自己改了内容后，条目会被标记「有修改待复核」，在「待审核」里能看到。',
        '「是否已出」这个状态只有发布者本人能改——这是刻意设计的，避免站主误改。',
        '网站上的文字内容（常见问题、校内网站、通识课、培养方案）都可以在「内容编辑」里改，改完立即对所有人生效。',
        '建议每隔一段时间在「数据与设置」里导出一次备份。'
      ], 'plain')
    ]));
  }

  /* ======================================================================
   * 待审核
   * ==================================================================== */
  function renderPending(host) {
    host.appendChild(UI.sectionTitle('待审核的出书信息', '审核通过后才会出现在「二手教材」页面。'));

    var newHost = el('div');
    var recheckHost = el('div');
    host.appendChild(el('h3', { style: 'margin-top:1.4rem' }, ['🆕 新提交']));
    host.appendChild(newHost);
    host.appendChild(el('h3', { style: 'margin-top:2rem' }, ['✏️ 发布者改过、需要复核']));
    host.appendChild(recheckHost);

    S.listAllBooks().then(function (all) {
      var pending = all.filter(function (b) { return b.review === 'pending'; });
      var recheck = all.filter(function (b) { return b.review === 'approved' && b.needsReview; });
      U.clear(newHost);
      U.clear(recheckHost);
      if (!pending.length) newHost.appendChild(UI.empty('✅', '没有待审核的新条目。'));
      if (!recheck.length) recheckHost.appendChild(UI.empty('✅', '没有需要复核的修改。'));
      pending.forEach(function (b) { newHost.appendChild(bookCard(b, 'review', reload)); });
      recheck.forEach(function (b) { recheckHost.appendChild(bookCard(b, 'recheck', reload)); });
    }).catch(function (e) {
      newHost.appendChild(UI.empty('⚠️', '加载失败：' + e.message));
    });
  }

  /* ======================================================================
   * 全部条目
   * ==================================================================== */
  function renderAll(host) {
    host.appendChild(UI.sectionTitle('全部出书信息',
      '你可以修改内容或删除条目，但「是否已出」这个状态只有发布者本人能修改。'));

    var searchInput = el('input', { class: 'input', type: 'search', placeholder: '搜索专业、书名、备注、记录 ID…' });
    var reviewSelect = el('select', { class: 'select' }, [
      el('option', { value: '' }, '全部审核状态'),
      el('option', { value: 'pending' }, '待审核'),
      el('option', { value: 'approved' }, '已通过'),
      el('option', { value: 'rejected' }, '未通过')
    ]);
    var statusSelect = el('select', { class: 'select' }, [el('option', { value: '' }, '全部出书状态')]);
    ((ENPO.content.get('bookOptions', {}).statuses) || []).forEach(function (s) {
      statusSelect.appendChild(el('option', { value: s.value }, s.label));
    });

    host.appendChild(el('div', { class: 'toolbar' }, [
      el('label', { class: 'field toolbar__field' }, [el('span', { class: 'field__label', text: '搜索' }), searchInput]),
      el('label', { class: 'field toolbar__field' }, [el('span', { class: 'field__label', text: '审核状态' }), reviewSelect]),
      el('label', { class: 'field toolbar__field' }, [el('span', { class: 'field__label', text: '是否已出' }), statusSelect])
    ]));

    var listHost = el('div');
    host.appendChild(listHost);

    function render() {
      U.clear(listHost);
      S.listAllBooks().then(function (all) {
        var kw = searchInput.value.trim().toLowerCase();
        var list = all.filter(function (b) {
          if (reviewSelect.value && b.review !== reviewSelect.value) return false;
          if (statusSelect.value && b.status !== statusSelect.value) return false;
          if (kw) {
            var hay = [b.major, b.note, b.id, (b.terms || []).join(' '), (b.books || []).join(' ')]
              .join(' ').toLowerCase();
            if (hay.indexOf(kw) < 0) return false;
          }
          return true;
        });
        if (!list.length) { listHost.appendChild(UI.empty('📭', '没有符合条件的条目。')); return; }
        list.forEach(function (b) { listHost.appendChild(bookCard(b, 'manage', reload)); });
      }).catch(function (e) {
        listHost.appendChild(UI.empty('⚠️', '加载失败：' + e.message));
      });
    }

    searchInput.addEventListener('input', U.debounce(render, 180));
    reviewSelect.addEventListener('change', render);
    statusSelect.addEventListener('change', render);
    render();
  }

  /* ======================================================================
   * 出书信息卡片
   * ==================================================================== */
  function bookCard(b, modeKind, onDone) {
    var reviewText = S.REVIEW_TEXT[b.review] || '未知';
    var reviewType = { pending: 'warn', approved: 'success', rejected: 'danger' }[b.review] || 'muted';
    var editorHost = el('div', { hidden: true });
    var noteInput = el('input', { class: 'input', placeholder: '不通过的原因（会显示给发布者）' });

    var actions = [];
    if (modeKind === 'review' || modeKind === 'recheck') {
      actions.push(el('button', {
        class: 'btn btn--success btn--tiny', type: 'button',
        onclick: function () {
          S.updateBook(b.id, { review: 'approved', reviewNote: '', needsReview: false }, { actor: 'owner' })
            .then(function () { U.toast('已通过', 'success'); onDone(); })
            .catch(function (e) { U.toast(e.message, 'error'); });
        }
      }, modeKind === 'recheck' ? '✅ 复核通过' : '✅ 通过'));
      actions.push(el('button', {
        class: 'btn btn--danger btn--tiny', type: 'button',
        onclick: function () {
          U.confirm({
            title: '确定不通过吗？',
            message: noteInput.value ? '将记录原因：' + noteInput.value : '没有填写原因，发布者只会看到「未通过」。',
            okText: '确定不通过'
          }).then(function (ok) {
            if (!ok) return;
            S.updateBook(b.id, { review: 'rejected', reviewNote: noteInput.value.trim() }, { actor: 'owner' })
              .then(function () { U.toast('已标记为不通过', 'success'); onDone(); })
              .catch(function (e) { U.toast(e.message, 'error'); });
          });
        }
      }, '❌ 不通过'));
    }

    actions.push(el('button', {
      class: 'btn btn--ghost btn--tiny', type: 'button',
      onclick: function () {
        editorHost.hidden = !editorHost.hidden;
        this.textContent = editorHost.hidden ? '✏️ 修改内容' : '✖ 收起';
        if (!editorHost.hidden && !editorHost.dataset.built) {
          buildBookEditor(editorHost, b, onDone);
          editorHost.dataset.built = '1';
        }
      }
    }, '✏️ 修改内容'));

    if (modeKind === 'manage') {
      actions.push(el('button', {
        class: 'btn btn--danger btn--tiny', type: 'button',
        onclick: function () {
          U.confirm({
            title: '确定删除这条记录吗？',
            message: (b.major || '这条记录') + ' 将被永久删除，发布者也会看到记录消失。',
            okText: '确定删除'
          }).then(function (ok) {
            if (!ok) return;
            S.deleteBook(b.id, { actor: 'owner' }).then(function () {
              U.toast('已删除', 'success'); onDone();
            }).catch(function (e) { U.toast(e.message, 'error'); });
          });
        }
      }, '🗑️ 删除'));
    }

    return el('article', { class: 'book-card', style: 'margin-bottom:1rem' }, [
      el('div', { class: 'book-card__head' }, [
        el('h3', { class: 'book-card__title', text: b.major || '未注明专业' }),
        el('div', { class: 'book-card__badges' }, [
          UI.badge(reviewText, reviewType),
          el('span', {
            class: 'status-pill status--' + (b.status || 'unknown'),
            text: '是否已出：' + (S.STATUS_TEXT[b.status] || '未注明')
          }),
          b.needsReview ? UI.badge('有修改待复核', 'warn') : null,
          b.origin === 'seed' ? UI.badge('初始数据', 'muted') : null
        ])
      ]),
      (b.terms || []).length
        ? el('div', { class: 'book-card__terms' },
          b.terms.map(function (t) { return el('span', { class: 'term-pill', text: t }); }))
        : null,
      (b.books || []).length
        ? el('div', { class: 'book-card__books' },
          b.books.map(function (t) { return el('span', { class: 'book-pill', text: t }); }))
        : null,
      b.note ? el('p', { class: 'book-card__note', text: b.note }) : null,
      b.reviewNote ? el('p', { class: 'section__desc' }, ['不通过原因：' + b.reviewNote]) : null,
      el('p', { class: 'book-card__meta' }, [
        el('span', null, [el('b', { text: '记录 ID：' }), el('code', { text: b.id })]),
        el('span', null, [el('b', { text: '提交于 ' }), U.formatDateTime(b.createdAt)]),
        el('span', null, [el('b', { text: '更新于 ' }), U.formatDateTime(b.updatedAt)])
      ]),
      el('div', { class: 'contact-box', 'data-contact-box': '' }, [
        el('button', {
          class: 'btn btn--ghost btn--tiny', type: 'button',
          'data-reveal-contact': '', 'data-blob': b.qqBlob, 'data-type': 'QQ 号'
        }, '👀 查看 QQ 号（仅你可见）')
      ]),
      (modeKind === 'review' || modeKind === 'recheck')
        ? el('label', { class: 'field', style: 'margin-top:.6rem' }, [
          el('span', { class: 'field__label', text: '不通过的原因（选填）' }), noteInput
        ])
        : null,
      el('div', { class: 'btn-row' }, actions),
      editorHost
    ]);
  }

  function buildBookEditor(host, book, onDone) {
    host.appendChild(UI.notice('ℹ️', ['站主可以修改除「是否已出」以外的所有字段，保存后立即生效。'], 'plain'));

    var form = ENPO.bookForm.build(host, {
      qq: U.deobfuscate(book.qqBlob),
      major: book.major,
      terms: book.terms,
      books: book.books,
      status: book.status,
      note: book.note
    }, { mode: 'edit', submitText: '保存修改（站主）', lockStatus: true });

    form.el.addEventListener('submit', function (e) {
      e.preventDefault();
      form.setError('');
      var errs = form.validate();
      if (errs.length) { form.setError(errs[0]); return; }
      form.setBusy(true);
      var v = form.getValue();
      S.updateBook(book.id, {
        qq: v.qq, major: v.major, terms: v.terms, books: v.books, note: v.note
      }, { actor: 'owner' }).then(function () {
        U.toast('已保存', 'success');
        onDone();
      }).catch(function (err) {
        form.setBusy(false);
        form.setError('保存失败：' + err.message);
      });
    });
  }

  /* ======================================================================
   * 建议箱（全匿名）
   * ==================================================================== */
  function renderSuggestions(host) {
    host.appendChild(UI.sectionTitle('意见建议', '完全匿名，只有你能看到，其他访客无法访问。'));

    host.appendChild(el('div', { class: 'btn-row', style: 'margin-bottom:1.2rem' }, [
      el('button', {
        class: 'btn btn--ghost btn--tiny', type: 'button',
        onclick: function () {
          S.listSuggestions().then(function (list) {
            if (!list.length) { U.toast('还没有留言', 'warn'); return; }
            var txt = list.map(function (s) {
              return '[' + U.formatDateTime(s.createdAt) + '][' + s.category + '] ' + s.content
                + (s.adminReply ? '\n我的处理备注：' + s.adminReply : '');
            }).join('\n\n----------\n\n');
            U.download('网站建议-' + U.formatDate(Date.now()) + '.txt', txt, 'text/plain;charset=utf-8');
          }).catch(function (e) { U.toast(e.message, 'error'); });
        }
      }, '⬇️ 导出全部留言'),
      el('span', { class: 'field__hint', style: 'align-self:center' },
        '留言不含任何联系方式，无法回复到个人，请按内容自行处理。')
    ]));

    var listHost = el('div');
    host.appendChild(listHost);

    function render() {
      U.clear(listHost);
      S.listSuggestions().then(function (list) {
        if (!list.length) {
          listHost.appendChild(UI.empty('📭', '还没有收到留言。', '等同学们提意见吧。'));
          return;
        }
        list.forEach(function (s) {
          var replyInput = el('textarea', {
            class: 'textarea', style: 'min-height:80px',
            placeholder: '记录一下你的处理结果（只有你自己能看到）'
          });
          replyInput.value = s.adminReply || '';

          listHost.appendChild(el('article', { class: 'book-card', style: 'margin-bottom:1rem' }, [
            el('div', { class: 'book-card__head' }, [
              el('h3', { class: 'book-card__title', style: 'font-size:1rem', text: '[' + s.category + ']' }),
              el('div', { class: 'book-card__badges' }, [
                UI.badge(s.handled ? '已处理' : '未处理', s.handled ? 'success' : 'warn'),
                UI.badge(U.formatDateTime(s.createdAt), 'muted')
              ])
            ]),
            el('p', { class: 'book-card__note', text: s.content }),
            el('label', { class: 'field', style: 'margin-top:.7rem' }, [
              el('span', { class: 'field__label', text: '处理备注（仅自己可见）' }), replyInput
            ]),
            el('div', { class: 'btn-row' }, [
              el('button', {
                class: 'btn btn--primary btn--tiny', type: 'button',
                onclick: function () {
                  S.updateSuggestion(s.id, { adminReply: replyInput.value.trim(), handled: true })
                    .then(function () { U.toast('已保存', 'success'); render(); refreshCounts(); })
                    .catch(function (e) { U.toast(e.message, 'error'); });
                }
              }, '💾 保存并标记已处理'),
              el('button', {
                class: 'btn btn--ghost btn--tiny', type: 'button',
                onclick: function () {
                  S.updateSuggestion(s.id, { handled: !s.handled })
                    .then(function () { render(); refreshCounts(); });
                }
              }, s.handled ? '↩️ 标记为未处理' : '✅ 标记为已处理'),
              el('button', {
                class: 'btn btn--danger btn--tiny', type: 'button',
                onclick: function () {
                  U.confirm({ title: '删除这条留言？', message: '删除后无法恢复。', okText: '删除' })
                    .then(function (ok) {
                      if (!ok) return;
                      S.deleteSuggestion(s.id).then(function () { render(); refreshCounts(); });
                    });
                }
              }, '🗑️ 删除')
            ])
          ]));
        });
      }).catch(function (e) {
        listHost.appendChild(UI.empty('⚠️', '加载失败：' + e.message));
      });
    }
    render();
  }

  /* ======================================================================
   * 内容编辑
   * ==================================================================== */
  var CONTENT_TABS = [
    { key: 'faq', label: '❓ 常见问题' },
    { key: 'links', label: '🔗 校内网站' },
    { key: 'generalEdu', label: '🧭 通识课' },
    { key: 'plans', label: '🎓 培养方案' }
  ];
  var contentTab = 'faq';

  function renderContent(host) {
    host.appendChild(UI.sectionTitle('内容编辑',
      '改完点「保存并发布」，所有访客立刻就能看到，不需要重新部署网站。'));

    var bar = el('div', { class: 'tabs' });
    var panel = el('div');
    CONTENT_TABS.forEach(function (t) {
      var btn = el('button', {
        class: 'tab' + (t.key === contentTab ? ' is-active' : ''), type: 'button',
        onclick: function () {
          contentTab = t.key;
          Array.prototype.forEach.call(bar.children, function (c) { c.classList.remove('is-active'); });
          btn.classList.add('is-active');
          renderPanel();
        }
      }, t.label);
      bar.appendChild(btn);
    });
    host.appendChild(bar);
    host.appendChild(panel);

    function renderPanel() {
      U.clear(panel);
      ({ faq: editorFaq, links: editorLinks, generalEdu: editorGeneralEdu, plans: editorPlans }[contentTab])(panel);
    }
    renderPanel();
  }

  function saveBar(key, getValue) {
    var bar = el('div', { class: 'toolbar', style: 'position:sticky;bottom:0;z-index:5;margin-top:1.2rem' });
    var status = el('span', { class: 'field__hint', style: 'flex:1 1 200px;margin:0' });
    status.textContent = ENPO.content.isOverridden(key)
      ? '这个内容块已被你在后台修改过（保存在云端）。'
      : '当前显示的是 data/' + key + '.js 里的默认内容。';

    bar.appendChild(status);
    bar.appendChild(el('button', {
      class: 'btn btn--primary', type: 'button',
      onclick: function () {
        S.saveContent(key, getValue()).then(function () {
          U.toast('已保存并发布，所有访客立刻可见', 'success', 3500);
          renderTab();
        }).catch(function (e) { U.toast('保存失败：' + e.message, 'error', 5000); });
      }
    }, '💾 保存并发布'));
    bar.appendChild(el('button', {
      class: 'btn btn--ghost', type: 'button',
      onclick: function () {
        U.download(key + '.js',
          'window.ENPO_DATA = window.ENPO_DATA || {};\n\n'
          + 'ENPO_DATA.' + key + ' = ' + JSON.stringify(getValue(), null, 2) + ';\n',
          'text/javascript;charset=utf-8');
        U.toast('已下载，可用来替换 data/' + key + '.js', 'success', 4000);
      }
    }, '⬇️ 导出文件'));
    bar.appendChild(el('button', {
      class: 'btn btn--danger', type: 'button',
      onclick: function () {
        U.confirm({
          title: '恢复成默认内容？',
          message: '会删除你在后台对这个内容块的修改，恢复成 data/' + key + '.js 里的内容。',
          okText: '恢复默认'
        }).then(function (ok) {
          if (!ok) return;
          S.resetContent(key).then(function () {
            U.toast('已恢复默认，正在刷新…', 'success');
            setTimeout(function () { window.location.reload(); }, 900);
          }).catch(function (e) { U.toast(e.message, 'error'); });
        });
      }
    }, '↩️ 恢复默认'));
    return bar;
  }

  function textField(labelText, value, onInput, rows) {
    var control = rows
      ? el('textarea', { class: 'textarea', rows: rows })
      : el('input', { class: 'input' });
    control.value = value || '';
    control.addEventListener('input', function () { onInput(control.value); });
    return el('label', { class: 'field' }, [
      el('span', { class: 'field__label', text: labelText }), control
    ]);
  }

  /* ---------------- 常见问题 ---------------- */
  function editorFaq(host) {
    var data = JSON.parse(JSON.stringify(ENPO.content.get('faq', { categories: [] })));
    data.categories = data.categories || [];

    host.appendChild(textField('页面开头的一句话', data.intro, function (v) { data.intro = v; }, 2));
    host.appendChild(textField('页面结尾的提示', data.note, function (v) { data.note = v; }, 2));

    host.appendChild(el('div', { style: 'margin:1.4rem 0 .6rem' }, [
      UI.sectionTitle('分类与问答', '可以增删分类，也可以在每个分类里增删问答。')
    ]));

    data.categories.forEach(function (cat, ci) {
      cat.items = cat.items || [];
      var card = el('div', { class: 'editor-row', style: 'margin-bottom:1rem' });
      var nameInput = el('input', { class: 'input' });
      nameInput.value = cat.name || '';
      nameInput.addEventListener('input', function () { cat.name = nameInput.value; });

      var iconBtn = el('button', {
        class: 'btn btn--ghost', type: 'button', style: 'font-size:1.2rem;min-width:64px'
      }, cat.icon || '📄');
      var iconPanel = E.iconPicker(cat.icon, function (ic) { cat.icon = ic; iconBtn.textContent = ic; });
      iconBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!iconPanel.parentNode) card.appendChild(iconPanel);
        else iconPanel.hidden = !iconPanel.hidden;
      });

      card.appendChild(el('div', { class: 'editor-row__head' }, [
        el('span', { class: 'editor-row__no', text: String(ci + 1) }),
        el('span', { class: 'editor-row__title',
          text: '分类：' + (cat.name || '未命名') + '（' + cat.items.length + ' 条问答）' }),
        el('div', { class: 'editor-row__actions' }, [
          el('button', {
            class: 'btn btn--tiny btn--danger', type: 'button',
            onclick: function () {
              U.confirm({ title: '删除这个分类？', message: '分类里的问答也会一起删除。', okText: '删除' })
                .then(function (ok) { if (ok) { data.categories.splice(ci, 1); editorFaq(host); } });
            }
          }, '删除分类')
        ])
      ]));
      card.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-end' }, [
        el('div', { class: 'field', style: 'flex:1 1 240px' }, [
          el('span', { class: 'field__label', text: '分类名称' }), nameInput
        ]),
        el('div', { class: 'field', style: 'flex:0 0 auto' }, [
          el('span', { class: 'field__label', text: '图标' }), iconBtn
        ])
      ]));

      card.appendChild(E.editableList(cat.items, [
        { key: 'q', label: '问题', type: 'text', placeholder: '例如：通识课要修多少学分？' },
        { key: 'a', label: '回答', type: 'area', rows: 3, placeholder: '可以换行，换行会分成两段显示。' }
      ], {
        title: function (item, i) { return (i + 1) + '. ' + (item.q || '未填写问题'); },
        addDefault: { q: '', a: '' }
      }).el);

      host.appendChild(card);
    });

    host.appendChild(el('div', { class: 'btn-row', style: 'margin-top:.6rem' }, [
      el('button', {
        class: 'btn btn--soft btn--tiny', type: 'button',
        onclick: function () {
          data.categories.push({ name: '新分类', icon: '📄', items: [] });
          editorFaq(host);
        }
      }, '＋ 添加分类')
    ]));

    host.appendChild(saveBar('faq', function () { return data; }));
  }

  /* ---------------- 校内网站 ---------------- */
  function editorLinks(host) {
    var data = JSON.parse(JSON.stringify(ENPO.content.get('links', { groups: [] })));
    data.groups = data.groups || [];

    host.appendChild(textField('页面开头的一句话', data.intro, function (v) { data.intro = v; }, 2));
    host.appendChild(textField('页面结尾的提示', data.note, function (v) { data.note = v; }, 2));

    host.appendChild(el('div', { style: 'margin:1.4rem 0 .6rem' }, [
      UI.sectionTitle('网站分组', '点图标按钮可以从图标库里挑一个，风格和网站保持一致。')
    ]));

    data.groups.forEach(function (group, gi) {
      group.items = group.items || [];
      var card = el('div', { class: 'editor-row', style: 'margin-bottom:1rem' });
      var nameInput = el('input', { class: 'input' });
      nameInput.value = group.name || '';
      nameInput.addEventListener('input', function () { group.name = nameInput.value; });

      var iconBtn = el('button', {
        class: 'btn btn--ghost', type: 'button', style: 'font-size:1.2rem;min-width:64px'
      }, group.icon || '🔗');
      var iconPanel = E.iconPicker(group.icon, function (ic) { group.icon = ic; iconBtn.textContent = ic; });
      iconBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!iconPanel.parentNode) card.appendChild(iconPanel);
        else iconPanel.hidden = !iconPanel.hidden;
      });

      card.appendChild(el('div', { class: 'editor-row__head' }, [
        el('span', { class: 'editor-row__no', text: String(gi + 1) }),
        el('span', { class: 'editor-row__title', text: '分组：' + (group.name || '未命名') }),
        el('div', { class: 'editor-row__actions' }, [
          el('button', {
            class: 'btn btn--tiny btn--danger', type: 'button',
            onclick: function () {
              U.confirm({ title: '删除这个分组？', message: '分组里的网站也会一起删除。', okText: '删除' })
                .then(function (ok) { if (ok) { data.groups.splice(gi, 1); editorLinks(host); } });
            }
          }, '删除分组')
        ])
      ]));
      card.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-end' }, [
        el('div', { class: 'field', style: 'flex:1 1 240px' }, [
          el('span', { class: 'field__label', text: '分组名称' }), nameInput
        ]),
        el('div', { class: 'field', style: 'flex:0 0 auto' }, [
          el('span', { class: 'field__label', text: '分组图标' }), iconBtn
        ])
      ]));

      card.appendChild(E.editableList(group.items, [
        { key: 'name', label: '网站名称', type: 'text', width: '220px' },
        { key: 'url', label: '网址', type: 'text', width: '260px', placeholder: 'https://…' },
        { key: 'desc', label: '一句话说明', type: 'text', width: '260px' },
        { key: 'icon', label: '图标', type: 'icon' }
      ], {
        title: function (item, i) { return (i + 1) + '. ' + (item.name || '未命名网站'); },
        addDefault: { name: '', url: '', desc: '', icon: '🔗' }
      }).el);

      host.appendChild(card);
    });

    host.appendChild(el('div', { class: 'btn-row', style: 'margin-top:.6rem' }, [
      el('button', {
        class: 'btn btn--soft btn--tiny', type: 'button',
        onclick: function () {
          data.groups.push({ name: '新分组', icon: '🔗', items: [] });
          editorLinks(host);
        }
      }, '＋ 添加分组')
    ]));

    host.appendChild(saveBar('links', function () { return data; }));
  }

  /* ---------------- 通识课 ---------------- */
  function editorGeneralEdu(host) {
    var data = JSON.parse(JSON.stringify(ENPO.content.get('generalEdu', { modules: [] })));
    data.modules = data.modules || [];
    data.rules = data.rules || [];

    host.appendChild(el('div', { style: 'margin:1.4rem 0 .6rem' }, [
      UI.sectionTitle('学分与模块要求', '对应页面上方的数字卡片和表格。')
    ]));
    host.appendChild(E.editableList(data.rules, [
      { key: 'label', label: '项目', type: 'text', width: '200px' },
      { key: 'value', label: '要求', type: 'text', width: '160px' },
      { key: 'note', label: '说明', type: 'text', width: '260px' }
    ], {
      title: function (item, i) { return (i + 1) + '. ' + (item.label || '未填写'); },
      addDefault: { label: '', value: '', note: '' }
    }).el);

    host.appendChild(el('div', { style: 'margin:1.4rem 0 .6rem' }, [
      UI.sectionTitle('课程模块', '每个模块下可以增删课程。')
    ]));

    data.modules.forEach(function (m, mi) {
      m.courses = m.courses || [];
      m.colleges = m.colleges || [];
      var card = el('div', { class: 'editor-row', style: 'margin-bottom:1rem' });
      var courseHost = el('div', { hidden: true });

      var iconBtn = el('button', {
        class: 'btn btn--ghost', type: 'button', style: 'font-size:1.2rem;min-width:64px'
      }, m.icon || '📗');
      var iconPanel = E.iconPicker(m.icon, function (ic) { m.icon = ic; iconBtn.textContent = ic; });
      iconBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!iconPanel.parentNode) card.appendChild(iconPanel);
        else iconPanel.hidden = !iconPanel.hidden;
      });

      card.appendChild(el('div', { class: 'editor-row__head' }, [
        el('span', { class: 'editor-row__no', text: String(mi + 1) }),
        el('span', { class: 'editor-row__title',
          text: '模块：' + (m.name || '未命名') + '（' + m.courses.length + ' 门课程）' }),
        el('div', { class: 'editor-row__actions' }, [
          el('button', {
            class: 'btn btn--tiny btn--ghost', type: 'button',
            onclick: function () {
              courseHost.hidden = !courseHost.hidden;
              this.textContent = courseHost.hidden ? ('编辑课程（' + m.courses.length + '）') : '收起课程';
              if (!courseHost.hidden && !courseHost.dataset.built) {
                courseHost.appendChild(el('p', { class: 'field__hint' },
                  '课程代码以 CORE 开头表示核心课，GNED 表示选修课。'));
                courseHost.appendChild(E.editableList(m.courses, [
                  { key: 'code', label: '课程代码', type: 'text', width: '150px' },
                  { key: 'name', label: '课程名称', type: 'text', width: '240px' },
                  {
                    key: 'kind', label: '类型', type: 'select', width: '120px',
                    options: [
                      { value: '核心课', label: '核心课' },
                      { value: '选修课', label: '选修课' },
                      { value: '', label: '未标注' }
                    ]
                  },
                  { key: 'credits', label: '学分', type: 'text', width: '90px' },
                  { key: 'college', label: '开课学院', type: 'text', width: '200px' },
                  {
                    key: 'disabled', label: '是否还能选', type: 'bool', width: '190px',
                    falseLabel: '正常可选',
                    trueLabel: '不可选（页面划线显示）'
                  },
                  { key: 'note', label: '备注', type: 'area', rows: 2, width: '300px' }
                ], {
                  title: function (c, i) {
                    return (i + 1) + '. ' + (c.name || '未命名课程') + (c.disabled ? '（已标为不可选）' : '');
                  },
                  addDefault: {
                    code: '', name: '', kind: '选修课', credits: '2',
                    college: '', note: '', disabled: false
                  }
                }).el);
                courseHost.dataset.built = '1';
              }
            }
          }, '编辑课程（' + m.courses.length + '）'),
          el('button', {
            class: 'btn btn--tiny btn--danger', type: 'button',
            onclick: function () {
              U.confirm({ title: '删除这个模块？', message: '模块下的课程也会一起删除。', okText: '删除' })
                .then(function (ok) { if (ok) { data.modules.splice(mi, 1); editorGeneralEdu(host); } });
            }
          }, '删除模块')
        ])
      ]));

      function tf(labelText, key, placeholder) {
        var input = el('input', { class: 'input', placeholder: placeholder || '' });
        input.value = m[key] || '';
        input.addEventListener('input', function () { m[key] = input.value; });
        return el('div', { class: 'field', style: 'flex:1 1 220px' }, [
          el('span', { class: 'field__label', text: labelText }), input
        ]);
      }

      card.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-end' }, [
        tf('模块名称', 'name', '例如：工程伦理类课程'),
        tf('需修学分', 'credits', '例如：2'),
        tf('适用对象', 'audience', '例如：仅核工程与核技术相关专业需要'),
        el('div', { class: 'field', style: 'flex:0 0 auto' }, [
          el('span', { class: 'field__label', text: '图标' }), iconBtn
        ])
      ]));

      var collegesInput = el('input', { class: 'input', placeholder: '多个学院用「、」隔开' });
      collegesInput.value = (m.colleges || []).join('、');
      collegesInput.addEventListener('input', function () {
        m.colleges = collegesInput.value.split(/[、,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
      });
      card.appendChild(el('div', { class: 'field' }, [
        el('span', { class: 'field__label', text: '开课学院（仅「不限制具体课程」的模块需要填）' }),
        collegesInput
      ]));

      card.appendChild(courseHost);
      host.appendChild(card);
    });

    host.appendChild(el('div', { class: 'btn-row', style: 'margin-top:.6rem' }, [
      el('button', {
        class: 'btn btn--soft btn--tiny', type: 'button',
        onclick: function () {
          data.modules.push({
            name: '新模块', icon: '📗', credits: '2', audience: '',
            unrestricted: false, colleges: [], courses: []
          });
          editorGeneralEdu(host);
        }
      }, '＋ 添加模块')
    ]));

    host.appendChild(el('details', { style: 'margin-top:1.4rem' }, [
      el('summary', { style: 'cursor:pointer;font-weight:600' }, '高级：编辑思维导图内容（JSON）'),
      el('p', { class: 'field__hint' },
        '思维导图的结构比较特殊，这里用 JSON 编辑。改错了可以点下面的「恢复默认」。'),
      (function () {
        var ta = el('textarea', {
          class: 'textarea', style: 'min-height:240px;font-family:var(--mono);font-size:.85rem'
        });
        ta.value = JSON.stringify(data.map || {}, null, 2);
        var msg = el('div', { class: 'form-error' });
        var btn = el('button', {
          class: 'btn btn--ghost btn--tiny', type: 'button',
          onclick: function () {
            try {
              data.map = JSON.parse(ta.value);
              ta.value = JSON.stringify(data.map, null, 2);
              msg.textContent = '';
              U.toast('思维导图内容已更新，别忘了点下面的「保存并发布」', 'success', 3500);
            } catch (e) {
              msg.textContent = 'JSON 格式有误：' + e.message;
            }
          }
        }, '应用修改');
        return el('div', null, [ta, msg, el('div', { class: 'btn-row' }, [btn])]);
      })()
    ]));

    host.appendChild(saveBar('generalEdu', function () { return data; }));
  }

  /* ---------------- 培养方案 ---------------- */
  function editorPlans(host) {
    var data = JSON.parse(JSON.stringify(ENPO.content.get('plans', { order: [], years: {} })));
    var years = data.order || ['2026', '2025', '2024'];
    var state = { year: years[0], term: 0, group: 0 };

    var panel = el('div');
    host.appendChild(panel);

    function renderPanel() {
      U.clear(panel);
      var yearData = data.years[state.year];
      if (!yearData) { panel.appendChild(UI.empty('📭', '这一级还没有数据。')); return; }
      var terms = yearData.terms || [];
      if (state.term >= terms.length) state.term = 0;
      var term = terms[state.term];
      if (!term) { panel.appendChild(UI.empty('📭', '这个年级还没有学期数据。')); return; }
      if (state.group >= (term.groups || []).length) state.group = 0;
      var group = term.groups[state.group];
      if (!group) { panel.appendChild(UI.empty('📭', '这个学期还没有专业组数据。')); return; }

      panel.appendChild(el('div', { class: 'plan-toolbar' }, [
        el('span', { class: 'field__label', style: 'margin:0', text: '年级：' }),
        el('div', { class: 'chip-row' }, years.map(function (y) {
          return el('button', {
            class: 'chip' + (y === state.year ? ' is-active' : ''), type: 'button',
            onclick: function () { state.year = y; state.term = 0; state.group = 0; renderPanel(); }
          }, data.years[y] ? (data.years[y].label || y + ' 级') : y);
        }))
      ]));
      panel.appendChild(el('div', { class: 'plan-toolbar' }, [
        el('span', { class: 'field__label', style: 'margin:0', text: '学期：' }),
        el('div', { class: 'chip-row' }, terms.map(function (t, i) {
          return el('button', {
            class: 'chip' + (i === state.term ? ' is-active' : ''), type: 'button',
            onclick: function () { state.term = i; state.group = 0; renderPanel(); }
          }, t.name);
        }))
      ]));
      panel.appendChild(el('div', { class: 'plan-toolbar' }, [
        el('span', { class: 'field__label', style: 'margin:0', text: '专业组：' }),
        el('div', { class: 'chip-row' }, (term.groups || []).map(function (g, i) {
          return el('button', {
            class: 'chip' + (i === state.group ? ' is-active' : ''), type: 'button',
            onclick: function () { state.group = i; renderPanel(); }
          }, (g.name || '未命名').slice(0, 20) + '（' + (g.courses || []).length + '）');
        })),
        el('button', {
          class: 'btn btn--soft btn--tiny', type: 'button',
          onclick: function () {
            term.groups.push({ name: state.year + '级新专业组', note: '', courses: [] });
            state.group = term.groups.length - 1;
            renderPanel();
          }
        }, '＋ 添加专业组')
      ]));

      panel.appendChild(textField('这个年级页面的介绍文字', yearData.intro,
        function (v) { yearData.intro = v; }, 3));
      panel.appendChild(textField('页面底部的提示文字', yearData.note,
        function (v) { yearData.note = v; }, 2));

      var groupNameInput = el('input', { class: 'input' });
      groupNameInput.value = group.name || '';
      groupNameInput.addEventListener('input', function () { group.name = groupNameInput.value; });
      panel.appendChild(el('label', { class: 'field' }, [
        el('span', { class: 'field__label', text: '专业组名称' }), groupNameInput
      ]));

      (group.courses || []).forEach(function (c) {
        if (c._booksText === undefined) c._booksText = E.booksToLines(c.books);
      });

      panel.appendChild(el('div', { style: 'margin:1.2rem 0 .6rem' }, [
        UI.sectionTitle('课程与教材（' + (group.courses || []).length + ' 门）',
          '教材一行一本，格式：书名 | 主编 | 版次 | 出版社。没有教材就留空。')
      ]));
      panel.appendChild(E.editableList(group.courses, [
        { key: 'name', label: '课程名称', type: 'text', width: '220px' },
        { key: 'code', label: '课程代码', type: 'text', width: '140px' },
        { key: 'credits', label: '学分', type: 'text', width: '90px' },
        {
          key: 'requirement', label: '要求', type: 'text', width: '170px',
          hint: '填「必修」「二选一必修」「24选1必修」等。相同的多选一要求会自动合并成一块。'
        },
        { key: '_booksText', label: '教材', type: 'area', rows: 3, mono: true, width: '320px' },
        { key: 'note', label: '备注', type: 'area', rows: 3, width: '260px' }
      ], {
        title: function (c, i) { return (i + 1) + '. ' + (c.name || '未命名课程'); },
        addDefault: function () {
          return { name: '', code: '', credits: '', requirement: '必修', note: '', books: [], _booksText: '' };
        }
      }).el);

      panel.appendChild(saveBar('plans', function () {
        Object.keys(data.years).forEach(function (y) {
          (data.years[y].terms || []).forEach(function (t) {
            (t.groups || []).forEach(function (g) {
              (g.courses || []).forEach(function (c) {
                if (c._booksText !== undefined) {
                  c.books = E.linesToBooks(c._booksText);
                  delete c._booksText;
                }
              });
            });
          });
        });
        return data;
      }));
    }

    renderPanel();
  }

  /* ======================================================================
   * 选项管理
   * ==================================================================== */
  function renderOptions(host) {
    host.appendChild(UI.sectionTitle('表单选项管理',
      '同学在「我要出书」页面看到的选项就是这里配置的。改完点保存，立即生效。'));

    var data = JSON.parse(JSON.stringify(ENPO.content.get('bookOptions', {})));
    data.majors = data.majors || [];
    data.terms = data.terms || [];
    data.statuses = data.statuses || [];
    data.bookGroups = data.bookGroups || [];

    function stringsEditor(title, desc, arr, placeholder) {
      var wrap = el('section', { class: 'section' }, [UI.sectionTitle(title, desc)]);
      var input = el('input', { class: 'input', placeholder: placeholder || '输入后按回车添加' });
      var row = el('div', { class: 'chip-row', style: 'margin:.6rem 0' });
      function render() {
        U.clear(row);
        arr.forEach(function (v, i) {
          row.appendChild(el('span', { class: 'tag' }, [
            el('span', { text: v }),
            el('button', {
              class: 'tag__x', type: 'button',
              style: 'border:0;background:none;cursor:pointer;color:inherit',
              title: '点击删除',
              onclick: function () { arr.splice(i, 1); render(); }
            }, '×')
          ]));
        });
        if (!arr.length) row.appendChild(el('span', { class: 'field__hint', text: '还没有选项，在下面添加。' }));
      }
      render();
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var v = input.value.trim();
        if (!v) return;
        if (arr.indexOf(v) < 0) arr.push(v);
        input.value = '';
        render();
      });
      wrap.appendChild(row);
      wrap.appendChild(el('div', { class: 'field' }, [input]));
      return wrap;
    }

    host.appendChild(stringsEditor('专业选项', '出书表单里「专业」可选的项。', data.majors,
      '例如：储能科学与工程，回车添加'));
    host.appendChild(stringsEditor('年级 / 类型选项', '出书表单里「出的年级 / 类型」可选的项。', data.terms,
      '例如：大二小学期，回车添加'));

    host.appendChild(el('section', { class: 'section' }, [
      UI.sectionTitle('是否已出选项', '同学用来标记自己的书出到什么程度了。'),
      E.editableList(data.statuses, [
        { key: 'label', label: '显示文字', type: 'text', width: '160px' },
        { key: 'value', label: '内部值（英文，别乱改）', type: 'text', width: '160px' },
        { key: 'desc', label: '给同学的说明', type: 'text', width: '320px' }
      ], {
        title: function (s, i) { return (i + 1) + '. ' + (s.label || '未命名'); },
        addDefault: { label: '新状态', value: 'custom' + Date.now().toString(36), desc: '' },
        emptyText: '没有状态选项。'
      }).el
    ]));

    host.appendChild(el('section', { class: 'section' }, [
      UI.sectionTitle('书籍清单',
        '出书表单里「有哪些书」的多选清单。按学期分组，每组的条目每行一个。'),
      el('div', { class: 'editor-list' }, data.bookGroups.map(function (g, gi) {
        var card = el('div', { class: 'editor-row' });
        var nameInput = el('input', { class: 'input' });
        nameInput.value = g.term || '';
        nameInput.addEventListener('input', function () { g.term = nameInput.value; });

        var ta = el('textarea', {
          class: 'textarea', rows: 5, style: 'font-family:var(--mono);font-size:.85rem'
        });
        ta.value = (g.items || []).join('\n');
        ta.addEventListener('input', function () {
          g.items = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        });

        card.appendChild(el('div', { class: 'editor-row__head' }, [
          el('span', { class: 'editor-row__no', text: String(gi + 1) }),
          el('span', { class: 'editor-row__title',
            text: (g.term || '未命名') + '（' + (g.items || []).length + ' 项）' }),
          el('div', { class: 'editor-row__actions' }, [
            el('button', {
              class: 'btn btn--tiny btn--danger', type: 'button',
              onclick: function () {
                U.confirm({ title: '删除这一组？', message: '', okText: '删除' }).then(function (ok) {
                  if (ok) { data.bookGroups.splice(gi, 1); renderOptions(host); }
                });
              }
            }, '删除')
          ])
        ]));
        card.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:.7rem' }, [
          el('div', { class: 'field', style: 'flex:1 1 200px' }, [
            el('span', { class: 'field__label', text: '组名（一般写学期）' }), nameInput
          ]),
          el('div', { class: 'field', style: 'flex:2 1 320px' }, [
            el('span', { class: 'field__label', text: '书籍名称（每行一个）' }), ta
          ])
        ]));
        return card;
      })),
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--soft btn--tiny', type: 'button',
          onclick: function () { data.bookGroups.push({ term: '新分组', items: [] }); renderOptions(host); }
        }, '＋ 添加一个分组')
      ])
    ]));

    host.appendChild(saveBar('bookOptions', function () { return data; }));
  }

  /* ======================================================================
   * 数据与设置
   * ==================================================================== */
  function renderSettings(host) {
    host.appendChild(UI.sectionTitle('数据与设置', '导出备份、导入恢复，以及口令相关设置。'));

    /* ---- 导出 ---- */
    host.appendChild(el('div', { class: 'form-card', style: 'margin-top:1.2rem' }, [
      el('h3', { class: 'card__title', text: '📤 导出备份' }),
      el('p', { class: 'section__desc' }, '把全部出书信息和意见建议导出成文件，存到安全的地方。'),
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            S.exportAll().then(function (d) {
              U.download('enpo-backup-' + U.formatDate(Date.now()) + '.json',
                JSON.stringify(d, null, 2), 'application/json;charset=utf-8');
              U.toast('已导出', 'success');
            }).catch(function (e) { U.toast(e.message, 'error'); });
          }
        }, '导出全部数据（JSON）'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () {
            S.listAllBooks().then(function (books) {
              var lines = ['专业,年级类型,书籍,是否已出,备注,审核状态,记录ID,发布时间'];
              books.forEach(function (b) {
                lines.push([b.major, (b.terms || []).join(' '), (b.books || []).join(' '),
                  S.STATUS_TEXT[b.status] || '', b.note, S.REVIEW_TEXT[b.review] || '', b.id,
                  U.formatDate(b.createdAt)]
                  .map(function (v) {
                    return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
                  }).join(','));
              });
              U.download('出书信息-' + U.formatDate(Date.now()) + '.csv',
                '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8');
              U.toast('已导出 CSV（Excel 可直接打开）', 'success');
            }).catch(function (e) { U.toast(e.message, 'error'); });
          }
        }, '导出 CSV（Excel 可开）')
      ])
    ]));

    /* ---- 导入 ---- */
    var importArea = el('textarea', {
      class: 'textarea', style: 'min-height:140px;font-family:var(--mono);font-size:.85rem',
      placeholder: '把之前导出的 JSON 内容粘贴到这里…'
    });
    var importMsg = el('div', { class: 'form-error', role: 'alert' });

    host.appendChild(el('div', { class: 'form-card', style: 'margin-top:1.2rem' }, [
      el('h3', { class: 'card__title', text: '📥 导入数据' }),
      el('p', { class: 'section__desc' }, '把导出的 JSON 粘贴进来，逐条写回数据库（已存在的记录会被覆盖）。'),
      el('label', { class: 'field' }, [el('span', { class: 'field__label', text: '粘贴 JSON' }), importArea]),
      importMsg,
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            importMsg.textContent = '';
            var data;
            try { data = JSON.parse(importArea.value); }
            catch (e) { importMsg.textContent = 'JSON 格式有误：' + e.message; return; }
            var books = (data.books || []).filter(function (b) { return b.id; });
            if (!books.length) { importMsg.textContent = '这份数据里没有可导入的出书信息。'; return; }
            U.confirm({
              title: '导入 ' + books.length + ' 条出书信息？',
              message: '已存在的记录会被同 ID 的数据覆盖，其余保留。',
              okText: '开始导入'
            }).then(function (ok) {
              if (!ok) return;
              importBooks(books, importMsg, reload);
            });
          }
        }, '导入出书信息')
      ])
    ]));

    /* ---- 初始数据 ---- */
    host.appendChild(el('div', { class: 'form-card', style: 'margin-top:1.2rem' }, [
      el('h3', { class: 'card__title', text: '📦 初始数据' }),
      el('p', { class: 'section__desc' },
        'data/seed-books.js 里保存着从原表格整理出来的初始出书信息。'
        + '第一次部署到云端后，点一次「导入初始数据」就能把这些记录放进云端数据库。'),
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            S.importSeed().then(function (n) {
              U.toast(n ? ('已导入 ' + n + ' 条') : '没有新的数据需要导入', n ? 'success' : 'info');
              reload();
            }).catch(function (e) { U.toast(e.message, 'error'); });
          }
        }, '导入初始数据'),
        el('button', {
          class: 'btn btn--danger', type: 'button',
          onclick: function () {
            U.confirm({
              title: '清空「初始数据」？',
              message: '只会删除标记为初始数据的条目，同学自己发布的不会被删。',
              okText: '清空'
            }).then(function (ok) {
              if (!ok) return;
              S.resetSeed().then(function () {
                U.toast('已清空初始数据', 'success');
                reload();
              }).catch(function (e) { U.toast(e.message, 'error'); });
            });
          }
        }, '清空初始数据')
      ])
    ]));

    /* ---- 口令 ---- */
    var pwInput = el('input', { class: 'input', type: 'text', placeholder: '输入新口令（建议 8 位以上）' });
    var saltInput = el('input', { class: 'input', type: 'text' });
    saltInput.value = CFG.adminSalt || 'enpo-2026-xjtu';
    var output = el('pre', { style: 'display:none' });
    var pwMsg = el('div', { class: 'form-error', role: 'alert' });

    host.appendChild(el('div', { class: 'form-card', style: 'margin-top:1.2rem' }, [
      el('h3', { class: 'card__title', text: '🔑 修改口令' }),
      el('p', { class: 'section__desc' },
        S.isLocal
          ? '离线模式：把下面生成的两行替换掉 assets/js/config.js 里的同名两行即可。'
          : '在线模式：口令保存在服务器上。在 Cloudflare 后台设置环境变量 ADMIN_PASSWORD（最简单），'
            + '或者用下面的哈希方式设置 ADMIN_SALT + ADMIN_PASSWORD_HASH，改完重新部署一次。'),
      el('label', { class: 'field' }, [el('span', { class: 'field__label', text: '新口令' }), pwInput]),
      el('label', { class: 'field' }, [el('span', { class: 'field__label', text: '盐（随机字符串）' }), saltInput]),
      pwMsg,
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            pwMsg.textContent = '';
            var pw = pwInput.value;
            if (!pw || pw.length < 6) { pwMsg.textContent = '口令至少 6 位。'; return; }
            var salt = saltInput.value.trim() || 'enpo-2026-xjtu';
            var hash = U.sha256Hex(salt + pw);
            output.style.display = 'block';
            output.textContent =
              '【离线模式】把 assets/js/config.js 里这两行替换掉：\n\n'
              + "  adminSalt: '" + salt + "',\n"
              + "  adminPasswordHash: '" + hash + "',\n\n"
              + '【在线模式】在 Cloudflare 里设置环境变量：\n\n'
              + '  ADMIN_SALT = ' + salt + '\n'
              + '  ADMIN_PASSWORD_HASH = ' + hash + '\n\n'
              + '（也可以只设置 ADMIN_PASSWORD = 你的明文口令，更简单，但安全性稍低。）';
            U.toast('已生成，请复制下面的内容', 'success');
          }
        }, '生成配置'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () { saltInput.value = U.randomCode(16); }
        }, '🎲 随机盐'),
        el('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () {
            if (!output.textContent) { U.toast('还没有生成内容', 'warn'); return; }
            U.copyText(output.textContent).then(function (ok) {
              U.toast(ok ? '已复制' : '复制失败，请手动选中', ok ? 'success' : 'warn');
            });
          }
        }, '📋 复制')
      ]),
      output
    ]));

    /* ---- 危险区 ---- */
    host.appendChild(el('div', { class: 'form-card', style: 'margin-top:1.2rem' }, [
      el('h3', { class: 'card__title', text: '⚠️ 危险操作' }),
      el('p', { class: 'section__desc' }, '下面这些操作不可撤销，请先导出备份。'),
      el('div', { class: 'btn-row' }, [
        el('button', {
          class: 'btn btn--danger', type: 'button',
          onclick: function () {
            U.confirm({
              title: '清空本机数据？',
              message: '只会清掉这台浏览器里的缓存数据，云端数据库不受影响。',
              okText: '确定清空'
            }).then(function (ok) {
              if (!ok) return;
              S.resetEverything().then(function () {
                U.toast('已清空本机数据', 'success');
                setTimeout(function () { window.location.reload(); }, 800);
              });
            });
          }
        }, '清空本机浏览器数据'),
        el('button', {
          class: 'btn btn--danger', type: 'button',
          onclick: function () { S.adminLogout().then(function () { window.location.reload(); }); }
        }, '退出登录')
      ])
    ]));

    /* ---- 当前状态 ---- */
    host.appendChild(el('div', { style: 'margin-top:1.6rem' }, [
      UI.sectionTitle('当前运行状态', ''),
      UI.dataTable([{ key: 'k', label: '项目' }, { key: 'v', label: '当前值' }], [
        { k: '数据模式', v: S.isLocal ? '离线模式（数据只在本机）' : '在线模式（云端数据库）' },
        { k: '网站版本', v: CFG.version },
        {
          k: '内容覆盖',
          v: ENPO.content.ALL_KEYS.filter(function (k) { return ENPO.content.isOverridden(k); }).join('、')
            || '（都是默认内容）'
        },
        {
          k: '防机器人',
          v: '服务端：同源校验 + 频率限制 + 蜜罐 + 时间陷阱' + (CFG.turnstileSiteKey ? ' + Turnstile' : '')
        },
        { k: '站主邮箱', v: (CFG.ownerContact && CFG.ownerContact.email) || '（未设置）' }
      ])
    ]));
  }

  /** 逐条导入出书信息 */
  function importBooks(books, msgBox, done) {
    var ok = 0, skip = 0, i = 0;
    function next() {
      if (i >= books.length) {
        msgBox.textContent = '导入完成：成功 ' + ok + ' 条，跳过 ' + skip + ' 条。';
        U.toast('导入完成', 'success');
        done();
        return;
      }
      var b = books[i++];
      S.updateBook(b.id, {
        qq: U.deobfuscate(b.qqBlob),
        major: b.major || '',
        terms: b.terms || [],
        books: b.books || [],
        note: b.note || ''
      }, { actor: 'owner' }).then(function () { ok++; next(); })
        .catch(function () { skip++; next(); });
    }
    next();
  }

  ENPO.ready().then(init);
})();
