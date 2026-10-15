/* ==========================================================================
   quiz.js — 检索练习（retrieval practice）组件
   --------------------------------------------------------------------------
   为什么存在：读一遍不等于记住。Fluency（当下读得顺）会制造"我懂了"的错觉，
   真正要的是 storage strength（长期留存）。逼自己从记忆里取答案、并立刻得到
   反馈，是建立长期留存最省力的手段。

   用法（classic script，file:// 下也能加载）：

     <div class="quiz" data-quiz>
       <p class="quiz__question">
         <span class="quiz__index">检查 1 / 3</span>
         题干？
       </p>
       <div class="quiz__options">
         <button class="quiz__option" data-hint="提示文字">选项 A</button>
         <button class="quiz__option" data-correct>选项 B</button>
         <button class="quiz__option">选项 C</button>
       </div>
       <div class="quiz__explain hidden">答对后展示的解释（放在 feedback 里）</div>
       <div class="quiz__feedback"></div>
     </div>

   页面底部可放 <p class="quiz__score" data-quiz-score></p> 显示整页得分。
   ========================================================================== */
(function () {
  'use strict';

  /** 页面级统计：只在"第一次就答对"时计入，这才是真实掌握度 */
  var stats = { total: 0, correct: 0 };

  function updateScoreboard() {
    var el = document.querySelector('[data-quiz-score]');
    if (!el || stats.total === 0) return;
    el.textContent = '本页检索练习：' + stats.correct + ' / ' + stats.total +
      ' 题一次答对。答错的题值得隔一天再回来重做一遍。';
  }

  function setupQuiz(quiz) {
    var options = Array.prototype.slice.call(quiz.querySelectorAll('.quiz__option'));
    var feedback = quiz.querySelector('.quiz__feedback');
    var explain = quiz.querySelector('.quiz__explain');
    var firstAttempt = true;
    stats.total += 1;

    function showFeedback(kind, html) {
      if (!feedback) return;
      feedback.className = 'quiz__feedback is-shown is-' + kind;
      feedback.innerHTML = html;
    }

    options.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;

        if (btn.hasAttribute('data-correct')) {
          btn.classList.add('is-correct');
          options.forEach(function (o) { o.disabled = true; });

          if (firstAttempt) stats.correct += 1;
          updateScoreboard();

          var text = '<span class="verdict">✓ 答对了。</span>';
          if (explain) text += ' ' + explain.innerHTML;
          showFeedback('correct', text);
          return;
        }

        // 答错：标红 + 抖动，给一条提示，但保留重试机会 ——
        // 从错误中修正本身也是检索练习的一部分。
        btn.classList.add('is-wrong', 'is-shaking');
        setTimeout(function () { btn.classList.remove('is-shaking'); }, 320);
        btn.disabled = true;
        firstAttempt = false;

        var hint = btn.getAttribute('data-hint');
        var remaining = options.filter(function (o) {
          return !o.disabled && !o.hasAttribute('data-correct');
        }).length;

        if (remaining === 0) {
          // 错误选项都被试完了，直接揭示正确答案，别让人卡住
          var right = quiz.querySelector('.quiz__option[data-correct]');
          if (right) right.classList.add('is-correct');
          options.forEach(function (o) { o.disabled = true; });
          updateScoreboard();
          var reveal = '<span class="verdict">✗ 都不是。</span> 正确答案是「' +
            (right ? right.textContent.trim() : '') + '」。';
          if (explain) reveal += ' ' + explain.innerHTML;
          showFeedback('wrong', reveal);
          return;
        }

        showFeedback('wrong',
          '<span class="verdict">✗ 再想想。</span>' +
          (hint ? ' ' + hint : ' 排除法也是好办法 —— 先想清楚每个选项错在哪。') +
          ' 还有 ' + remaining + ' 个选项可以试。');
      });
    });
  }

  function init() {
    var quizzes = document.querySelectorAll('[data-quiz]');
    if (!quizzes.length) return;
    Array.prototype.forEach.call(quizzes, setupQuiz);
    updateScoreboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
