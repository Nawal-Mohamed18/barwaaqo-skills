function firstName() {
  const name = window.BSAuth?.user?.name?.trim();
  if (!name) return "";
  return name.split(/\s+/)[0];
}

function personalizeWelcome() {
  const heading = document.querySelector(".dash-topbar-heading");
  if (!heading) return;
  const name = firstName();
  heading.textContent = name ? `Welcome back, ${name}` : "Welcome back";
}

function loadContinueLearning() {
  const continueEl = document.getElementById("dashContinue");
  const resumeBtn = document.getElementById("resumeBtn");
  const headline = document.getElementById("panelHeadline");
  const sub = document.getElementById("panelSub");
  if (!continueEl) return;

  const last = window.BSProgress.getLast();
  if (!last?.courseId) {
    continueEl.innerHTML = `
      <p style="color: var(--text-muted); padding: 8px 0;">No active course yet. Open <strong>Courses</strong> from the sidebar to enroll.</p>`;
    if (resumeBtn) {
      resumeBtn.innerHTML = '<i class="fa-solid fa-book-open"></i> My courses';
      resumeBtn.href = "my-courses.html";
    }
    if (headline) headline.textContent = "Your learning hub";
    if (sub) sub.textContent = "Pick a course and start learning — progress saves automatically.";
    return;
  }

  const course = window.getCourseById(last.courseId);
  if (!course) return;

  const lesson =
    course.lessons.find((l) => l.id === last.lessonId) || course.lessons[0];
  const progress = window.BSProgress.getLessonProgress(course);
  const courseUrl = window.BSProgress.getResumeUrl(course.id);
  const thumb = window.youtubeThumb(course.thumbnailVideoId);

  continueEl.innerHTML = `
    <div class="dash-continue-thumb">
      <img src="${thumb}" alt="${course.title}">
    </div>
    <div class="dash-continue-body">
      <span class="dash-tag dash-tag--navy">${course.category}</span>
      <h3>${course.title}</h3>
      <p>Next: ${lesson.title}</p>
      <div class="dash-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="dash-progress-fill dash-progress-fill--accent" style="width: ${progress}%"></div>
      </div>
    </div>
    <a href="${courseUrl}" class="btn btn-navy">Resume</a>`;

  if (resumeBtn) {
    resumeBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume Course';
    resumeBtn.href = courseUrl;
  }
  if (headline) headline.textContent = course.title;
  if (sub) {
    sub.textContent = `${progress}% complete — ${window.BSProgress.getCompletedLessons(course.id).length}/${course.lessons.length} lessons done`;
  }
  document.dispatchEvent(new CustomEvent("dashboard:rendered"));
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function animateNumber(el, from, to, { durationMs = 650, decimals = 0 } = {}) {
  if (!el) return;

  const start = Number.isFinite(from) ? from : 0;
  const end = Number.isFinite(to) ? to : 0;

  if (prefersReducedMotion() || Math.abs(end - start) < 0.001) {
    el.textContent = end.toFixed(decimals);
    el.dataset.value = String(end);
    return;
  }

  const t0 = performance.now();
  const d = clamp(durationMs, 120, 1400);

  function tick(now) {
    const p = clamp((now - t0) / d, 0, 1);
    // easeOutCubic
    const e = 1 - Math.pow(1 - p, 3);
    const cur = start + (end - start) * e;
    el.textContent = cur.toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.value = String(end);
  }

  requestAnimationFrame(tick);
}

function loadStats() {
  const stats = window.BSProgress.getStats();
  const xpEl = document.getElementById("statXp");
  const streakEl = document.getElementById("statStreak");
  const activeEl = document.getElementById("statActive");
  const hoursEl = document.getElementById("statHours");

  const xp = Number(stats.xp ?? 0) || 0;
  const streak = Number(stats.streak ?? 0) || 0;
  const active = Number(stats.active ?? 0) || 0;
  const slots = Number(stats.slots ?? 3) || 3;
  const hours = Number(stats.hours ?? 0) || 0;

  animateNumber(xpEl, Number(xpEl?.dataset.value), xp, { durationMs: 750, decimals: 0 });
  animateNumber(streakEl, Number(streakEl?.dataset.value), streak, { durationMs: 750, decimals: 0 });
  if (activeEl) activeEl.textContent = `${active}/${slots}`;
  animateNumber(hoursEl, Number(hoursEl?.dataset.value), hours, { durationMs: 750, decimals: 1 });
}

function activityLevel(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function localTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildActivityWeeks(activity) {
  if (!activity.length) return [];

  const first = new Date(`${activity[0].date}T12:00:00`);
  const padStart = first.getDay();
  const cells = [];

  for (let i = 0; i < padStart; i += 1) cells.push(null);
  activity.forEach((day) => cells.push(day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let w = 0; w < cells.length / 7; w += 1) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }
  return weeks;
}

function renderActivityCell(day, todayIso) {
  if (!day) {
    return `<span class="dash-activity-cell dash-activity-cell--pad" aria-hidden="true"></span>`;
  }

  const lvl = activityLevel(day.count);
  const isToday = day.date === todayIso;
  const title = day.count
    ? `${day.count} lesson${day.count === 1 ? "" : "s"} on ${day.date}`
    : `No lessons on ${day.date}`;
  const seen = lvl > 0 ? " cell-seen" : "";
  const todayClass = isToday ? " is-today" : "";

  return `<span class="dash-activity-cell lvl-${lvl}${todayClass}${seen}" title="${title}" data-date="${day.date}"${day.count ? ` aria-label="${title}"` : ""}></span>`;
}

function loadActivityGrid() {
  const grid = document.getElementById("activityGrid");
  if (!grid) return;

  const activity = window.BSProgress.getActivity();
  if (!activity.length) {
    grid.innerHTML = `<p class="dash-activity-empty">Complete lessons to build your consistency graph.</p>`;
    return;
  }

  const todayIso = localTodayIso();
  const weeks = buildActivityWeeks(activity);
  const totalLessons = activity.reduce((sum, day) => sum + (day.count || 0), 0);
  const activeDays = activity.filter((day) => day.count > 0).length;

  const summary =
    totalLessons === 0
      ? "No lessons completed in this period yet"
      : `${totalLessons} lesson${totalLessons === 1 ? "" : "s"} across ${activeDays} active day${activeDays === 1 ? "" : "s"}`;

  grid.innerHTML = `
    <div class="dash-activity-layout">
      <div class="dash-activity-weekdays" aria-hidden="true">
        <span></span>
        <span>Mon</span>
        <span></span>
        <span>Wed</span>
        <span></span>
        <span>Fri</span>
        <span></span>
      </div>
      <div class="dash-activity-weeks">
        ${weeks
          .map(
            (week) =>
              `<div class="dash-activity-week">${week.map((day) => renderActivityCell(day, todayIso)).join("")}</div>`
          )
          .join("")}
      </div>
    </div>
    <div class="dash-activity-footer">
      <p class="dash-activity-summary" id="activitySummary">${summary}</p>
      <div class="dash-activity-legend-scale" aria-hidden="true">
        <span>Less</span>
        <span class="dash-activity-cell lvl-0"></span>
        <span class="dash-activity-cell lvl-1"></span>
        <span class="dash-activity-cell lvl-2"></span>
        <span class="dash-activity-cell lvl-3"></span>
        <span class="dash-activity-cell lvl-4"></span>
        <span>More</span>
      </div>
    </div>
  `;
}

async function bootDashboard() {
  await window.BSProgress.syncFromApi?.();
  personalizeWelcome();
  loadContinueLearning();
  loadStats();
  loadActivityGrid();
  window.BSDashPage?.observeReveals?.();
  window.BSDashPage?.observeActivityCells?.();
  document.dispatchEvent(new CustomEvent("dashboard:rendered"));
}

function bootDashboardWhenReady() {
  if (!window.__coursesReady) return;
  bootDashboard();
}

document.addEventListener("auth:ready", bootDashboardWhenReady);
document.addEventListener("courses:ready", bootDashboardWhenReady);
document.addEventListener("progress:updated", () => {
  loadContinueLearning();
  loadStats();
  loadActivityGrid();
  window.BSDashPage?.observeActivityCells?.();
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted && window.__authGuardPassed) {
    window.BSProgress.syncFromApi?.().then(() => {
      personalizeWelcome();
      loadStats();
      loadActivityGrid();
      window.BSDashPage?.observeActivityCells?.();
    });
  }
});
if (window.__authGuardPassed && window.__coursesReady) bootDashboard();
