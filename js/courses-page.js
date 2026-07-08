/** Courses page — motion & scroll reveals */
(function () {
  let revealObserver = null;

  function revealInView() {
    document.querySelectorAll(".bs-reveal:not(.bs-revealed)").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("bs-revealed");
      }
    });
  }

  function revealOnScroll() {
    const els = document.querySelectorAll(
      ".bs-reveal:not(.bs-revealed), .bs-reveal-scale:not(.bs-revealed), .bs-fade-in-up:not(.bs-revealed)"
    );
    if (!els.length) return;

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("bs-revealed");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
      );
    }

    els.forEach((el) => revealObserver.observe(el));
    revealInView();
  }

  function observeCards() {
    const cards = document.querySelectorAll(".catalog-grid .course-card:not(.card-seen)");
    if (!cards.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("card-seen");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -16px 0px" }
    );
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.classList.add("card-seen");
      } else {
        io.observe(card);
      }
    });
  }

  function animateFilters() {
    const filters = document.getElementById("catalogFilters");
    if (!filters) return;
    filters.classList.add("filters-refresh");
    requestAnimationFrame(() => {
      filters.classList.remove("filters-refresh");
    });
  }

  function boot() {
    if (boot.done) return;
    boot.done = true;
    document.body.classList.add("bs-loaded", "courses-page-ready");
    revealOnScroll();
    observeCards();
    window.BSNav?.applyPublicNav?.();
  }
  boot.done = false;

  document.addEventListener("catalog:rendered", () => {
    observeCards();
    revealOnScroll();
  });

  document.addEventListener("catalog:filters-built", animateFilters);

  document.addEventListener("courses:ready", boot);
  document.addEventListener("auth:ready", () => window.BSNav?.applyPublicNav?.());

  if (window.__coursesReady) boot();
})();
