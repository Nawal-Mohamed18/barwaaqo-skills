/**
 * Load courses from Django API (falls back to static courses.js)
 */
window.loadCoursesFromApi = async function loadCoursesFromApi() {
  const staticFallback = window.__staticCourses || window.BARWAAQO_COURSES;

  function markReady() {
    window.enrichCourses?.();
    if (window.__coursesReady) return;
    window.__coursesReady = true;
    document.dispatchEvent(new CustomEvent("courses:ready"));
  }

  function notifyUpdated() {
    window.enrichCourses?.();
    document.dispatchEvent(new CustomEvent("courses:updated"));
  }

  // Show static catalog immediately so homepage featured cards are not blank
  markReady();

  if (window.BSConfig?.USE_API === false || !window.BSAPI) return;

  try {
    const data = await window.BSAPI.get("/courses/");
    if (Array.isArray(data) && data.length) {
      window.BARWAAQO_COURSES = data;
      window.__coursesFromApi = true;
      notifyUpdated();
    }
  } catch (e) {
    console.warn("Using static course catalog (API unavailable)", e);
    if (staticFallback?.length) {
      window.BARWAAQO_COURSES = staticFallback;
      notifyUpdated();
    }
  }
};

function bootCourses() {
  if (window.__coursesReady) return;

  if (window.BARWAAQO_COURSES?.length) {
    window.__staticCourses = window.BARWAAQO_COURSES.slice();
    window.loadCoursesFromApi();
    return;
  }

  window.__coursesReady = true;
  document.dispatchEvent(new CustomEvent("courses:ready"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootCourses);
} else {
  bootCourses();
}
