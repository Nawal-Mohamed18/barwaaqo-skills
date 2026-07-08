/** Back control on auth pages — uses browser history when possible */
(function () {
  document.querySelectorAll("[data-auth-back]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const fallback = el.dataset.fallback || "index.html";
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = fallback;
      }
    });
  });
})();
