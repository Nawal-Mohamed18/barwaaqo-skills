const grid = document.getElementById("myCoursesGrid");
const empty = document.getElementById("myCoursesEmpty");
const slotsEl = document.getElementById("mySlotsInfo");

async function leaveCourse(course) {
  const isCompleted = window.BSProgress.getCompleted().includes(course.id);
  if (isCompleted) {
    window.showToast?.("Completed courses stay on your record.", "info");
    return;
  }

  const confirmed = window.confirm(
    `Leave "${course.title}"?\n\nYour progress for this course will be removed and the slot will be freed.`
  );
  if (!confirmed) return;

  try {
    await window.BSProgress.unenroll(course.id);
    window.showToast?.(`Left "${course.title}"`);
    await renderMyCourses();
  } catch (e) {
    window.showToast?.(e.data?.message || e.message || "Could not leave course.", "error");
  }
}

async function renderMyCourses() {
  await window.BSProgress?.syncFromApi?.();

  const enrolled = window.BSProgress.getEnrolled();
  if (slotsEl) {
    const used = window.BSProgress.slotsUsed();
    slotsEl.textContent = `${used} of ${window.BSProgress.MAX_ENROLLED} slots in use`;
  }

  if (!grid) return;

  if (enrolled.length === 0) {
    grid.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }

  empty?.classList.add("hidden");
  grid.innerHTML = enrolled
    .map((id) => window.getCourseById(id))
    .filter(Boolean)
    .map((course) => {
      const progress = window.BSProgress.getLessonProgress(course);
      const resumeUrl = window.BSProgress.getResumeUrl(course.id);
      const thumb = window.youtubeThumb(course.thumbnailVideoId);
      const completed = window.BSProgress.getCompleted().includes(course.id);
      const completedLessons = window.BSProgress.getCompletedLessons(course.id).length;
      const btnLabel = completed ? "View" : progress > 0 ? "Resume" : "Start";
      const btnClass = completed ? "btn btn-navy" : "btn btn-yellow";
      const btnContent = completed ? btnLabel : `<i class="fa-solid fa-play"></i> ${btnLabel}`;
      const leaveBtn = completed
        ? ""
        : `<button type="button" class="btn btn-outline-navy btn-sm my-course-leave" data-course-id="${course.id}">Leave course</button>`;

      return `
        <article class="dash-continue my-course-row">
          <div class="dash-continue-thumb">
            <img src="${thumb}" alt="${course.title}">
          </div>
          <div class="dash-continue-body">
            <span class="dash-tag dash-tag--navy">${course.category}</span>
            <h3>${course.title}</h3>
            <p>${completed ? "Completed" : `${completedLessons}/${course.lessonCount} lessons · ${progress}%`} · ${course.durationLabel}</p>
            <div class="dash-progress">
              <div class="dash-progress-fill dash-progress-fill--accent" style="width: ${completed ? 100 : progress}%"></div>
            </div>
          </div>
          <div class="my-course-actions">
            <a href="${resumeUrl}" class="${btnClass}">${btnContent}</a>
            ${leaveBtn}
          </div>
        </article>`;
    })
    .join("");

  grid.querySelectorAll(".my-course-leave").forEach((btn) => {
    btn.addEventListener("click", () => {
      const course = window.getCourseById(btn.dataset.courseId);
      if (course) leaveCourse(course);
    });
  });
}

function bootMyCourses() {
  if (!window.__coursesReady) return;
  renderMyCourses();
}

document.addEventListener("auth:ready", bootMyCourses);
document.addEventListener("courses:ready", bootMyCourses);
document.addEventListener("progress:updated", renderMyCourses);
if (window.__authGuardPassed && window.__coursesReady) renderMyCourses();
