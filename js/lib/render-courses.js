/** Shared course card HTML */

window.renderCourseCard = (course) => {
  const thumb = window.youtubeThumb(course.thumbnailVideoId);
  const href =
    (window.BSNav && window.BSNav.courseUrl(course.id)) ||
    (window.BSAuth?.getCourseUrl && window.BSAuth.getCourseUrl(course.id)) ||
    `course-preview.html?id=${course.id}`;

  const enrolled = window.BSProgress?.isEnrolled(course.id)
    ? `<span class="badge badge-blue" style="left:auto;right:12px;">Enrolled</span>`
    : "";

  const badge = course.badge
    ? `<span class="badge ${course.badgeClass}">${course.badge}</span>`
    : "";

  const lessons = course.lessons || [];
  const lessonCount = course.lessonCount ?? lessons.length;
  const duration = course.durationLabel || `${lessonCount} lessons`;

  return `
    <article class="course-card">
      <a href="${href}">
        <div class="course-thumb">
          <img src="${thumb}" alt="${course.title}" loading="lazy">
          ${badge}
          ${enrolled}
        </div>
        <div class="course-body">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="course-instructor">
            <img src="${course.instructorAvatar}" alt="">
            <span>${course.instructor}</span>
            <span class="rating"><i class="fa-solid fa-star"></i> ${course.rating} <small>(${formatCount(course.reviewCount)})</small></span>
          </div>
          <div class="course-footer">
            <span><i class="fa-brands fa-youtube"></i> ${lessonCount} lessons · ${duration}</span>
            <strong class="price-free">Free</strong>
          </div>
        </div>
      </a>
    </article>`;
};

/** Homepage featured preview — image only, no links */
window.renderHomeCourseCard = (course) => {
  const thumb = window.youtubeThumb(course.thumbnailVideoId);
  const badge = course.badge
    ? `<span class="badge ${course.badgeClass}">${course.badge}</span>`
    : "";
  const lessonCount = course.lessonCount ?? course.lessons?.length ?? 0;
  const duration = course.durationLabel || `${lessonCount} lessons`;

  return `
    <article class="course-card course-card--static">
      <div class="course-thumb">
        <img src="${thumb}" alt="${course.title}" loading="lazy">
        ${badge}
      </div>
      <div class="course-body">
        <span class="course-category-tag">${course.category}</span>
        <h3>${course.title}</h3>
        <p>${course.instructor} · ${lessonCount} lessons</p>
        <div class="course-footer">
          <span>${duration}</span>
          <strong class="price-free">Free</strong>
        </div>
      </div>
    </article>`;
};

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n;
}

window.renderDashCourseCard = (course) => {
  const thumb = window.youtubeThumb(course.thumbnailVideoId);
  const tagClass =
    course.category === "Design"
      ? "dash-tag--yellow"
      : course.category === "Business"
        ? "dash-tag--green"
        : course.category === "Personal"
          ? "dash-tag--pink"
          : "dash-tag--navy";

  return `
    <article class="dash-course-card">
      <a href="${(window.BSNav && window.BSNav.courseUrl(course.id)) || `course.html?id=${course.id}`}">
        <div class="dash-course-thumb">
          <img src="${thumb}" alt="${course.title}" loading="lazy">
        </div>
        <div class="dash-course-body">
          <span class="dash-tag ${tagClass}">${course.category}</span>
          <h3>${course.title}</h3>
          <div class="dash-course-meta">
            <span><i class="fa-brands fa-youtube"></i> ${course.lessonCount} lessons · ${course.durationLabel}</span>
            <div class="dash-instructor">
              <img src="${course.instructorAvatar}" alt="">
              <span>${course.instructor.split(" ")[0]}</span>
            </div>
          </div>
        </div>
      </a>
    </article>`;
};

window.refreshCourseCards = function () {
  const catalog = document.getElementById("catalogGrid");
  const featured = document.getElementById("featuredCourses");

  if (catalog && window.renderCatalog) window.renderCatalog();

  if (featured && window.getHomeCourses) {
    const render = window.renderHomeCourseCard || window.renderCourseCard;
    featured.innerHTML = window.getHomeCourses().map((c) => render(c)).join("");
    featured.querySelectorAll(".course-card--static").forEach((card) => {
      card.classList.add("bs-revealed");
    });
    window.BSHomeReveal?.refresh?.();
  }
};
