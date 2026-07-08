/** API configuration — Django backend */
(function () {
  const host = window.location.hostname || "127.0.0.1";
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  const deploy = window.BSDeploy || {
    GITHUB_REPO: "https://github.com/bintmohamed417/barwaaqo-skills",
    LIVE_SITE: "https://bintmohamed417.github.io/barwaaqo-skills/",
    API_BASE: "https://barwaaqo-skills-api.onrender.com/api",
  };

  function defaultApiBase() {
    if (isLocal) return `http://${host || "127.0.0.1"}:8765/api`;
    if (host.endsWith(".github.io") && deploy.API_BASE) return deploy.API_BASE;
    return `${window.location.origin}/api`;
  }

  // Ignore stale "use_api=false" from older sessions — auth requires the API
  if (localStorage.getItem("barwaaqo_use_api") === "false") {
    localStorage.removeItem("barwaaqo_use_api");
  }

  window.BSConfig = {
    API_BASE: localStorage.getItem("barwaaqo_api_base") || defaultApiBase(),
    USE_API: true,
    DEPLOY: deploy,
  };
})();
