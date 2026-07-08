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

  function avatarDisplayUrl(url) {
    if (!url) return null;
    if (url.includes("/media/avatars/") && window.BSAuth?.user?.uid) {
      const base = window.BSConfig?.API_BASE?.replace(/\/$/, "") || "";
      return `${base}/auth/avatars/${window.BSAuth.user.uid}/?v=${Date.now()}`;
    }
    return url;
  }

  function applyAvatarToEl(avatarEl, removeBtn, user) {
    const url = avatarDisplayUrl(user?.avatarUrl);
    if (url) {
      avatarEl.innerHTML = `<img src="${url}" alt="" class="profile-hero-avatar-img" referrerpolicy="no-referrer">`;
      avatarEl.classList.add("dash-account-avatar--photo", "profile-hero-avatar--photo");
      removeBtn?.classList.remove("hidden");
      const img = avatarEl.querySelector("img");
      img.onerror = () => {
        avatarEl.textContent = initialsFor(user);
        avatarEl.classList.remove("dash-account-avatar--photo", "profile-hero-avatar--photo");
        removeBtn?.classList.add("hidden");
      };
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

  async function uploadAvatar(file, crop) {
    const fd = new FormData();
    fd.append("avatar", file, "avatar.jpg");
    if (crop) {
      fd.append("cropX", String(crop.cropX ?? 0));
      fd.append("cropY", String(crop.cropY ?? 0));
      fd.append("cropSize", String(crop.cropSize ?? 1));
    }
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

  async function handleFilePick(file, input) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      window.showToast?.("Image must be under 5 MB.", "info");
      if (input) input.value = "";
      return;
    }
    try {
      if (window.BSAvatarEditor?.open) {
        const { blob, crop } = await window.BSAvatarEditor.open(file);
        await uploadAvatar(blob, crop);
      } else {
        await uploadAvatar(file);
      }
    } catch (e) {
      if (e.message !== "cancelled") {
        window.showToast?.(e.message || "Upload failed.", "info");
      }
    }
    if (input) input.value = "";
  }

  widgets.forEach(({ input, removeBtn }) => {
    input?.addEventListener("change", () => handleFilePick(input.files?.[0], input));

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

  window.BSAvatar = { applyAvatar, refreshMe, avatarDisplayUrl };
})();
