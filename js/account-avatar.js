/** Profile photo upload — learner and admin profiles */
(function () {
  const widgets = [
    {
      input: document.getElementById("avatarInput"),
      avatarEl: document.getElementById("accountAvatar"),
      removeBtn: document.getElementById("avatarRemoveBtn"),
    },
    {
      input: document.getElementById("adminAvatarInput"),
      avatarEl: document.getElementById("adminAccountAvatar"),
      removeBtn: document.getElementById("adminAvatarRemoveBtn"),
    },
  ].filter((w) => w.avatarEl);

  const nameEl = document.getElementById("accountName");
  const emailEl = document.getElementById("accountEmail");

  function initialsFor(user) {
    return (user?.name || "?")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function applyAvatarToEl(avatarEl, removeBtn, user) {
    const url = user?.avatarUrl;
    if (url) {
      avatarEl.innerHTML = `<img src="${url}" alt="" class="profile-hero-avatar-img">`;
      avatarEl.classList.add("dash-account-avatar--photo", "profile-hero-avatar--photo");
      removeBtn?.classList.remove("hidden");
    } else {
      avatarEl.textContent = initialsFor(user);
      avatarEl.classList.remove("dash-account-avatar--photo", "profile-hero-avatar--photo");
      removeBtn?.classList.add("hidden");
    }
  }

  function applyAvatar(user) {
    widgets.forEach(({ avatarEl, removeBtn }) => applyAvatarToEl(avatarEl, removeBtn, user));
    window.BSAuth?._updateNav?.();
  }

  function loadAccount() {
    const user = window.BSAuth?.user;
    if (!user) return;
    if (nameEl) nameEl.textContent = user.name || "Student";
    if (emailEl) emailEl.textContent = user.email || "";
    applyAvatar(user);
  }

  async function refreshMe() {
    if (!window.BSAuth?.apiEnabled) return;
    try {
      const me = await window.BSAPI.get("/auth/me/");
      window.BSAuth.user = {
        ...window.BSAuth.user,
        name: me.name,
        email: me.email,
        avatarUrl: me.avatarUrl || null,
        role: me.role,
      };
      applyAvatar(window.BSAuth.user);
    } catch (e) {
      console.warn("Could not refresh profile", e);
    }
  }

  async function uploadAvatar(file) {
    const fd = new FormData();
    fd.append("avatar", file);
    const me = await window.BSAPI.upload("/auth/me/avatar/", fd);
    window.BSAuth.user = { ...window.BSAuth.user, avatarUrl: me.avatarUrl || null };
    applyAvatar(window.BSAuth.user);
    window.showToast?.("Profile photo updated.");
  }

  async function removeAvatar() {
    const me = await window.BSAPI.delete("/auth/me/avatar/");
    window.BSAuth.user = { ...window.BSAuth.user, avatarUrl: me.avatarUrl || null };
    applyAvatar(window.BSAuth.user);
    window.showToast?.("Profile photo removed.");
  }

  widgets.forEach(({ input, removeBtn }) => {
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        window.showToast?.("Image must be under 2 MB.", "info");
        input.value = "";
        return;
      }
      try {
        await uploadAvatar(file);
      } catch (e) {
        window.showToast?.(e.message || "Upload failed.", "info");
      }
      input.value = "";
    });

    removeBtn?.addEventListener("click", async () => {
      if (!confirm("Remove your profile photo?")) return;
      try {
        await removeAvatar();
      } catch (e) {
        window.showToast?.(e.message || "Could not remove photo.", "info");
      }
    });
  });

  document.addEventListener("auth:ready", () => {
    loadAccount();
    refreshMe();
  });
  if (window.__authGuardPassed) {
    loadAccount();
    refreshMe();
  }

  window.BSAvatar = { applyAvatar, refreshMe };
})();
