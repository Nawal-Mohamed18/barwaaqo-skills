/** Production URLs — update GITHUB_USER if your GitHub username differs */
(function () {
  const GITHUB_USER = "bintmohamed417";
  const REPO = "barwaaqo-skills";

  window.BSDeploy = {
    GITHUB_REPO: `https://github.com/${GITHUB_USER}/${REPO}`,
    LIVE_SITE: `https://${GITHUB_USER}.github.io/${REPO}/`,
    API_BASE: "https://barwaaqo-skills-api.onrender.com/api",
  };
})();
