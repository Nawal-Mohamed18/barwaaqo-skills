/** Dashboard theme toggle — light / dark */
window.BSTheme = {
  KEY: "barwaaqo_theme",

  get() {
    return localStorage.getItem(this.KEY) || "light";
  },

  apply(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(this.KEY, t);
    const icon = document.getElementById("shellThemeIcon");
    const label = document.getElementById("shellThemeLabel");
    if (icon) {
      icon.className = t === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    if (label) {
      label.textContent = t === "dark" ? "Light mode" : "Dark mode";
    }
  },

  toggle() {
    this.apply(this.get() === "dark" ? "light" : "dark");
  },

  bindToggle(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn || btn.dataset.themeBound) return;
    btn.dataset.themeBound = "1";
    btn.addEventListener("click", () => this.toggle());
    this.apply(this.get());
  },

  init() {
    this.apply(this.get());
    this.bindToggle("shellThemeToggle");
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => BSTheme.init());
} else {
  BSTheme.init();
}
