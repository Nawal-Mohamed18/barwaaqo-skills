const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");
const lessonParam = params.get("lesson");

let currentLesson = null;

async function initCoursePlayer() {
  try {
    window.BSProfilePrefs = JSON.parse(localStorage.getItem("barwaaqo_profile_prefs") || "{}");
  } catch {
    window.BSProfilePrefs = {};
  }

  await window.BSProgress?.syncFromApi?.();

  const course = window.getCourseById(courseId);
  const layout = document.getElementById("playerLayout");
  const notFound = document.getElementById("playerNotFound");
  const enrollBtn = document.getElementById("enrollBtn");
  const nextBtn = document.getElementById("nextLessonBtn");
  const limitModal = document.getElementById("courseLimitModal");
  const completePanel = document.getElementById("completePanel");
  const progressPill = document.getElementById("progressPill");

  function showLimit(message) {
    if (limitModal) {
      limitModal.textContent = message;
      limitModal.classList.add("show");
    } else if (window.showToast) {
      window.showToast(message, "info");
    }
  }

  function updateProgressUI() {
    if (!course) return;
    const pct = window.BSProgress.getLessonProgress(course);
    const completed = window.BSProgress.getCompletedLessons(course.id).length;
    const total = course.lessons.length;
    if (progressPill) progressPill.textContent = `${pct}%`;
    const label = document.getElementById("lessonProgressLabel");
    if (label) label.textContent = `${completed} of ${total} lessons complete (${pct}%)`;
    renderLessonList();
  }

  function getNextLesson(lesson) {
    const idx = course.lessons.findIndex((l) => l.id === lesson.id);
    return idx >= 0 && idx < course.lessons.length - 1
      ? course.lessons[idx + 1]
      : null;
  }

  function showCompletionRecommendations() {
    if (!completePanel) return;
    const enrolled = window.BSProgress.getEnrolled();
    const picks = window.BARWAAQO_COURSES.filter(
      (c) => c.id !== course.id && !enrolled.includes(c.id)
    ).slice(0, 3);
    const recEl = document.getElementById("completeRecommend");
    if (recEl) {
      recEl.innerHTML =
        picks
          .map(
            (c) =>
              `<a href="${window.BSNav.courseUrl(c.id)}" class="btn btn-outline-navy btn-sm">${c.title}</a>`
          )
          .join("") +
        `<a href="dashboard.html" class="btn btn-yellow btn-sm">Back to dashboard</a>`;
    }
    completePanel.classList.remove("hidden");
    nextBtn?.classList.add("hidden");
  }

  async function showQuizIfNeeded() {
    const quizWrap = document.getElementById("quizPanel");
    if (!quizWrap) return;
    try {
      const quizData = await window.BSLMS.fetchQuiz(course.id);
      if (!quizData.hasQuiz) {
        showCompletionRecommendations();
        return;
      }
      if (quizData.passed) {
        showCompletionRecommendations();
        return;
      }
      quizWrap.classList.remove("hidden");
      window.BSLMS.renderQuiz(quizWrap, quizData, async (answers) => {
        const result = await window.BSLMS.submitQuiz(course.id, answers);
        window.BSLMS.showQuizResult(quizWrap, result);
        if (result.passed) {
          await window.BSProgress.syncFromApi();
          showCompletionRecommendations();
        }
      });
    } catch (e) {
      console.warn("Quiz load failed", e);
      showCompletionRecommendations();
    }
  }

  function updateLessonActions(lesson) {
    currentLesson = lesson;
    const next = getNextLesson(lesson);
    const done = window.BSProgress.isLessonComplete(course.id, lesson.id);
    if (nextBtn) {
      if (next) {
        nextBtn.classList.remove("hidden");
        nextBtn.innerHTML = `<i class="fa-solid fa-forward-step"></i> Next: ${next.title}`;
        nextBtn.disabled = !done;
      } else {
        nextBtn.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> Final lesson`;
        nextBtn.disabled = !done;
      }
    }
    const allDone = window.BSProgress.getLessonProgress(course) >= 100;
    if (allDone || window.BSProgress.getCompleted().includes(course.id)) {
      showQuizIfNeeded();
    } else {
      completePanel?.classList.add("hidden");
      nextBtn?.classList.remove("hidden");
    }
  }

  function parseDurationSeconds(str) {
    return window.BSProgress?.parseDurationSeconds?.(str) ?? 300;
  }

  let ytPlayer = null;
  let watchTimer = null;
  let progressSaveInterval = null;
  let watchSeconds = 0;

  function getCurrentWatchSeconds() {
    if (ytPlayer?.getCurrentTime) {
      try {
        const current = ytPlayer.getCurrentTime();
        if (typeof current === "number" && current > 0) {
          return Math.floor(current);
        }
      } catch (_) {
        /* player not ready */
      }
    }
    return watchSeconds;
  }

  async function persistWatchProgress(lesson) {
    if (!lesson) return;
    await window.BSProgress.saveWatchProgress(
      course.id,
      lesson.id,
      getCurrentWatchSeconds()
    );
    updateProgressUI();
  }

  function clearWatchTimer() {
    if (watchTimer) {
      clearInterval(watchTimer);
      watchTimer = null;
    }
    if (progressSaveInterval) {
      clearInterval(progressSaveInterval);
      progressSaveInterval = null;
    }
    watchSeconds = 0;
  }

  function startWatchTimer(lesson) {
    clearWatchTimer();
    const needed = Math.floor(parseDurationSeconds(lesson.duration) * 0.85);
    watchTimer = setInterval(async () => {
      if (!currentLesson || currentLesson.id !== lesson.id) return;
      watchSeconds += 1;
      if (
        watchSeconds >= needed &&
        !window.BSProgress.isLessonComplete(course.id, lesson.id)
      ) {
        await finishLesson(lesson);
      }
    }, 1000);

    progressSaveInterval = setInterval(() => {
      if (!currentLesson || currentLesson.id !== lesson.id) return;
      persistWatchProgress(lesson);
    }, 10000);
  }

  window.onYouTubeIframeAPIReady = function () {
    if (!document.getElementById("youtubePlayer")) return;
    ytPlayer = new YT.Player("youtubePlayer", {
      events: {
        onStateChange: async (event) => {
          const lesson = currentLesson;
          if (!lesson) return;
          if (event.data === YT.PlayerState.PLAYING) {
            startWatchTimer(lesson);
          }
          if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            clearWatchTimer();
            persistWatchProgress(lesson);
          }
          if (event.data === YT.PlayerState.ENDED) {
            await finishLesson(lesson);
            const prefs = window.BSProfilePrefs || {};
            if (prefs.autoplayNext !== false) {
              const next = getNextLesson(lesson);
              if (next) await playLesson(next);
            }
          }
        },
      },
    });
  };

  function renderLessonList() {
    const lessonList = document.getElementById("lessonList");
    if (!lessonList) return;
    const activeId = currentLesson?.id;
    lessonList.innerHTML = course.lessons
      .map((lesson) => {
        const done = window.BSProgress.isLessonComplete(course.id, lesson.id);
        const active = lesson.id === activeId;
        return `
    <button type="button" class="lesson-item${active ? " active" : ""}${done ? " lesson-item--done" : ""}" data-lesson-id="${lesson.id}">
      <span class="lesson-num">${done ? '<i class="fa-solid fa-check"></i>' : lesson.id}</span>
      <span class="lesson-item-body">
        <strong>${lesson.title}</strong>
        <span>${lesson.duration}${done ? " · Completed" : ""}</span>
      </span>
      <i class="fa-solid ${done ? "fa-circle-check" : "fa-play"}"></i>
    </button>`;
      })
      .join("");

    lessonList.querySelectorAll(".lesson-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lesson = course.lessons.find(
          (l) => l.id === Number(btn.dataset.lessonId)
        );
        if (lesson) playLesson(lesson);
      });
    });
  }

  if (!course) {
    layout?.remove();
    notFound?.classList.remove("hidden");
    return;
  }

  if (!window.BSAuth?.isLoggedIn?.() || !window.BSAuth?.isVerified?.()) {
    window.location.replace(window.BSNav.coursePreviewUrl(course.id));
    return;
  }

  notFound?.remove();
  document.title = `${course.title} — Barwaaqo Skills`;

  const playerBack = document.querySelector(".player-back");
  if (playerBack) {
    playerBack.href = window.BSNav.courseLearnUrl(course.id);
    playerBack.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Course dashboard';
  }

  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseDesc").textContent = course.description;
  document.getElementById("courseInstructor").textContent = course.instructor;
  document.getElementById("courseLessons").textContent =
    `${course.lessonCount} lessons · ${course.durationLabel}`;
  document.getElementById("courseCategory").textContent = course.category;
  const slotsEl = document.getElementById("slotsInfo");
  if (slotsEl) {
    const used = window.BSProgress.slotsUsed();
    slotsEl.textContent = `${used} of ${window.BSProgress.MAX_ENROLLED} active course slots used`;
  }

  const completedSet = new Set(window.BSProgress.getCompletedLessons(course.id));
  const savedLessonId = lessonParam
    ? Number(lessonParam)
    : window.BSProgress.getLast()?.courseId === course.id
      ? window.BSProgress.getLast().lessonId
      : null;

  const startLesson =
    course.lessons.find((l) => l.id === savedLessonId && !completedSet.has(l.id)) ||
    course.lessons.find((l) => !completedSet.has(l.id)) ||
    course.lessons[0];

  const iframe = document.getElementById("youtubePlayer");

  function loadVideo(lesson) {
    const videoId = lesson.videoId;
    const embedUrl = (window.youtubeEmbed || ((id) =>
      `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`
    ))(videoId);
    if (ytPlayer?.loadVideoById) {
      ytPlayer.loadVideoById(videoId);
    } else if (iframe) {
      iframe.innerHTML = `<iframe src="${embedUrl}" title="Course video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  async function playLesson(lesson) {
    if (!window.BSProgress.isEnrolled(course.id)) {
      const result = await window.BSProgress.enroll(course.id);
      if (!result.ok) {
        showLimit(result.message);
        enrollBtn?.classList.remove("hidden");
        return;
      }
      enrollBtn?.classList.add("hidden");
      window.showToast?.(`Started "${course.title}"`);
    }

    loadVideo(lesson);
    document.getElementById("lessonTitle").textContent = lesson.title;

    try {
      await window.BSProgress.saveLast(course.id, lesson.id);
    } catch (err) {
      const msg = err.data?.message || err.message;
      if (err.data?.error === "limit") {
        showLimit(msg);
        return;
      }
    }

    currentLesson = lesson;
    updateProgressUI();
    updateLessonActions(lesson);
  }

  async function finishLesson(lesson) {
    if (!window.BSProgress.isLessonComplete(course.id, lesson.id)) {
      const res = await window.BSProgress.completeLesson(course.id, lesson.id);
      window.showToast?.(`Completed: ${lesson.title}`);
      if (res?.needsQuiz) {
        showQuizIfNeeded();
        return;
      }
    }
    updateProgressUI();
    updateLessonActions(lesson);
    if (window.BSProgress.getLessonProgress(course) >= 100) {
      showQuizIfNeeded();
    }
  }

  renderLessonList();

  nextBtn?.addEventListener("click", async () => {
    const lesson = currentLesson || startLesson;
    const next = getNextLesson(lesson);
    if (next && window.BSProgress.isLessonComplete(course.id, lesson.id)) {
      await playLesson(next);
    }
  });

  enrollBtn?.addEventListener("click", async () => {
    const result = await window.BSProgress.enroll(course.id);
    if (result.ok) {
      enrollBtn.classList.add("hidden");
      window.showToast?.(`Enrolled in "${course.title}"!`);
      playLesson(startLesson);
    } else {
      showLimit(result.message);
    }
  });

  if (window.BSProgress.isEnrolled(course.id)) {
    await playLesson(startLesson);
  } else {
    const result = await window.BSProgress.enroll(course.id);
    if (result.ok) {
      await playLesson(startLesson);
    } else {
      showLimit(result.message);
      enrollBtn?.classList.remove("hidden");
    }
  }
}

function bootCoursePlayer() {
  if (!window.__authGuardPassed || !window.__coursesReady) return;
  initCoursePlayer();
}

document.addEventListener("auth:ready", bootCoursePlayer);
document.addEventListener("courses:ready", bootCoursePlayer);
if (window.__authGuardPassed && window.__coursesReady) bootCoursePlayer();
