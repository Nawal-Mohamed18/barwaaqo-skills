/** Shared app sidebar + topbar user chip */
window.BSAppShell = {
  pages: {
    dashboard: { href: "dashboard.html", icon: "fa-gauge-high", label: "Dashboard" },
    courses: { href: "courses.html", icon: "fa-compass", label: "Courses" },
    mycourses: { href: "my-courses.html", icon: "fa-book-open", label: "My Courses" },
    profile: { href: "profile.html", icon: "fa-user", label: "Profile" },
    admin: { href: "lms.html", icon: "fa-shield-halved", label: "Admin" },
  },

  adminPages: {
    overview: { href: "lms.html", icon: "fa-gauge-high", label: "Dashboard" },
    students: { href: "lms.html#students", icon: "fa-user-graduate", label: "Students" },
    teachers: { href: "lms.html#teachers", icon: "fa-chalkboard-user", label: "Teachers" },
    manageCourses: { href: "lms.html#manage-courses", icon: "fa-pen-to-square", label: "Manage courses" },
    enrollments: { href: "lms.html#enrollments", icon: "fa-user-graduate", label: "Enrollments" },
    certificates: { href: "lms.html#certificates", icon: "fa-award", label: "Certificates" },
    courses: { href: "lms.html#courses", icon: "fa-chart-simple", label: "Analytics" },
    site: { href: "index.html", icon: "fa-globe", label: "View website" },
    account: { href: "profile.html", icon: "fa-user", label: "My account" },
  },

  _adminHash() {
    const hash = (window.location.hash || "#overview").replace("#", "");
    return hash || "overview";
  },

  _activeAdminKey(activePage, href) {
    if (activePage !== "admin") return false;
    const page = location.pathname.split("/").pop() || "index.html";
    if (href === "profile.html") return page === "profile.html";
    if (href === "index.html") return false;
    const hash = this._adminHash();
    if (href.includes("#")) {
      return page === "lms.html" && href.endsWith(`#${hash}`);
    }
    return page === "lms.html" && (hash === "overview" || !window.location.hash);
  },

  renderLearnerSidebar(activePage) {
    const isAdmin = window.BSAuth?.isAdmin?.();
    const navKeys = isAdmin
      ? ["dashboard", "courses", "mycourses", "profile", "admin"]
      : ["dashboard", "courses", "mycourses", "profile"];

    return navKeys
      .map((key) => {
        const p = this.pages[key];
        const isActive = key === activePage ? " active" : "";
        return `<a href="${p.href}" class="${isActive.trim()}"><i class="fa-solid ${p.icon}"></i> ${p.label}</a>`;
      })
      .join("");
  },

  renderAdminSidebar(activePage) {
    return Object.values(this.adminPages)
      .map((p) => {
        const isActive = this._activeAdminKey(activePage, p.href) ? " active" : "";
        return `<a href="${p.href}" class="${isActive.trim()}"><i class="fa-solid ${p.icon}"></i> ${p.label}</a>`;
      })
      .join("");
  },

  renderSidebar(activePage) {
    const isAdminArea = activePage === "admin";
    const navItems = isAdminArea
      ? this.renderAdminSidebar(activePage)
      : this.renderLearnerSidebar(activePage);

    const navLabel = isAdminArea
      ? `<span class="dash-nav-label">Administration</span>`
      : "";

    return `
      <a href="${isAdminArea ? "lms.html" : "index.html"}" class="dash-logo">
        <span class="dash-logo-icon"><i class="fa-solid fa-graduation-cap"></i></span>
        <span><strong>Barwaaqo Skills</strong><small>${isAdminArea ? "Administration" : "Learn Anytime, Anywhere"}</small></span>
      </a>
      ${navLabel}
      <nav class="dash-nav">${navItems}</nav>
      <div class="dash-sidebar-bottom">
        <span class="dash-nav-label">Preferences</span>
        <nav class="dash-nav">
          <button type="button" class="dash-nav-btn" id="shellThemeToggle" aria-label="Toggle theme">
            <i class="fa-solid fa-moon" id="shellThemeIcon"></i> <span id="shellThemeLabel">Dark mode</span>
          </button>
        </nav>
        <span class="dash-nav-label">Account</span>
        <nav class="dash-nav">
          ${isAdminArea ? "" : `<a href="faq.html"><i class="fa-regular fa-circle-question"></i> Help & FAQ</a>`}
          <button type="button" class="dash-nav-btn" id="shellLogout"><i class="fa-solid fa-right-from-bracket"></i> Log out</button>
        </nav>
      </div>`;
  },

  userChipHtml(opts = {}) {
    const href = opts.href || "profile.html";
    const title = opts.title || "Profile settings";
    return `
      <a href="${href}" class="dash-user" title="${title}">
        <span class="dash-user-avatar" data-user-initials>?</span>
        <span data-user-name>Student</span>
      </a>`;
  },

  mountSidebar(activePage) {
    const el = document.getElementById("dashSidebar");
    if (!el) return;
    el.innerHTML = this.renderSidebar(activePage);
    document.getElementById("shellLogout")?.addEventListener("click", () => {
      if (confirm("Log out?")) window.BSAuth.signOut();
    });
    window.BSTheme?.bindToggle?.("shellThemeToggle");
  },

  mountUserChip() {
    const slot = document.getElementById("dashUserSlot");
    if (!slot) return;
    slot.innerHTML = this.userChipHtml();
    window.BSAuth?._updateNav?.();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const shellPages = ["dashboard", "my-courses", "profile", "lms", "mycourses", "admin", "courses"];
  if (!shellPages.includes(page)) return;

  const map = {
    dashboard: "dashboard",
    courses: "courses",
    "my-courses": "mycourses",
    mycourses: "mycourses",
    profile: "profile",
    lms: "admin",
    admin: "admin",
  };

  const boot = () => {
    const isAdmin = window.BSAuth?.isAdmin?.();
    const sidebarPage = isAdmin && (page === "profile" || page === "admin" || page === "lms") ? "admin" : map[page];
    BSAppShell.mountSidebar(sidebarPage);
    BSAppShell.mountUserChip();
  };

  if (window.BSAuth?.ready) boot();
  else window.BSAuth?.onReady(boot);

  if (page === "admin" || page === "lms") {
    window.addEventListener("hashchange", () => BSAppShell.mountSidebar("admin"));
  }
});
