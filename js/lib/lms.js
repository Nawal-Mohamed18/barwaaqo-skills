/** LMS — quizzes and certificates */
window.BSLMS = {
  async fetchQuiz(courseId) {
    return window.BSAPI.get(`/learning/quiz/${courseId}/`);
  },

  async submitQuiz(courseId, answers) {
    return window.BSAPI.post(`/learning/quiz/${courseId}/submit/`, { answers });
  },

  async fetchCertificates() {
    const res = await window.BSAPI.get("/learning/certificates/");
    return res.certificates || [];
  },

  async verifyCertificate(certificateId) {
    return window.BSAPI.get(`/learning/certificates/verify/${certificateId}/`);
  },

  renderQuiz(container, quizData, onSubmit) {
    if (!container || !quizData?.hasQuiz) return;

    container.innerHTML = `
      <div class="lms-quiz">
        <h3><i class="fa-solid fa-clipboard-check"></i> ${quizData.title}</h3>
        <p class="lms-quiz-intro">Pass with ${quizData.passingScore}% or higher to complete the course.</p>
        <form id="courseQuizForm" class="lms-quiz-form"></form>
        <button type="submit" form="courseQuizForm" class="btn btn-yellow" id="quizSubmitBtn">Submit assessment</button>
        <p class="lms-quiz-result hidden" id="quizResult"></p>
      </div>`;

    const form = container.querySelector("#courseQuizForm");
    form.innerHTML = quizData.questions
      .map(
        (q, qi) => `
      <fieldset class="lms-quiz-q">
        <legend>${qi + 1}. ${q.text}</legend>
        ${q.options
          .map(
            (opt, oi) => `
          <label class="lms-quiz-opt">
            <input type="radio" name="q_${q.id}" value="${oi}" required>
            <span>${opt}</span>
          </label>`
          )
          .join("")}
      </fieldset>`
      )
      .join("");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const answers = {};
      quizData.questions.forEach((q) => {
        const picked = form.querySelector(`input[name="q_${q.id}"]:checked`);
        if (picked) answers[String(q.id)] = Number(picked.value);
      });
      const btn = container.querySelector("#quizSubmitBtn");
      btn.disabled = true;
      btn.textContent = "Submitting…";
      try {
        await onSubmit(answers);
      } finally {
        btn.disabled = false;
        btn.textContent = "Submit assessment";
      }
    });
  },

  showQuizResult(container, result) {
    const el = container?.querySelector("#quizResult");
    if (!el) return;
    el.classList.remove("hidden");
    if (result.passed) {
      el.innerHTML = `<strong>Passed (${result.score}%)</strong> — Course complete! <a href="dashboard.html">Back to dashboard</a>`;
      el.className = "lms-quiz-result lms-quiz-result--pass";
    } else {
      el.innerHTML = `<strong>Score: ${result.score}%</strong> — You need ${result.passingScore}% to pass. Review the lessons and try again.`;
      el.className = "lms-quiz-result lms-quiz-result--fail";
    }
  },
};
