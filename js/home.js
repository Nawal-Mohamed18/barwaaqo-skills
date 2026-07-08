/** Homepage — hero metrics use marketing mock stats; hero card personalizes for learners */
(function () {
  const hero = document.getElementById("home");
  if (!hero) return;

  const DEFAULT_COURSE_ID = "ui-ux-fundamentals";

  /** Display-only stats for the hero metrics bar (not live database counts). */
  const MOCK_HERO_STATS = {
    statStudents: "2,500+",
    statCourses: "25",
    statFree: "25",
    statCompleted: "120+",
    socialProof: "Join 2,500+ learners building real skills on Barwaaqo Skills.",
  };

  function applyMockHeroStats() {
    Object.entries(MOCK_HERO_STATS).forEach(([key, value]) => {
      if (key === "socialProof") {
        const proof = document.getElementById("heroSocialProof");
        if (proof) proof.textContent = value;
        return;
      }
      const el = document.getElementById(key);
      if (!el) return;
      el.textContent = value;
      el.dataset.count = value.replace(/[^0-9]/g, "") || value;
      delete el.dataset.counted;
    });
  }

  function setGuestHero() {
    const course = window.getCourseById?.(DEFAULT_COURSE_ID);
    const title = document.getElementById("heroLessonTitle");
    const meta = document.getElementById("heroLessonMeta");
    const pct = document.getElementById("heroProgressPct");
    const fill = document.getElementById("heroProgressFill");
    const note = document.getElementById("heroProgressNote");

    if (title) title.textContent = course?.title || "UI/UX Design Fundamentals";
    if (meta) {
      meta.textContent = course
        ? `${course.lessons[0]?.title || "Lesson 1"} · Free to start`
        : "Lesson 1 · Free to start";
    }
    if (pct) pct.textContent = "0%";
    if (fill) fill.style.width = "0%";
    if (note) note.textContent = "Pick a free course and begin.";
  }

  function setLearnerHero() {
    const last = window.BSProgress?.getLast();
    const course =
      (last?.courseId && window.getCourseById?.(last.courseId)) ||
      window.getCourseById?.(DEFAULT_COURSE_ID);
    if (!course) return setGuestHero();

    const completed = window.BSProgress.getCompletedLessons(course.id);
    const nextLesson =
      course.lessons.find((l) => !completed.includes(l.id)) || course.lessons[0];
    const progress = window.BSProgress.getLessonProgress(course);

    const title = document.getElementById("heroLessonTitle");
    const meta = document.getElementById("heroLessonMeta");
    const pct = document.getElementById("heroProgressPct");
    const fill = document.getElementById("heroProgressFill");
    const note = document.getElementById("heroProgressNote");

    if (title) title.textContent = course.title;
    if (meta) {
      meta.textContent = `${nextLesson.title} · Lesson ${nextLesson.id} of ${course.lessons.length}`;
    }
    if (pct) pct.textContent = `${progress}%`;
    if (fill) fill.style.width = `${progress}%`;
    if (note) {
      note.textContent =
        progress >= 100
          ? "Pass the final quiz to complete the course."
          : progress > 0
            ? "Keep going — you're making progress."
            : "Welcome back — continue where you left off.";
    }
  }

  function personalizeHero() {
    if (window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.()) {
      setLearnerHero();
    } else {
      setGuestHero();
    }
  }

  function personalizeCta() {
    const sub = document.getElementById("ctaSubtext");
    const ctaUser = document.getElementById("ctaUser");
    const ctaAdmin = document.getElementById("ctaAdmin");
    if (!sub) return;

    if (window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.()) {
      if (window.BSAuth?.isAdmin?.()) {
        sub.textContent =
          "Manage courses, teachers, enrollments, and platform settings from your admin panel.";
        if (ctaAdmin) {
          ctaAdmin.href = "lms.html";
          ctaAdmin.textContent = "Open admin panel";
        }
      } else {
        sub.textContent =
          "Continue learning — your courses, progress, and certificates are saved to your account.";
        if (ctaUser) {
          ctaUser.href = window.BSNav?.dashboardUrl?.() || "dashboard.html";
          ctaUser.textContent = "Go to dashboard";
        }
      }
      return;
    }

    sub.textContent =
      "Create a free account to enroll in all 25 courses, track progress, and earn XP.";
  }

  async function boot() {
    applyMockHeroStats();
    personalizeCta();

    if (window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.()) {
      if (window.BSAuth?.isAdmin?.()) {
        personalizeHero();
        return;
      }
      window.location.replace("dashboard.html");
      return;
    }

    personalizeHero();
  }

  document.addEventListener("courses:ready", boot, { once: true });
  window.BSAuth?.onReady(boot);
  if (window.__coursesReady) boot();
})();
