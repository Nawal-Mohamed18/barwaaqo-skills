/** Send platform admins to the admin control center instead of learner pages. */
(function () {
  const ADMIN_HOME = "lms.html";
  const LEARNER_ONLY = new Set(["dashboard.html", "my-courses.html"]);

  function pageName() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function redirectAdminHome() {
    const page = pageName();
    if (!LEARNER_ONLY.has(page)) return;
    if (!window.BSAuth?.isLoggedIn?.() || !window.BSAuth?.isVerified?.()) return;
    if (!window.BSAuth?.isAdmin?.()) return;
    window.location.replace(ADMIN_HOME);
  }

  if (window.BSAuth?.ready) redirectAdminHome();
  else window.BSAuth?.onReady?.(redirectAdminHome);
})();
