/** Zone-aware footer links */
window.BSSiteFooter = {
  navHref(method, fallback) {
    const nav = window.BSNav;
    if (!nav || typeof nav[method] !== "function") return fallback;
    try {
      return nav[method].call(nav);
    } catch {
      return fallback;
    }
  },

  miniLinks() {
    const verified = window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.();
    if (verified) {
      return `
        <a href="dashboard.html">Dashboard</a>
        <a href="my-courses.html">My Courses</a>
        <a href="profile.html">Profile</a>`;
    }
    return `
      <a href="login.html">Log In</a>
      <a href="signup.html">Sign Up</a>`;
  },

  platformLinks() {
    const verified = window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.();
    const isAdmin = window.BSAuth?.isAdmin?.();
    const onCourses = document.body.classList.contains("courses-page");
    const coursesHref = this.navHref("coursesUrl", "courses.html");
    const browse = onCourses ? "" : `<a href="${coursesHref}">Browse Courses</a>`;
    const learn = `
      <a href="index.html#how-it-works">How It Works</a>
      <a href="index.html#paths">Skill Paths</a>`;

    if (verified) {
      let links =
        browse +
        learn +
        `<a href="${this.navHref("dashboardUrl", "dashboard.html")}">Dashboard</a>
         <a href="${this.navHref("myCoursesUrl", "my-courses.html")}">My Courses</a>`;
      if (!onCourses) {
        links += `<a href="${this.navHref("profileUrl", "profile.html")}">Profile</a>`;
      }
      if (isAdmin) links += `<a href="lms.html">Admin Panel</a>`;
      return links;
    }

    return (
      browse +
      learn +
      `<a href="login.html">Log In</a>
       <a href="signup.html">Sign Up</a>`
    );
  },

  supportLinks() {
    const github = window.BSConfig?.DEPLOY?.GITHUB_REPO;
    const live = window.BSConfig?.DEPLOY?.LIVE_SITE;
    let links = `<a href="faq.html">FAQ & Help Center</a>`;
    if (live) links += `<a href="${live}" target="_blank" rel="noopener">Live Website</a>`;
    if (github) {
      links += `<a href="${github}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Source on GitHub</a>`;
    }
    links += `<a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>`;
    return links;
  },

  fill(el, html) {
    if (!el || !html || !html.trim()) return;
    el.innerHTML = html;
  },

  mount() {
    try {
      document.querySelectorAll("[data-footer-mini]").forEach((el) => {
        this.fill(el, this.miniLinks());
      });
      document.querySelectorAll("[data-footer-platform]").forEach((el) => {
        this.fill(el, this.platformLinks());
      });
      document.querySelectorAll("[data-footer-support]").forEach((el) => {
        this.fill(el, this.supportLinks());
      });
    } catch (err) {
      console.warn("Footer mount failed:", err);
    }

    try {
      window.BSNav?.applyPublicNav?.();
    } catch (err) {
      console.warn("Footer nav sync failed:", err);
    }
  },
};

(function bootSiteFooter() {
  const run = () => window.BSSiteFooter.mount();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  if (window.BSAuth?.ready) run();
  else window.BSAuth?.onReady(run);
})();
