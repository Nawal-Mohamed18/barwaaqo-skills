/** API configuration — Django backend */
(function () {
  const deploy = window.BSDeploy || {
    GITHUB_REPO: "https://github.com/Nawal-Mohamed18/barwaaqo-skills",
    LIVE_SITE: "https://nawal-mohamed18.github.io/barwaaqo-skills/",
    API_BASE: "https://barwaaqo-skills-api.onrender.com/api",
  };

  function defaultApiBase() {
    return deploy.API_BASE || `${window.location.origin}/api`;
  }

  if (localStorage.getItem("barwaaqo_use_api") === "false") {
    localStorage.removeItem("barwaaqo_use_api");
  }

  window.BSConfig = {
    API_BASE: localStorage.getItem("barwaaqo_api_base") || defaultApiBase(),
    USE_API: true,
    DEPLOY: deploy,
  };

  (function trackPageVisit() {
    if (window.__bsVisitTracked) return;
    window.__bsVisitTracked = true;

    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (page === "design.html") return;

    const api = window.BSConfig.API_BASE.replace(/\/$/, "");
    const token = localStorage.getItem("barwaaqo_access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    let sessionKey = sessionStorage.getItem("bs_session");
    if (!sessionKey) {
      sessionKey = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("bs_session", sessionKey);
    }

    fetch(`${api}/learning/visits/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        pagePath: page + location.search,
        pageTitle: document.title,
        sessionKey,
        referrer: document.referrer || "",
      }),
      keepalive: true,
    }).catch(() => {});
  })();
})();
