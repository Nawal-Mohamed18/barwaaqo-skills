const grid = document.getElementById("catalogGrid");
const filtersEl = document.getElementById("catalogFilters");
const searchInput = document.getElementById("catalogSearch");

const CATEGORIES = ["All", "Coding", "Design", "Business", "Personal"];
let activeCategory = "All";
let searchQuery = "";

function normalizeQuery(q) {
  return (q || "").trim().toLowerCase();
}

function matchesSearch(course, q) {
  if (!q) return true;
  const haystack = [course.title, course.category, course.instructor, course.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function buildFilters() {
  if (!filtersEl) return;
  filtersEl.innerHTML = CATEGORIES.map(
    (c, i) =>
      `<button type="button" class="filter-btn${c === activeCategory ? " active" : ""}" data-category="${c}" style="--filter-delay:${i * 0.04}s">${c}</button>`
  ).join("");
  filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtersEl.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      renderCatalog();
    });
  });
  document.dispatchEvent(new CustomEvent("catalog:filters-built"));
}

window.renderCatalog = function renderCatalog() {
  const courses = window.BARWAAQO_COURSES || [];
  const q = normalizeQuery(searchQuery);

  const filtered = courses.filter((course) => {
    const matchCategory =
      activeCategory === "All" ? true : course.category === activeCategory;
    return matchCategory && matchesSearch(course, q);
  });

  if (!grid) return;

  if (!courses.length) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading courses…</p>
      </div>`;
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty catalog-empty--search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>${q ? `No courses match “${searchQuery.trim()}”.` : "No courses in this category."}</p>
      </div>`;
    return;
  }

  grid.classList.add("catalog-grid--refresh");
  grid.innerHTML = filtered
    .map((c, i) => {
      const card = window.renderCourseCard(c);
      return card.replace("<article", `<article style="--card-delay:${i * 0.05}s"`);
    })
    .join("");
  requestAnimationFrame(() => {
    grid.classList.remove("catalog-grid--refresh");
    document.dispatchEvent(new CustomEvent("catalog:rendered"));
  });
};

function bindSearch() {
  if (!searchInput) return;

  const params = new URLSearchParams(location.search);
  const initial = params.get("q");
  if (initial) {
    searchQuery = initial;
    searchInput.value = initial;
  }

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    renderCatalog();
  });

  searchInput.addEventListener("focus", () => {
    document.getElementById("catalogSearchWrap")?.classList.add("is-focused");
  });
  searchInput.addEventListener("blur", () => {
    document.getElementById("catalogSearchWrap")?.classList.remove("is-focused");
  });
}

async function initCatalog() {
  await window.BSProgress?.syncFromApi?.();
  buildFilters();
  bindSearch();
  renderCatalog();
}

document.addEventListener("courses:ready", initCatalog, { once: true });
document.addEventListener("auth:ready", initCatalog);
if (window.__coursesReady && window.__authGuardPassed) initCatalog();
