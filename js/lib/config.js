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
})();
