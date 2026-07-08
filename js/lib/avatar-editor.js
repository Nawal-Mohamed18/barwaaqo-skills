/** Crop & zoom editor before profile photo upload */
window.BSAvatarEditor = {
  _els: null,
  _img: null,
  _scale: 1,
  _minScale: 1,
  _offsetX: 0,
  _offsetY: 0,
  _dragging: false,
  _dragStart: null,
  _resolve: null,
  _reject: null,

  _ensureModal() {
    if (this._els) return;

    const overlay = document.createElement("div");
    overlay.className = "avatar-editor-overlay";
    overlay.id = "avatarEditorOverlay";
    overlay.innerHTML = `
      <div class="avatar-editor-modal" role="dialog" aria-labelledby="avatarEditorTitle">
        <header class="avatar-editor-head">
          <h3 id="avatarEditorTitle">Edit profile photo</h3>
          <button type="button" class="avatar-editor-close" id="avatarEditorClose" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="avatar-editor-stage-wrap">
          <div class="avatar-editor-stage" id="avatarEditorStage">
            <img id="avatarEditorImage" alt="Crop preview">
          </div>
        </div>
        <div class="avatar-editor-controls">
          <div class="avatar-editor-control">
            <label for="avatarEditorZoom">Zoom <span id="avatarEditorZoomVal">100%</span></label>
            <input type="range" id="avatarEditorZoom" min="100" max="300" value="100">
          </div>
          <p class="avatar-editor-hint">Drag to reposition · Use zoom to resize</p>
        </div>
        <footer class="avatar-editor-actions">
          <button type="button" class="btn btn-outline-navy" id="avatarEditorCancel">Cancel</button>
          <button type="button" class="btn btn-yellow" id="avatarEditorSave">Save photo</button>
        </footer>
      </div>`;
    document.body.appendChild(overlay);

    this._els = {
      overlay,
      stage: overlay.querySelector("#avatarEditorStage"),
      image: overlay.querySelector("#avatarEditorImage"),
      zoom: overlay.querySelector("#avatarEditorZoom"),
      zoomVal: overlay.querySelector("#avatarEditorZoomVal"),
      cancel: overlay.querySelector("#avatarEditorCancel"),
      save: overlay.querySelector("#avatarEditorSave"),
      close: overlay.querySelector("#avatarEditorClose"),
    };

    this._els.zoom?.addEventListener("input", () => {
      this._scale = Number(this._els.zoom.value) / 100;
      if (this._els.zoomVal) this._els.zoomVal.textContent = `${this._els.zoom.value}%`;
      this._clampOffset();
      this._render();
    });

    this._els.cancel?.addEventListener("click", () => this._cancel());
    this._els.close?.addEventListener("click", () => this._cancel());
    this._els.save?.addEventListener("click", () => this._save());

    this._els.stage?.addEventListener("pointerdown", (e) => this._onDragStart(e));
    window.addEventListener("pointermove", (e) => this._onDragMove(e));
    window.addEventListener("pointerup", () => this._onDragEnd());
    window.addEventListener("pointercancel", () => this._onDragEnd());

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this._cancel();
    });
  },

  _cancel() {
    this._els?.overlay?.classList.remove("open");
    if (this._img?.src?.startsWith("blob:")) URL.revokeObjectURL(this._img.src);
    this._reject?.(new Error("cancelled"));
    this._resolve = null;
    this._reject = null;
  },

  _onDragStart(e) {
    if (!this._els?.stage) return;
    this._dragging = true;
    this._els.stage.classList.add("dragging");
    this._dragStart = { x: e.clientX - this._offsetX, y: e.clientY - this._offsetY };
    this._els.stage.setPointerCapture?.(e.pointerId);
  },

  _onDragMove(e) {
    if (!this._dragging || !this._dragStart) return;
    this._offsetX = e.clientX - this._dragStart.x;
    this._offsetY = e.clientY - this._dragStart.y;
    this._clampOffset();
    this._render();
  },

  _onDragEnd() {
    this._dragging = false;
    this._dragStart = null;
    this._els?.stage?.classList.remove("dragging");
  },

  _layout() {
    const img = this._img;
    const stage = 280;
    if (!img) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const cover = Math.max(stage / iw, stage / ih);
    this._minScale = cover;
    this._scale = Math.max(this._scale, cover);
    const maxZoom = cover * 3;
    if (this._els.zoom) {
      this._els.zoom.min = String(Math.round(cover * 100));
      this._els.zoom.max = String(Math.round(maxZoom * 100));
      this._els.zoom.value = String(Math.round(this._scale * 100));
      if (this._els.zoomVal) this._els.zoomVal.textContent = `${this._els.zoom.value}%`;
    }
    this._offsetX = 0;
    this._offsetY = 0;
    this._clampOffset();
    this._render();
  },

  _clampOffset() {
    const img = this._img;
    if (!img) return;
    const stage = 280;
    const w = img.naturalWidth * this._scale;
    const h = img.naturalHeight * this._scale;
    const maxX = Math.max(0, (w - stage) / 2);
    const maxY = Math.max(0, (h - stage) / 2);
    this._offsetX = Math.max(-maxX, Math.min(maxX, this._offsetX));
    this._offsetY = Math.max(-maxY, Math.min(maxY, this._offsetY));
  },

  _render() {
    const img = this._els?.image;
    if (!img || !this._img) return;
    const w = this._img.naturalWidth * this._scale;
    const h = this._img.naturalHeight * this._scale;
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.style.transform = `translate(calc(-50% + ${this._offsetX}px), calc(-50% + ${this._offsetY}px))`;
  },

  _computeCrop() {
    const stage = 280;
    const img = this._img;
    const w = img.naturalWidth * this._scale;
    const h = img.naturalHeight * this._scale;
    const left = stage / 2 - w / 2 + this._offsetX;
    const top = stage / 2 - h / 2 + this._offsetY;
    const srcX = Math.max(0, -left / this._scale);
    const srcY = Math.max(0, -top / this._scale);
    const srcSide = stage / this._scale;
    const sideNorm = srcSide / Math.min(img.naturalWidth, img.naturalHeight);
    return {
      x: srcX / img.naturalWidth,
      y: srcY / img.naturalHeight,
      size: Math.min(1, srcSide / Math.min(img.naturalWidth, img.naturalHeight)),
      cropX: srcX / img.naturalWidth,
      cropY: srcY / img.naturalHeight,
      cropSize: Math.min(1, sideNorm),
    };
  },

  async _save() {
    const img = this._img;
    if (!img) return;

    const stage = 280;
    const out = 512;
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");

    const w = img.naturalWidth * this._scale;
    const h = img.naturalHeight * this._scale;
    const left = stage / 2 - w / 2 + this._offsetX;
    const top = stage / 2 - h / 2 + this._offsetY;
    const srcX = Math.max(0, -left / this._scale);
    const srcY = Math.max(0, -top / this._scale);
    const srcSide = stage / this._scale;

    ctx.drawImage(img, srcX, srcY, srcSide, srcSide, 0, 0, out, out);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this._reject?.(new Error("Could not process image."));
          return;
        }
        const crop = this._computeCrop();
        this._els?.overlay?.classList.remove("open");
        if (this._img?.src?.startsWith("blob:")) URL.revokeObjectURL(this._img.src);
        this._resolve?.({ blob, crop });
        this._resolve = null;
        this._reject = null;
      },
      "image/jpeg",
      0.9
    );
  },

  open(file) {
    this._ensureModal();
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._scale = 1;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        this._img = img;
        this._els.image.src = url;
        this._layout();
        this._els.overlay.classList.add("open");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image."));
      };
      img.src = url;
    });
  },
};
