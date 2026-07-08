/**
 * Protect pages by access level.
 * data-require: guest | verified | admin
 */
(function () {
  const script = document.currentScript;
  const level = script?.dataset.require || "verified";

  function redirect(url) {
    window.location.replace(url);
  }

  function guard() {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || window.BSNav?.postLoginUrl?.() || "dashboard.html";
    const page = location.pathname.split("/").pop() || "index.html";

    if (level === "guest") {
      if (window.BSAuth.isLoggedIn() && window.BSAuth.isVerified()) {
        if (page === "index.html" && window.BSAuth.isAdmin()) {
          window.__authGuardPassed = true;
          document.dispatchEvent(new CustomEvent("auth:ready"));
          return;
        }
        const dest = window.BSAuth.isAdmin()
          ? "lms.html"
          : params.get("redirect") || window.BSNav?.postLoginUrl?.() || "dashboard.html";
        redirect(dest);
      }
      return;
    }

    if (!window.BSAuth.isLoggedIn()) {
      if (page === "course.html") {
        const id = params.get("id");
        redirect(id ? `course-preview.html?id=${id}` : "signup.html");
        return;
      }
      redirect(`signup.html?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (!window.BSAuth.isVerified()) {
      redirect(
        `verify-email.html?email=${encodeURIComponent(window.BSAuth.user.email)}&redirect=${encodeURIComponent(redirectTo)}`
      );
      return;
    }

    if (level === "admin" && !window.BSAuth.isAdmin()) {
      redirect("dashboard.html");
      return;
    }

    if (page === "dashboard.html" && window.BSAuth.isAdmin()) {
      redirect("lms.html");
      return;
    }

    if (page === "my-courses.html" && window.BSAuth.isAdmin()) {
      redirect("lms.html");
      return;
    }

    window.__authGuardPassed = true;
    document.dispatchEvent(new CustomEvent("auth:ready"));
  }

  if (window.BSAuth.ready) guard();
  else window.BSAuth.onReady(guard);
})();
