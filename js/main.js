// Mobile menu
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("bs-loaded");
});

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => nav?.classList.remove("open"));
});

// Active nav on scroll (homepage only)
if (document.getElementById("home")) {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav a[href^='#']");

  window.addEventListener("scroll", () => {
    let current = "home";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 140) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}
