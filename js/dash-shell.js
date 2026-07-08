/** Mobile sidebar + search — shared across app pages */
(function () {
  const overlay = document.getElementById("dashOverlay");
  const menuBtn = document.getElementById("dashMenuBtn");

  function sidebar() {
    return document.getElementById("dashSidebar");
  }

  function closeSidebar() {
    sidebar()?.classList.remove("open");
    overlay?.classList.remove("open");
  }

  menuBtn?.addEventListener("click", () => {
    sidebar()?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });

  overlay?.addEventListener("click", closeSidebar);

  document.addEventListener("click", (e) => {
    if (e.target.closest(".dash-sidebar .dash-nav a") && window.innerWidth <= 768) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeSidebar();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("bs-loaded");
  });
})();
