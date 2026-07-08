/** Profile — learner account or admin account */
(function () {
  const form = document.getElementById("profileForm");
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const saveBtn = document.getElementById("profileSaveBtn");
  const coursesList = document.getElementById("activeCoursesList");
  const adminForm = document.getElementById("adminProfileForm");

  function isAdminProfile() {
    return window.BSAuth?.isAdmin?.();
  }

  function setAdminProfileMode(on) {
    document.body.classList.toggle("profile-page--admin", on);
    document.querySelectorAll("[data-learner-only]").forEach((el) => {
      el.classList.toggle("hidden", on);
    });
    document.getElementById("profileTopbarLearner")?.classList.toggle("hidden", on);
    document.getElementById("profileTopbarAdmin")?.classList.toggle("hidden", !on);
    document.getElementById("profileHeroLearner")?.classList.toggle("hidden", on);
    document.getElementById("profileHeroAdmin")?.classList.toggle("hidden", !on);
    document.getElementById("profileAdminGrid")?.classList.toggle("hidden", !on);

    if (on) {
      document.title = "Admin account — Barwaaqo Skills";
      const slot = document.getElementById("dashUserSlotAdmin");
      if (slot && window.BSAppShell) {
        slot.innerHTML = window.BSAppShell.userChipHtml({ href: "profile.html", title: "Admin account" });
        window.BSAuth?._updateNav?.();
      }
      document.body.classList.add("admin-page-ready");
    }
  }

  function formatMemberDate(iso) {
    const d = iso ? new Date(iso) : null;
    if (!d || Number.isNaN(d.getTime())) return "—";
    return `Member since ${d.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
  }

  function renderAdminProfile() {
    const user = window.BSAuth?.user;
    if (!user) return;

    setAdminProfileMode(true);

    const nameEl = document.getElementById("adminProfileName");
    const emailEl = document.getElementById("adminProfileEmail");
    const nameField = document.getElementById("adminProfileNameInput");
    const emailField = document.getElementById("adminProfileEmailInput");

    if (nameEl) nameEl.textContent = user.name || "Administrator";
    if (emailEl) emailEl.textContent = user.email || "";
    if (nameField) nameField.value = user.name || "";
    if (emailField) emailField.value = user.email || "";

    window.BSAvatar?.applyAvatar?.(user);

    document.getElementById("dashMenuBtnAdmin")?.addEventListener("click", () => {
      document.getElementById("dashMenuBtn")?.click();
    });
  }

  function renderStats() {
    const el = document.getElementById("profileStats");
    if (!el || !window.BSProgress || isAdminProfile()) return;
    const s = window.BSProgress.getStats();
    const enrolled = window.BSProgress.getEnrolled().length;
    const items = [
      { icon: "fa-bolt", label: "Total XP", value: s.xp ?? 0 },
      { icon: "fa-fire", label: "Day streak", value: s.streak ?? 0 },
      { icon: "fa-clock", label: "Hours learned", value: s.hours ?? 0 },
      { icon: "fa-book-open", label: "Active courses", value: `${enrolled}/${s.slots || 3}` },
    ];
    el.innerHTML = items
      .map(
        (item, i) => `
      <div class="profile-stat-card bs-fade-in-up" style="--reveal-delay:${i * 0.06}s">
        <span class="profile-stat-card-icon"><i class="fa-solid ${item.icon}"></i></span>
        <div>
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </div>
      </div>`
      )
      .join("");
    window.BSDashPage?.observeReveals?.();
  }

  function renderAccountMeta() {
    const user = window.BSAuth?.user;
    if (!user || isAdminProfile()) return;

    const displayName = document.getElementById("profileDisplayName");
    const displayEmail = document.getElementById("profileDisplayEmail");
    if (displayName) displayName.textContent = user.name || "Learner";
    if (displayEmail) displayEmail.textContent = user.email || "";

    const sinceEl = document.getElementById("memberSince");
    if (sinceEl) sinceEl.textContent = formatMemberDate(user.createdAt);

    const slots = window.BSProgress?.slotsUsed?.() ?? 0;
    const max = window.BSProgress?.MAX_ENROLLED ?? 3;
    const slotsEl = document.getElementById("profileSlots");
    if (slotsEl) slotsEl.textContent = `${slots}/${max} slots`;
  }

  async function renderActiveCourses() {
    if (!coursesList || isAdminProfile()) return;
  await window.BSProgress?.syncFromApi?.();
    const active = window.BSProgress.getActiveEnrolled();

    if (!active.length) {
      coursesList.innerHTML = `
        <div class="profile-empty-courses profile-empty-courses--wide">
          <i class="fa-solid fa-compass"></i>
          <p>No active courses yet.</p>
          <span>Browse the catalog and enroll in up to 3 courses.</span>
        </div>`;
      window.BSDashPage?.observeReveals?.();
      return;
    }

    coursesList.innerHTML = active
      .map((id, i) => {
        const course = window.getCourseById(id);
        if (!course) return "";
        const pct = window.BSProgress.getLessonProgress(course);
        const done = window.BSProgress.getCompletedLessons(id).length;
        const total = course.lessons.length;
        const thumb = window.youtubeThumb?.(course.thumbnailVideoId) || "";

        return `
        <article class="profile-course-card profile-course-card--tile bs-reveal-scale" style="--reveal-delay:${i * 0.08}s">
          <div class="profile-course-card-thumb">
            <img src="${thumb}" alt="${course.title}">
            <span class="profile-course-card-pct">${pct}%</span>
          </div>
          <div class="profile-course-card-body">
            <span class="dash-tag dash-tag--navy">${course.category}</span>
            <strong>${course.title}</strong>
            <span class="profile-course-card-meta">${done}/${total} lessons · ${course.durationLabel}</span>
            <div class="dash-progress profile-course-progress">
              <div class="dash-progress-fill dash-progress-fill--accent" style="width:${pct}%"></div>
            </div>
            <a href="${window.BSProgress.getResumeUrl(id)}" class="btn btn-yellow btn-sm profile-resume-btn"><i class="fa-solid fa-play"></i> Resume</a>
          </div>
        </article>`;
      })
      .join("");

    window.BSDashPage?.observeReveals?.();
  }

  function renderCertificates() {
    const el = document.getElementById("profileCertificatesList");
    if (!el || isAdminProfile()) return;
    const certs = window.BSProgress?.getCertificates?.() || [];
    if (!certs.length) {
      el.innerHTML = `<p class="profile-empty-courses profile-empty-courses--wide"><i class="fa-solid fa-award"></i> Complete a course to earn your first certificate.</p>`;
      return;
    }
    el.innerHTML = `<div class="cert-grid">${certs
      .map(
        (c) => `
      <article class="cert-card">
        <div>
          <h3>${c.courseTitle}</h3>
          <p>Issued ${new Date(c.issuedAt).toLocaleDateString()}</p>
        </div>
        <a href="certificate.html?id=${c.id}" class="btn btn-outline-navy btn-sm">View</a>
      </article>`
      )
      .join("")}</div>`;
  }

  function loadProfile() {
  const user = window.BSAuth?.user;
  if (!user) return;

    if (isAdminProfile()) {
      renderAdminProfile();
      return;
    }

    setAdminProfileMode(false);
    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";

    renderAccountMeta();
    renderStats();
    renderActiveCourses();
    renderCertificates();
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput?.value?.trim();
    if (!name) {
      window.showToast?.("Please enter your name.", "info");
      return;
    }
    saveBtn.disabled = true;
    try {
      const me = await window.BSAPI.patch("/auth/me/", { name });
      window.BSAuth.user = {
        ...window.BSAuth.user,
        name: me.name,
        email: me.email,
        avatarUrl: me.avatarUrl || null,
      };
      window.BSAuth._updateNav?.();
      document.getElementById("profileDisplayName").textContent = me.name;
      window.showToast?.("Profile updated.");
    } catch (err) {
      window.showToast?.(err.message || "Could not save profile.", "info");
    } finally {
      saveBtn.disabled = false;
    }
  });

  adminForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("adminProfileNameInput")?.value?.trim();
    if (!name) return;
    try {
      const me = await window.BSAPI.patch("/auth/me/", { name });
      window.BSAuth.user = { ...window.BSAuth.user, name: me.name, avatarUrl: me.avatarUrl || null };
      window.BSAuth._updateNav?.();
      window.BSAvatar?.applyAvatar?.(window.BSAuth.user);
      document.getElementById("adminProfileName").textContent = me.name;
      window.showToast?.("Account updated.");
    } catch (err) {
      window.showToast?.(err.message || "Could not save.", "info");
    }
  });

document.addEventListener("auth:ready", loadProfile);
  document.addEventListener("courses:ready", () => {
    if (!isAdminProfile()) loadProfile();
  });
  document.addEventListener("progress:updated", () => {
    if (!isAdminProfile()) {
      renderStats();
      renderCertificates();
    }
  });
if (window.__authGuardPassed) loadProfile();
})();
