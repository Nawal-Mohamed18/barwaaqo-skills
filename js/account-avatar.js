/** Profile photo upload on dashboard */
(function () {
  const input = document.getElementById("avatarInput");
  const avatarEl = document.getElementById("accountAvatar");
  const removeBtn = document.getElementById("avatarRemoveBtn");
  const nameEl = document.getElementById("accountName");
  const emailEl = document.getElementById("accountEmail");

  function applyAvatar(user) {
    if (!avatarEl) return;
    const url = user?.avatarUrl;
    if (url) {
      avatarEl.innerHTML = `<img src="${url}" alt="" class="profile-hero-avatar-img">`;
      avatarEl.classList.add("dash-account-avatar--photo", "profile-hero-avatar--photo");
      removeBtn?.classList.remove("hidden");
    } else {
      const initials = (user?.name || "?")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      avatarEl.textContent = initials;
      avatarEl.classList.remove("dash-account-avatar--photo", "profile-hero-avatar--photo");
      removeBtn?.classList.add("hidden");
    }
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

  input?.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.showToast?.("Image must be under 2 MB.", "info");
      input.value = "";
      return;
    }
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const me = await window.BSAPI.upload("/auth/me/avatar/", fd);
      window.BSAuth.user = { ...window.BSAuth.user, avatarUrl: me.avatarUrl || null };
      applyAvatar(window.BSAuth.user);
      window.showToast?.("Profile photo updated.");
    } catch (e) {
      window.showToast?.(e.message || "Upload failed.", "info");
    }
    input.value = "";
  });

  removeBtn?.addEventListener("click", async () => {
    if (!confirm("Remove your profile photo?")) return;
    try {
      const me = await window.BSAPI.delete("/auth/me/avatar/");
      window.BSAuth.user = { ...window.BSAuth.user, avatarUrl: me.avatarUrl || null };
      applyAvatar(window.BSAuth.user);
      window.showToast?.("Profile photo removed.");
    } catch (e) {
      window.showToast?.(e.message || "Could not remove photo.", "info");
    }
  });

  document.addEventListener("auth:ready", () => {
    loadAccount();
    refreshMe();
  });
  if (window.__authGuardPassed) {
    loadAccount();
    refreshMe();
  }
})();
