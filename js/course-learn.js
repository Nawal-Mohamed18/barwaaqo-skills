const params = new URLSearchParams(location.search);
const courseId = params.get("id");

async function initCourseLearn() {
  await window.BSProgress?.syncFromApi?.();

  const course = window.getCourseById(courseId);
  const notFound = document.getElementById("learnNotFound");
  const content = document.getElementById("learnContent");

  if (!course) {
    content?.classList.add("hidden");
    notFound?.classList.remove("hidden");
    return;
  }

  if (!window.BSAuth?.isLoggedIn?.() || !window.BSAuth?.isVerified?.()) {
    location.replace(window.BSNav.coursePreviewUrl(courseId));
    return;
  }

  const enrolled = window.BSProgress.isEnrolled(courseId);

  document.title = `${course.title} — Learn — Barwaaqo Skills`;

  const thumbEl = document.getElementById("learnThumb");
  if (thumbEl) {
    thumbEl.innerHTML = `<img src="${window.youtubeThumb(course.thumbnailVideoId)}" alt="${course.title}">`;
  }

  document.getElementById("learnCategory").textContent = course.category;
  document.getElementById("learnTitle").textContent = course.title;
  const topbarTitle = document.getElementById("learnTopbarTitle");
  if (topbarTitle) topbarTitle.textContent = course.title;
  document.getElementById("learnInstructor").textContent = `Instructor: ${course.instructor}`;
  document.getElementById("learnDesc").textContent = course.description;
  document.getElementById("learnDuration").textContent = `${course.lessonCount} lessons · ${course.durationLabel}`;

  const completedLessons = window.BSProgress.getCompletedLessons(courseId);
  const progress = window.BSProgress.getLessonProgress(course);
  const total = course.lessons.length;
  const isDone = window.BSProgress.getCompleted().includes(courseId);

  document.getElementById("learnProgressText").textContent = isDone ? "Completed" : `${progress}% complete`;
  document.getElementById("learnLessonCount").textContent = `${completedLessons.length}/${total} lessons`;
  const fill = document.getElementById("learnProgressFill");
  const bar = document.getElementById("learnProgressBar");
  if (fill) fill.style.width = `${isDone ? 100 : progress}%`;
  if (bar) bar.setAttribute("aria-valuenow", String(isDone ? 100 : progress));

  const resumeUrl = window.BSProgress.getResumeUrl(courseId);
  const resumeBtn = document.getElementById("learnResumeBtn");
  const enrollGate = document.getElementById("learnEnrollGate");

  if (!enrolled) {
    if (enrollGate) {
      enrollGate.classList.remove("hidden");
      enrollGate.innerHTML = `
        <div class="learn-enroll-banner">
          <div>
            <strong>Enroll to start learning</strong>
            <p>Confirm enrollment to unlock lessons and save your progress (${window.BSProgress.slotsRemaining()} of ${window.BSProgress.MAX_ENROLLED} slots available).</p>
          </div>
          <button type="button" class="btn btn-yellow" id="learnEnrollBtn"><i class="fa-solid fa-plus"></i> Enroll in course</button>
        </div>`;
      document.getElementById("learnEnrollBtn")?.addEventListener("click", async () => {
        const result = await window.BSProgress.enroll(courseId);
        if (!result.ok) {
          window.showToast?.(result.message || "Could not enroll.", "error");
          return;
        }
        window.showToast?.(`Enrolled in "${course.title}"`);
        initCourseLearn();
      });
    }
    if (resumeBtn) {
      resumeBtn.classList.add("hidden");
    }
  } else {
    enrollGate?.classList.add("hidden");
    if (resumeBtn) resumeBtn.classList.remove("hidden");
  }

  if (resumeBtn && enrolled) {
    resumeBtn.href = resumeUrl;
    resumeBtn.innerHTML = isDone
      ? '<i class="fa-solid fa-rotate-left"></i> Review course'
      : completedLessons.length
        ? '<i class="fa-solid fa-play"></i> Resume lesson'
        : '<i class="fa-solid fa-play"></i> Start first lesson';
  }

  document.getElementById("learnCertBtn")?.remove();

  const completedSet = new Set(completedLessons);
  const list = document.getElementById("learnLessonList");
  if (list) {
    list.innerHTML = course.lessons
      .map((lesson) => {
        const done = completedSet.has(lesson.id);
        const lessonUrl = enrolled
          ? `${window.BSNav.coursePlayerUrl(courseId, lesson.id)}`
          : "#";
        const lockedClass = enrolled ? "" : " learn-lesson-item--locked";
        return `
        <a href="${lessonUrl}" class="learn-lesson-item${done ? " learn-lesson-item--done" : ""}${lockedClass}"${enrolled ? "" : ' aria-disabled="true"'}>
          <span class="learn-lesson-num">${done ? '<i class="fa-solid fa-check"></i>' : lesson.id}</span>
          <div class="learn-lesson-body">
            <strong>${lesson.title}</strong>
            <span>${lesson.duration}</span>
          </div>
          <i class="fa-solid fa-chevron-right learn-lesson-arrow"></i>
        </a>`;
      })
      .join("");

    if (!enrolled) {
      list.querySelectorAll(".learn-lesson-item--locked").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          window.showToast?.("Enroll in this course to access lessons.", "info");
        });
      });
    }
  }

  const quizSection = document.getElementById("learnQuizSection");
  const quizBtn = document.getElementById("learnQuizBtn");
  const quizStatus = document.getElementById("learnQuizStatus");
  const allLessonsDone = completedLessons.length >= total;

  if (quizSection && allLessonsDone) {
    quizSection.classList.remove("hidden");
    if (quizBtn) quizBtn.href = `course.html?id=${courseId}&quiz=1`;
    if (quizStatus) {
      quizStatus.textContent = isDone
        ? "You passed the final assessment. Course complete!"
        : "All lessons complete — take the final quiz to finish the course (70% to pass).";
    }
  }
}

function bootLearn() {
  if (!window.__coursesReady) return;
  if (window.__authGuardPassed) initCourseLearn();
}

document.addEventListener("courses:ready", bootLearn);
document.addEventListener("auth:ready", bootLearn);
if (window.__coursesReady && window.__authGuardPassed) initCourseLearn();
