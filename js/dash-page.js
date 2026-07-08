/** Dashboard & profile — scroll reveals and page motion */
window.BSDashPage = {
  _io: null,
  _booted: false,

  observeReveals() {
    const els = document.querySelectorAll(
      ".bs-reveal:not(.bs-revealed), .bs-reveal-scale:not(.bs-revealed), .bs-reveal-left:not(.bs-revealed)"
    );
    if (!els.length) return;

    if (!this._io) {
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("bs-revealed");
              this._io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
      );
    }

    els.forEach((el) => this._io.observe(el));
  },

  observeActivityCells() {
    const cells = document.querySelectorAll(".dash-activity-cell:not(.cell-seen)");
    if (!cells.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("cell-seen");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cells.forEach((cell) => io.observe(cell));
  },

  boot() {
    if (this._booted) return;
    this._booted = true;
    const page = document.body.dataset.page;
    document.body.classList.add("bs-loaded", "dash-page-ready");
    if (page === "dashboard") document.body.classList.add("dashboard-page-ready");
    if (page === "profile") document.body.classList.add("profile-page-ready");
    this.observeReveals();
    this.observeActivityCells();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("dash-animated")) {
    window.BSDashPage.boot();
  }
});

if (document.readyState !== "loading" && document.body.classList.contains("dash-animated")) {
  window.BSDashPage.boot();
}

document.addEventListener("dashboard:rendered", () => {
  window.BSDashPage?.observeReveals?.();
  window.BSDashPage?.observeActivityCells?.();
});
