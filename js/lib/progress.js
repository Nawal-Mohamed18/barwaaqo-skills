/** Per-user learner progress — synced with Django API */
window.BSProgress = {
  MAX_ENROLLED: 3,
  _enrolled: [],
  _completed: [],
  _last: null,
  _progress: {},
  _lessonWatches: {},
  _watchSaveTimers: {},
  _stats: null,
  _activity: [],
  _certificates: [],
  _synced: false,

  clear() {
    this._enrolled = [];
    this._completed = [];
    this._last = null;
    this._progress = {};
    this._lessonWatches = {};
    this._watchSaveTimers = {};
    this._stats = null;
    this._activity = [];
    this._certificates = [];
    this._synced = false;
  },

  parseDurationSeconds(str) {
    if (!str) return 300;
    const parts = String(str).split(":").map((n) => parseInt(n, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 300;
  },

  _applyLessonWatches(courseId, lessonWatches) {
    if (!lessonWatches) return;
    if (!this._lessonWatches[courseId]) this._lessonWatches[courseId] = {};
    Object.entries(lessonWatches).forEach(([lessonId, seconds]) => {
      this._lessonWatches[courseId][Number(lessonId)] = Number(seconds) || 0;
    });
  },

  _computePercent(course) {
    const lessons = course.lessons || [];
    if (!lessons.length) {
      return this.getCourseProgress(course.id).percent || 0;
    }

    const totalSeconds =
      lessons.reduce((sum, lesson) => sum + this.parseDurationSeconds(lesson.duration), 0) || 1;
    const completed = new Set(this.getCompletedLessons(course.id));
    const watches = this._lessonWatches[course.id] || {};
    let watchedSeconds = 0;

    lessons.forEach((lesson) => {
      const lessonSeconds = this.parseDurationSeconds(lesson.duration);
      if (completed.has(lesson.id)) {
        watchedSeconds += lessonSeconds;
      } else if (watches[lesson.id]) {
        watchedSeconds += Math.min(watches[lesson.id], lessonSeconds);
      }
    });

    return Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100));
  },

  async syncFromApi() {
    if (!window.BSAuth?.isLoggedIn?.() || !window.BSAuth?.isVerified?.() || !window.BSAuth?.apiEnabled) {
      return;
    }
    try {
      const state = await window.BSAPI.get("/learning/state/");
      this._enrolled = state.enrolled || [];
      this._completed = state.completed || [];
      this._last = state.last || null;
      this._progress = state.progress || {};
      Object.entries(this._progress).forEach(([courseId, prog]) => {
        this._applyLessonWatches(courseId, prog.lessonWatches);
      });
      this._stats = state.stats || null;
      this._activity = state.activity || [];
      this._certificates = state.certificates || [];
      this._synced = true;
      document.dispatchEvent(new CustomEvent("progress:updated"));
    } catch (e) {
      console.warn("Progress sync failed", e);
    }
  },

  getLast() {
    return this._last;
  },

  getCourseProgress(courseId) {
    return this._progress[courseId] || { completedLessons: [], totalLessons: 0, percent: 0 };
  },

  getCompletedLessons(courseId) {
    return [...(this.getCourseProgress(courseId).completedLessons || [])];
  },

  isLessonComplete(courseId, lessonId) {
    return this.getCompletedLessons(courseId).includes(Number(lessonId));
  },

  async saveLast(courseId, lessonId) {
    this._last = { courseId, lessonId, updatedAt: Date.now() };
    if (window.BSAuth?.apiEnabled && window.BSAuth?.isVerified?.()) {
      try {
        const res = await window.BSAPI.post("/learning/last/", {
          course_id: courseId,
          lesson_id: lessonId,
        });
        if (res.progress) {
          this._progress[courseId] = res.progress;
          this._applyLessonWatches(courseId, res.progress.lessonWatches);
        }
      } catch (e) {
        console.warn("saveLast failed", e);
        throw e;
      }
    }
  },

  async completeLesson(courseId, lessonId) {
    const id = Number(lessonId);
    if (window.BSAuth?.apiEnabled && window.BSAuth?.isVerified?.()) {
      try {
        const res = await window.BSAPI.post("/learning/lesson-complete/", {
          course_id: courseId,
          lesson_id: id,
        });
        if (res.progress) {
          this._progress[courseId] = res.progress;
          this._applyLessonWatches(courseId, res.progress.lessonWatches);
        }
        if (res.completed && !this._completed.includes(courseId)) {
          this._completed.push(courseId);
        }
        if (res.stats) {
          this._stats = res.stats;
        }
        if (res.activity) {
          this._activity = res.activity;
        }
        this._last = { courseId, lessonId: id, updatedAt: Date.now() };
        await this.syncFromApi();
        return res;
      } catch (e) {
        console.warn("completeLesson failed", e);
        throw e;
      }
    }
    return { ok: false, error: "api", message: "Sign in to save lesson progress." };
  },

  getEnrolled() {
    return [...this._enrolled];
  },

  getActiveEnrolled() {
    return this.getEnrolled().filter((id) => !this.getCompleted().includes(id));
  },

  slotsUsed() {
    return this.getActiveEnrolled().length;
  },

  slotsRemaining() {
    return Math.max(0, this.MAX_ENROLLED - this.slotsUsed());
  },

  hasAccess() {
    return window.BSAuth?.isLoggedIn?.() && window.BSAuth?.isVerified?.();
  },

  canEnroll(courseId) {
    if (!window.BSAuth?.isLoggedIn?.()) {
      return { ok: false, error: "auth", message: "Please sign in to enroll." };
    }
    if (!window.BSAuth?.isVerified?.()) {
      return { ok: false, error: "verify", message: "Verify your email before enrolling." };
    }
    if (this.isEnrolled(courseId)) return { ok: true };
    if (this.slotsRemaining() <= 0) {
      return {
        ok: false,
        error: "limit",
        message: `You can only take ${this.MAX_ENROLLED} courses at a time. Finish or leave a course in My Courses to free a slot.`,
      };
    }
    return { ok: true };
  },

  isEnrolled(courseId) {
    return this._enrolled.includes(courseId);
  },

  async enroll(courseId) {
    const check = this.canEnroll(courseId);
    if (!check.ok) return check;

    if (window.BSAuth?.apiEnabled) {
      try {
        await window.BSAPI.post("/learning/enroll/", { course_id: courseId });
        if (!this._enrolled.includes(courseId)) {
          this._enrolled.push(courseId);
        }
        await this.syncFromApi();
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e.data?.error || "api",
          message: e.data?.message || e.message,
        };
      }
    }

    return { ok: false, error: "api", message: "Backend unavailable — sign in when the server is running." };
  },

  async unenroll(courseId) {
    if (window.BSAuth?.apiEnabled) {
      try {
        const res = await window.BSAPI.delete(`/learning/enroll/${courseId}/`);
        if (res?.state) {
          this._enrolled = res.state.enrolled || [];
          this._completed = res.state.completed || [];
          this._last = res.state.last || null;
          this._progress = res.state.progress || {};
          this._stats = res.state.stats || null;
          this._activity = res.state.activity || [];
          this._certificates = res.state.certificates || [];
        }
      } catch (e) {
        console.warn("unenroll failed", e);
        throw e;
      }
    } else {
      this._enrolled = this._enrolled.filter((id) => id !== courseId);
      this._completed = this._completed.filter((id) => id !== courseId);
      delete this._progress[courseId];
      delete this._lessonWatches[courseId];
      if (this._last?.courseId === courseId) {
        this._last = null;
      }
    }
    document.dispatchEvent(new CustomEvent("progress:updated"));
    return { ok: true };
  },

  getCertificates() {
    return [...this._certificates];
  },

  getCompleted() {
    return [...this._completed];
  },

  async markCompleted(courseId) {
    if (window.BSAuth?.apiEnabled) {
      try {
        const res = await window.BSAPI.post("/learning/complete/", { course_id: courseId });
        if (res.progress) {
          this._progress[courseId] = res.progress;
          this._applyLessonWatches(courseId, res.progress.lessonWatches);
        }
        await this.syncFromApi();
      } catch (e) {
        console.warn("markCompleted failed", e);
      }
    }
    if (!this._completed.includes(courseId)) {
      this._completed.push(courseId);
    }
  },

  async saveWatchProgress(courseId, lessonId, watchSeconds) {
    const seconds = Math.max(0, Math.floor(watchSeconds));
    if (!this._lessonWatches[courseId]) this._lessonWatches[courseId] = {};
    this._lessonWatches[courseId][Number(lessonId)] = Math.max(
      this._lessonWatches[courseId][Number(lessonId)] || 0,
      seconds
    );

    const course = window.getCourseById?.(courseId);
    if (course && this._progress[courseId]) {
      this._progress[courseId].percent = this._computePercent(course);
    }

    if (!window.BSAuth?.apiEnabled || !window.BSAuth?.isVerified?.()) {
      return;
    }

    const key = `${courseId}:${lessonId}`;
    clearTimeout(this._watchSaveTimers[key]);
    this._watchSaveTimers[key] = setTimeout(async () => {
      try {
        const res = await window.BSAPI.post("/learning/watch/", {
          course_id: courseId,
          lesson_id: lessonId,
          watch_seconds: seconds,
        });
        if (res.progress) {
          this._progress[courseId] = res.progress;
          this._applyLessonWatches(courseId, res.progress.lessonWatches);
        }
      } catch (e) {
        console.warn("saveWatchProgress failed", e);
      }
    }, 2000);
  },

  getLessonProgress(course) {
    if (!course) return 0;
    if (course.lessons?.length) {
      return this._computePercent(course);
    }
    return this.getCourseProgress(course.id).percent || 0;
  },

  getResumeUrl(courseId) {
    const course = window.getCourseById?.(courseId);
    if (!course) return "dashboard.html";
    const completed = new Set(this.getCompletedLessons(courseId));
    const nextLesson =
      course.lessons.find((l) => !completed.has(l.id)) ||
      course.lessons[course.lessons.length - 1];
    const lessonId = nextLesson?.id || course.lessons[0]?.id;
    return `course.html?id=${courseId}${lessonId ? `&lesson=${lessonId}` : ""}`;
  },

  getActivity() {
    return [...this._activity];
  },

  getStats() {
    if (this._stats) return this._stats;
    return {
      enrolled: this._enrolled.length,
      active: this.slotsUsed(),
      slots: this.MAX_ENROLLED,
      completed: this._completed.length,
      hours: "0.0",
      streak: 0,
      xp: 0,
    };
  },
};
