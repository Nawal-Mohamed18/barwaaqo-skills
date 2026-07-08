/**
 * Barwaaqo Skills — Auth (Django REST API)
 */
window.BSAuth = {
  MAX_COURSES: 3,
  user: null,
  ready: false,
  apiEnabled: false,
  _callbacks: [],

  onReady(cb) {
    if (this.ready) cb(this.user);
    else this._callbacks.push(cb);
  },

  async recheckApi() {
    if (window.BSConfig?.USE_API === false || typeof window.BSAPI === "undefined") {
      this.apiEnabled = false;
      return false;
    }
    try {
      this.apiEnabled = await window.BSAPI.healthCheck();
    } catch {
      this.apiEnabled = false;
    }
    return this.apiEnabled;
  },

  async init() {
    this.apiEnabled =
      window.BSConfig?.USE_API !== false && typeof window.BSAPI !== "undefined";

    if (this.apiEnabled) {
      try {
        this.apiEnabled = await window.BSAPI.healthCheck();
      } catch {
        this.apiEnabled = false;
      }
    }

    if (this.apiEnabled && window.BSAPI.getToken()) {
      try {
        const me = await window.BSAPI.get("/auth/me/");
        this.user = {
          uid: me.uid,
          email: me.email,
          name: me.name,
          emailVerified: me.emailVerified,
          role: me.role || "student",
          avatarUrl: me.avatarUrl || null,
          learningPath: me.learningPath || "coding",
          createdAt: me.dateJoined || null,
        };
      } catch {
        window.BSAPI.setToken(null);
        this.user = null;
      }
    }

    if (this.user?.emailVerified) {
      await window.BSProgress?.syncFromApi?.();
    }

    this.ready = true;
    this._callbacks.forEach((cb) => cb(this.user));
    this._callbacks = [];
    this._updateNav();
    this._loadSharshabeel();
  },

  getUid() {
    return this.user?.uid || null;
  },

  isLoggedIn() {
    return !!this.user;
  },

  isVerified() {
    return !!this.user?.emailVerified;
  },

  isAdmin() {
    return this.user?.role === "admin";
  },

  isTeacher() {
    return this.user?.role === "teacher";
  },

  _loadSharshabeel() {
    if (window.__bsSharshabeelLoading || document.body?.dataset?.page === "design") return;
    window.__bsSharshabeelLoading = true;

    if (!document.getElementById("sharshabeel-css")) {
      const link = document.createElement("link");
      link.id = "sharshabeel-css";
      link.rel = "stylesheet";
      link.href = "css/sharshabeel.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("sharshabeel-js")) {
      const script = document.createElement("script");
      script.id = "sharshabeel-js";
      script.src = "js/lib/sharshabeel.js";
      document.body.appendChild(script);
    } else {
      window.BSSharshabeel?.mount?.();
      window.BSSharshabeel?.refresh?.();
    }
  },

  async signUp(name, email, password) {
    if (!this.apiEnabled) {
      throw new Error("We couldn't reach the server. Please try again in a moment.");
    }
    const result = await window.BSAPI.post("/auth/signup/", {
      name,
      email,
      password,
    });
    if (result.verify_url) {
      sessionStorage.setItem(
        "barwaaqo_pending_verify",
        JSON.stringify({ email: result.email, verifyUrl: result.verify_url })
      );
    }
    return { email: result.email, verifyUrl: result.verify_url };
  },

  async signIn(email, password) {
    if (!this.apiEnabled) {
      throw new Error("We couldn't reach the server. Please try again in a moment.");
    }
    const result = await window.BSAPI.post("/auth/login/", { email, password });
    window.BSAPI.setToken(result.access);
    this.user = {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.name,
      emailVerified: result.user.emailVerified,
      role: result.user.role || "student",
      avatarUrl: result.user.avatarUrl || null,
      learningPath: result.user.learningPath || "coding",
      createdAt: result.user.dateJoined || null,
    };
    this._updateNav();
    await window.BSProgress?.syncFromApi?.();
    return this.user;
  },

  async verifyEmail(email, token) {
    return this._postWithRetry("/auth/verify-email/", { email, token });
  },

  async resendVerification(email) {
    const result = await this._postWithRetry("/auth/resend-verification/", { email });
    return result.verify_url;
  },

  async _postWithRetry(path, body, attempts = 5) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      await this.recheckApi();
      if (!this.apiEnabled) {
        lastError = new Error("We couldn't reach the server. Please try again in a moment.");
        await new Promise((r) => setTimeout(r, 500 + i * 400));
        continue;
      }
      try {
        return await window.BSAPI.post(path, body);
      } catch (e) {
        lastError = e;
        if (e.status && e.status < 500) throw e;
        await new Promise((r) => setTimeout(r, 500 + i * 400));
      }
    }
    throw lastError || new Error("We couldn't reach the server. Please try again in a moment.");
  },

  signOut() {
    this.user = null;
    window.BSAPI?.setToken(null);
    window.BSProgress?.clear?.();
    this._updateNav();
    window.location.href = "index.html";
  },

  _updateNav() {
    const verified = this.isLoggedIn() && this.isVerified();
    const isAdmin = this.isAdmin();
    document.querySelectorAll("[data-auth='guest']").forEach((el) => {
      el.style.display = verified ? "none" : "";
    });
    document.querySelectorAll("[data-auth='user']").forEach((el) => {
      el.style.display = verified ? "" : "none";
    });
    document.querySelectorAll("[data-auth='admin']").forEach((el) => {
      el.style.display = verified && isAdmin ? "" : "none";
    });
    const nameEl = document.querySelector("[data-user-name]");
    if (nameEl && this.user) nameEl.textContent = this.user.name.split(" ")[0];

    const initials = (this.user?.name || "?")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    document.querySelectorAll("[data-user-initials]").forEach((el) => {
      if (el.classList.contains("profile-hero-avatar")) return;

      const url = this.user?.avatarUrl;
      const parent = el.closest(".dash-user, .dash-account-avatar");
      if (url && parent) {
        el.innerHTML = `<img src="${url}" alt="" class="dash-user-photo">`;
        parent.classList.add("has-photo");
      } else {
        el.textContent = initials;
        parent?.classList.remove("has-photo");
      }
    });

    window.BSNav?.applyPublicNav?.();
    window.BSSiteFooter?.mount?.();
    window.BSSharshabeel?.refresh?.();

    const page = document.body?.dataset?.page;
    if (page && window.BSAppShell?.mountSidebar) {
      const shellPages = { dashboard: "dashboard", profile: "profile", lms: "admin", admin: "admin" };
      if (shellPages[page]) {
        const sidebarPage = this.isAdmin() && (page === "profile" || page === "admin" || page === "lms")
          ? "admin"
          : shellPages[page];
        window.BSAppShell.mountSidebar(sidebarPage);
      }
    }
  },

  getCourseUrl(courseId) {
    if (window.BSNav?.courseUrl) return window.BSNav.courseUrl(courseId);
    if (this.isLoggedIn() && this.isVerified()) {
      return `course-learn.html?id=${courseId}`;
    }
    return `course-preview.html?id=${courseId}`;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  window.BSAuth.init();
});
