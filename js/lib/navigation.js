/**
 * Barwaaqo Skills — Navigation
 */
window.BSNav = {
  LAYER: {
    attraction: ["index.html", "courses.html"],
    decision: ["course-preview.html"],
    auth: ["login.html", "signup.html", "verify-email.html", "profile.html"],
    execution: ["course-learn.html", "course.html", "dashboard.html", "my-courses.html", "profile.html"],
    admin: ["lms.html"],
  },

  pageName() {
    return location.pathname.split("/").pop() || "index.html";
  },

  coursePlayerUrl(courseId, lessonId) {
    let url = `course.html?id=${courseId}`;
    if (lessonId) url += `&lesson=${lessonId}`;
    return url;
  },

  coursePreviewUrl(courseId) {
    return `course-preview.html?id=${courseId}`;
  },

  courseLearnUrl(courseId) {
    return `course-learn.html?id=${courseId}`;
  },

  courseUrl(courseId) {
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      return this.courseLearnUrl(courseId);
    }
    return this.coursePreviewUrl(courseId);
  },

  startCourseUrl(courseId) {
    const learn = this.courseLearnUrl(courseId);
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      return learn;
    }
    if (window.BSAuth?.isLoggedIn() && !window.BSAuth?.isVerified()) {
      return `verify-email.html?email=${encodeURIComponent(window.BSAuth.user.email)}&redirect=${encodeURIComponent(learn)}`;
    }
    return `signup.html?redirect=${encodeURIComponent(learn)}`;
  },

  loginUrl(redirect) {
    const dest = redirect || this.postLoginUrl();
    return `login.html?redirect=${encodeURIComponent(dest)}`;
  },

  profileUrl() {
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      return "profile.html";
    }
    return this.loginUrl("profile.html");
  },

  dashboardUrl() {
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      if (window.BSAuth?.isAdmin?.()) return "lms.html";
      return "dashboard.html";
    }
    return this.loginUrl("dashboard.html");
  },

  adminUrl() {
    if (window.BSAuth?.isAdmin?.()) {
      return "lms.html";
    }
    return this.dashboardUrl();
  },

  coursesUrl() {
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      return "courses.html";
    }
    return this.loginUrl("courses.html");
  },

  myCoursesUrl() {
    if (window.BSAuth?.isLoggedIn() && window.BSAuth?.isVerified()) {
      return "my-courses.html";
    }
    return this.loginUrl("my-courses.html");
  },

  postLoginUrl() {
    const params = new URLSearchParams(location.search);
    const explicit = params.get("redirect");
    if (
      explicit &&
      !explicit.includes("signup") &&
      !explicit.includes("login") &&
      !explicit.includes("index.html")
    ) {
      return explicit;
    }
    const stored = sessionStorage.getItem("barwaaqo_signup_redirect");
    if (stored && !stored.includes("signup") && !stored.includes("index.html")) {
      return stored;
    }
    if (window.BSAuth?.isAdmin?.()) return "lms.html";
    return "dashboard.html";
  },

  resumeUrl() {
    const last = window.BSProgress?.getLast?.();
    if (last?.courseId) {
      return window.BSProgress.getResumeUrl(last.courseId);
    }
    return "dashboard.html";
  },

  applyPublicNav() {
    const verified = window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.();
    const isAdmin = window.BSAuth?.isAdmin?.();

    document.querySelectorAll("[data-nav-dashboard]").forEach((el) => {
      if (isAdmin) {
        el.href = "lms.html";
        if (el.dataset.adminLabel) el.textContent = el.dataset.adminLabel;
      } else {
        el.href = this.dashboardUrl();
      }
    });
    document.querySelectorAll("[data-nav-courses]").forEach((el) => {
      el.href = this.coursesUrl();
    });
    document.querySelectorAll("[data-nav-mycourses]").forEach((el) => {
      el.href = this.myCoursesUrl();
    });
    document.querySelectorAll("[data-nav-profile]").forEach((el) => {
      el.href = this.profileUrl();
    });
    document.querySelectorAll("[data-nav-admin]").forEach((el) => {
      el.href = this.adminUrl();
    });

    document.querySelectorAll("[data-nav-zone='public-only']").forEach((el) => {
      el.style.display = verified ? "none" : "";
    });
    document.querySelectorAll("[data-nav-zone='app-only']").forEach((el) => {
      el.style.display = verified ? "" : "none";
    });
    document.querySelectorAll("[data-auth='guest']").forEach((el) => {
      el.style.display = verified ? "none" : "";
    });
    document.querySelectorAll("[data-auth='user']").forEach((el) => {
      const hideForAdmin = el.hasAttribute("data-hide-admin");
      el.style.display = verified && !(isAdmin && hideForAdmin) ? "" : "none";
    });
    document.querySelectorAll("[data-auth='admin']").forEach((el) => {
      el.style.display = verified && isAdmin ? "" : "none";
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => BSNav.applyPublicNav();
  if (window.BSAuth?.ready) boot();
  else window.BSAuth?.onReady(boot);
});
