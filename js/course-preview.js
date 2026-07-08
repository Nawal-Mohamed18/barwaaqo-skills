const params = new URLSearchParams(location.search);
const courseId = params.get("id");

function renderCurriculum(course) {
  const el = document.getElementById("previewCurriculum");
  if (!el) return;
  const canLearn = window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.();
  el.innerHTML = course.lessons
    .map(
      (lesson, i) => `
    <div class="curriculum-item${i === 0 || canLearn ? "" : " curriculum-item--locked"}">
      <span class="curriculum-num">${lesson.id}</span>
      <div>
        <strong>${lesson.title}</strong>
        <span>${lesson.duration}</span>
      </div>
      ${i === 0 ? '<span class="curriculum-tag">Preview lesson</span>' : canLearn ? "" : '<i class="fa-solid fa-lock"></i>'}
    </div>`
    )
    .join("");
}

async function initPreview() {
  await window.BSProgress?.syncFromApi?.();

  const course = window.getCourseById(courseId);

  if (!course) {
    document.getElementById("previewContent")?.remove();
    document.getElementById("previewNotFound")?.classList.remove("hidden");
    return;
  }

  document.title = `${course.title} — Barwaaqo Skills`;

  if (window.BSAuth.isLoggedIn() && window.BSAuth.isVerified()) {
    location.replace(window.BSNav.courseLearnUrl(courseId));
    return;
  }

  const playerRedirect = window.BSNav.courseLearnUrl(courseId);
  const startUrl = window.BSNav.startCourseUrl(courseId);
  const loginUrl = window.BSNav.loginUrl(playerRedirect);

  document.getElementById("previewImg").src = window.youtubeThumb(course.thumbnailVideoId);
  document.getElementById("previewImg").alt = course.title;
  document.getElementById("previewTitle").textContent = course.title;
  document.getElementById("previewInstructor").textContent = course.instructor;
  document.getElementById("previewCategory").textContent = course.category;
  document.getElementById("previewLevel").textContent =
    course.category === "Coding" ? "Beginner–Intermediate" : "All levels";
  document.getElementById("previewLessons").textContent =
    `${course.lessonCount} lessons · ${course.durationLabel}`;
  document.getElementById("previewDesc").textContent = course.description;
  document.getElementById("statLessons").textContent = course.lessonCount;
  document.getElementById("statDuration").textContent = course.durationLabel;
  document.getElementById("statRating").textContent = `${course.rating} ★ (${course.reviewCount})`;

  const statCost = document.getElementById("statCost");
  const authHint = document.getElementById("previewAuthHint");
  if (statCost) statCost.textContent = "Free";
  document.getElementById("previewPremiumNote")?.classList.add("hidden");

  document.getElementById("previewLearn").innerHTML = course.roadmap
    .map((p) => `<li><i class="fa-solid fa-check"></i> ${p.goal}</li>`)
    .join("");

  document.getElementById("previewRoadmap").innerHTML = window.renderRoadmap(course);
  renderCurriculum(course);

  const startBtn = document.getElementById("startBtn");
  const bottomBtn = document.getElementById("startBtnBottom");
  const loginLink = document.getElementById("previewLogin");
  startBtn.href = startUrl;
  loginLink.href = loginUrl;

  if (window.BSAuth.isLoggedIn() && !window.BSAuth.isVerified()) {
    startBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> Verify email to start`;
    if (authHint) authHint.textContent = "Check your inbox to verify your account first.";
  } else {
    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Sign up to start`;
    startBtn.classList.add("btn-yellow");
    if (bottomBtn) bottomBtn.href = startUrl;
    if (authHint) {
      authHint.innerHTML = `All courses are free. <a href="${loginUrl}">Log in</a> if you already have an account.`;
    }
  }

  document.getElementById("saveBtn")?.remove();
}

function bootPreview() {
  if (!window.__coursesReady) return;
  if (window.BSAuth.ready) initPreview();
  else window.BSAuth.onReady(initPreview);
}

document.addEventListener("courses:ready", bootPreview, { once: true });
if (window.__coursesReady) bootPreview();
