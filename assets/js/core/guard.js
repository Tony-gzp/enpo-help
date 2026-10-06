/* ============================================================================
 * guard.js —— 防机器人 / 防刷 / 隐私保护
 * ----------------------------------------------------------------------------
 * 这里做的事情（都不依赖任何第三方服务）：
 *   1. 蜜罐字段：机器人爱填所有输入框，真人看不到这个框 → 填了就判定为机器人
 *   2. 时间陷阱：从打开页面到提交少于 N 秒 → 判定为机器人
 *   3. 中文算术题：题目用汉字写（"七 加 六"），需要先认识汉字才能答对
 *   4. 频率限制：同一浏览器 1 小时内最多提交 N 次
 *   5. 自动化特征检测：navigator.webdriver 等
 *   6. 联系方式默认打码，点击"查看"才在前端还原，且不进 HTML 源码
 *   7. 给页面补 noindex 标记，避免被搜索引擎收录
 * ==========================================================================*/
(function () {
  'use strict';

  var ENPO = (window.ENPO = window.ENPO || {});
  var U = ENPO.util;
  var CFG = ENPO.config || {};
  var G = CFG.guard || {};
  var el = U.el;

  var CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function cn(n) {
    if (n <= 10) return CN_NUM[n];
    if (n < 20) return '十' + CN_NUM[n - 10];
    return CN_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? CN_NUM[n % 10] : '');
  }

  /* ------------------------------ 频率限制 ------------------------------ */
  function rateLimitOk(key, max, windowMs) {
    var stampKey = 'rate.' + key;
    var list = U.storage.getJSON(stampKey, []);
    var now = Date.now();
    list = (Array.isArray(list) ? list : []).filter(function (t) { return now - t < windowMs; });
    if (list.length >= max) {
      return { ok: false, remaining: 0, retryAfterMs: windowMs - (now - list[0]) };
    }
    return { ok: true, remaining: max - list.length, _list: list, _key: stampKey };
  }
  function rateLimitCommit(result) {
    if (!result || !result._list) return;
    result._list.push(Date.now());
    U.storage.setJSON(result._key, result._list);
  }

  /* ------------------------------ 表单守卫 ------------------------------ */
  /**
   * 给表单装上防机器人装置
   * @param {HTMLFormElement} form
   * @param {Object} opts { key:'book-submit', message:'提交' }
   * @returns {{validate:Function, reset:Function, form:HTMLFormElement}}
   */
  function form(formEl, opts) {
    opts = opts || {};
    var key = opts.key || 'form';
    var startedAt = Date.now();
    var challenge = null;

    /* 1) 蜜罐字段 —— 用 CSS 藏起来，真人和屏幕阅读器都看不到 */
    if (G.honeypot !== false) {
      var hp = el('div', { class: 'hp-field', 'aria-hidden': 'true' }, [
        el('label', { for: key + '-website' }, '请勿填写此项'),
        el('input', {
          type: 'text', id: key + '-website', name: 'website',
          tabindex: '-1', autocomplete: 'off'
        })
      ]);
      formEl.appendChild(hp);
    }

    /* 2) 中文算术验证题 */
    var challengeHost = formEl.querySelector('[data-challenge]');
    if (G.challenge !== false && challengeHost) {
      newChallenge();
    }

    function newChallenge() {
      var a = 2 + Math.floor(Math.random() * 8);   // 2..9
      var b = 1 + Math.floor(Math.random() * 8);   // 1..8
      var sum = a + b;
      challenge = { answer: String(sum) };
      var label = '人机验证：请用阿拉伯数字回答 —— ' + cn(a) + ' 加 ' + cn(b) + ' 等于几？';
      U.clear(challengeHost);
      challengeHost.appendChild(el('label', { class: 'field', for: key + '-challenge' }, [
        el('span', { class: 'field__label', text: label }),
        el('input', {
          class: 'input', id: key + '-challenge', name: 'challenge',
          type: 'text', inputmode: 'numeric', autocomplete: 'off',
          placeholder: '填写计算结果', required: true
        })
      ]));
      var refresh = el('button', {
        class: 'btn btn--tiny btn--ghost', type: 'button',
        onclick: function (e) { e.preventDefault(); newChallenge(); }
      }, '换一题');
      challengeHost.appendChild(refresh);
    }

    function validate() {
      /* 自动化特征 */
      if (G.blockAutomation !== false && U.isAutomation()) {
        return { ok: false, reason: '自动化环境', message: '检测到浏览器自动化环境，出于安全考虑已拒绝提交。请使用普通浏览器打开本站。' };
      }
      /* 蜜罐 */
      if (G.honeypot !== false) {
        var hpInput = formEl.querySelector('input[name="website"]');
        if (hpInput && hpInput.value.trim() !== '') {
          return { ok: false, reason: '蜜罐', message: '提交未通过安全检查。' };
        }
      }
      /* 时间陷阱 */
      var elapsed = (Date.now() - startedAt) / 1000;
      if (elapsed < (G.minFillSeconds || 5)) {
        return {
          ok: false, reason: '过快',
          message: '填写得太快了（' + Math.round(elapsed) + ' 秒），请仔细检查内容后再提交。'
        };
      }
      /* 验证题 */
      if (G.challenge !== false && challenge) {
        var ans = formEl.querySelector('input[name="challenge"]');
        var val = ans ? String(ans.value).trim() : '';
        if (val !== challenge.answer) {
          if (ans) { ans.value = ''; }
          newChallenge();
          return { ok: false, reason: '验证题', message: '人机验证答案不对，已换了一题，请再试一次。' };
        }
      }
      /* 频率限制 */
      var rl = rateLimitOk(key, G.maxSubmitsPerHour || 5, 3600 * 1000);
      if (!rl.ok) {
        var mins = Math.ceil(rl.retryAfterMs / 60000);
        return {
          ok: false, reason: '频繁',
          message: '提交太频繁了，请等 ' + mins + ' 分钟后再试（每个浏览器每小时最多 ' + (G.maxSubmitsPerHour || 5) + ' 次）。'
        };
      }
      return { ok: true, _rate: rl };
    }

    function commit() {
      var rl = rateLimitOk(key, G.maxSubmitsPerHour || 5, 3600 * 1000);
      rateLimitCommit(rl);
    }

    function reset() {
      startedAt = Date.now();
      if (G.challenge !== false && challengeHost) newChallenge();
      var hpInput = formEl.querySelector('input[name="website"]');
      if (hpInput) hpInput.value = '';
    }

    /** 继续填写上次的草稿时，把"开始时间"提前，避免刚进来就被判定为填得太快 */
    function setStartedAt(ts) { startedAt = Number(ts) || Date.now(); }
    function getStartedAt() { return startedAt; }
    function honeypotValue() {
      var hp = formEl.querySelector('input[name="website"]');
      return hp ? hp.value : '';
    }

    return {
      validate: validate, commit: commit, reset: reset, form: formEl,
      setStartedAt: setStartedAt, getStartedAt: getStartedAt, honeypotValue: honeypotValue
    };
  }

  /* ------------------------------ 联系方式点击查看 ------------------------------ */
  /**
   * 任意带 data-reveal-contact 的按钮，点击后把 data-blob 解密并显示在旁边
   * 结构：<button class="btn" data-reveal-contact data-blob="xxx" data-type="微信">查看联系方式</button>
   */
  function initReveal(root) {
    var host = root || document;
    host.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-reveal-contact]') : null;
      if (!btn) return;
      e.preventDefault();
      var box = btn.closest('[data-contact-box]') || btn.parentNode;
      var blob = btn.getAttribute('data-blob') || '';
      var value = U.deobfuscate(blob);
      var type = btn.getAttribute('data-type') || '联系方式';
      if (!value) { U.toast('这条记录没有留下联系方式。', 'warn'); return; }

      U.clear(box);
      var href = contactHref(type, value);
      var valueNode = href
        ? el('a', {
          class: 'contact-reveal__value',
          href: href, target: '_blank', rel: 'noopener noreferrer nofollow'
        }, value)
        : el('span', { class: 'contact-reveal__value', text: value });

      box.appendChild(el('div', { class: 'contact-reveal' }, [
        el('span', { class: 'contact-reveal__type', text: type }),
        valueNode,
        el('button', {
          class: 'btn btn--tiny btn--ghost', type: 'button',
          onclick: function () {
            U.copyText(value).then(function (ok) {
              U.toast(ok ? '已复制：' + value : '复制失败，请手动选中复制', ok ? 'success' : 'warn');
            });
          }
        }, '复制')
      ]));
      box.appendChild(el('p', { class: 'contact-reveal__tip' },
        '请仅用于联系同学购买/索取教材，谢绝广告与骚扰。'));
    });
  }

  /** 返回可点击的链接地址；微信/QQ 这类没有网页链接的返回空 */
  function contactHref(type, value) {
    if (/邮箱|email|mail/i.test(type)) return 'mailto:' + value;
    if (/手机|电话|phone|tel/i.test(type)) return 'tel:' + value.replace(/\s|-/g, '');
    return '';
  }

  /* ------------------------------ 反收录 ------------------------------ */
  function ensureNoIndex() {
    var m = document.querySelector('meta[name="robots"]');
    if (!m) {
      m = el('meta', { name: 'robots' });
      document.head.appendChild(m);
    }
    m.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate');
  }

  /* ------------------------------ 复制保护提示 ------------------------------ */
  function softenScrape(container) {
    // 给渲染出来的联系方式区域加标记，配合 CSS 禁止被第三方"选中复制"整块抓走
    if (!container) return;
    container.setAttribute('data-protected', 'contact');
  }

  ENPO.guard = {
    form: form,
    rateLimitOk: rateLimitOk,
    rateLimitCommit: rateLimitCommit,
    initReveal: initReveal,
    ensureNoIndex: ensureNoIndex,
    softenScrape: softenScrape
  };

  document.addEventListener('DOMContentLoaded', function () {
    ensureNoIndex();
    initReveal(document);
  });
})();
