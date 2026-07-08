/** Homepage scroll reveals, counters, and header motion */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal(el) {
    el.classList.add("bs-revealed");
    if (el.dataset.count !== undefined) animateCounter(el);
    el.querySelectorAll("[data-count]").forEach(animateCounter);
  }

  function animateCounter(el) {
    const target = el.dataset.count;
    if (!target || target === "—" || el.dataset.counted) return;
    const num = parseInt(target.replace(/\D/g, ""), 10);
    if (Number.isNaN(num)) return;

    const suffix = target.replace(/[\d,]/g, "");
    const finalText = num.toLocaleString() + suffix;

    el.dataset.counted = "1";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(num * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = finalText;
    }

    if (reduceMotion) {
      el.textContent = finalText;
      return;
    }
    el.textContent = "0" + suffix;
    requestAnimationFrame(tick);
  }

  let observer;

  function observeElements() {
    if (!observer) return;
    document
      .querySelectorAll(
        ".bs-reveal:not(.bs-revealed), .bs-reveal-left:not(.bs-revealed), .bs-reveal-right:not(.bs-revealed), .bs-reveal-scale:not(.bs-revealed)"
      )
      .forEach((el) => observer.observe(el));
  }

  function initStaggerContainers() {
    document.querySelectorAll("[data-reveal-stagger]").forEach((container) => {
      const selector = container.dataset.revealStagger || ".bs-reveal-child";
      container.querySelectorAll(selector).forEach((child, i) => {
        if (!child.classList.contains("bs-reveal")) {
          child.classList.add("bs-reveal");
        }
        child.style.setProperty("--reveal-delay", `${i * 0.09}s`);
        observer?.observe(child);
      });
    });
  }

  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("header--scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initHeroPhoto() {
    const photo = document.querySelector(".hero-photo");
    if (!photo) return;
    if (reduceMotion) {
      photo.classList.add("bs-revealed");
      return;
    }
    setTimeout(() => photo.classList.add("bs-revealed"), 400);
  }

  function init() {
    if (reduceMotion) {
      document
        .querySelectorAll(".bs-reveal, .bs-reveal-left, .bs-reveal-right, .bs-reveal-scale, .hero-photo")
        .forEach(reveal);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    initStaggerContainers();
    observeElements();
    initHeaderScroll();
    initHeroPhoto();
  }

  window.BSHomeReveal = {
    refresh() {
      initStaggerContainers();
      observeElements();
      document.querySelectorAll(".course-card--static.bs-reveal").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          reveal(el);
          observer?.unobserve(el);
        }
      });
    },
    setStatCount(id, value) {
      const el = document.getElementById(id);
      if (!el) return;
      el.dataset.count = String(value);
      if (el.classList.contains("bs-revealed")) animateCounter(el);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
