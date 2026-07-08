/** Admin platform — section-based dashboard */
(function () {
  let _adminData = null;

  const SECTION_META = {
    overview: {
      title: "Admin dashboard",
      subtitle: "Manage users, courses, enrollments, and platform health.",
    },
    students: {
      title: "Student management",
      subtitle: "Manage learner accounts, verification, and enrollments.",
    },
    teachers: {
      title: "Teacher management",
      subtitle: "Manage instructors, roles, and course assignments.",
    },
    courses: {
      title: "Course analytics",
      subtitle: "Enrollment and completion performance across the catalog.",
    },
    "manage-courses": {
      title: "Manage courses",
      subtitle: "Add courses, assign instructors, and control catalog settings.",
    },
    instructors: {
      title: "Teacher management",
      subtitle: "Manage instructors, roles, and course assignments.",
    },
    enrollments: {
      title: "Enrollment management",
      subtitle: "View and remove learner enrollments across all courses.",
    },
    certificates: {
      title: "Certificates",
      subtitle: "Recently issued completion certificates.",
    },
    system: {
      title: "System activity",
      subtitle: "All users, page visits, and who is watching which course.",
    },
  };

  function currentSection() {
    let hash = (window.location.hash || "#overview").replace("#", "");
    if (hash === "instructors" || hash === "users") hash = hash === "users" ? "students" : "teachers";
    return SECTION_META[hash] ? hash : "overview";
  }

  function statCard(label, value, icon, tone) {
    return `
      <div class="admin-kpi admin-kpi--${tone || "default"}">
        <span class="admin-kpi-icon"><i class="fa-solid ${icon}"></i></span>
        <div>
          <span class="admin-kpi-label">${label}</span>
          <strong class="admin-kpi-value">${value}</strong>
        </div>
      </div>`;
  }

  function uniqueLearners(recentEnrollments) {
    const seen = new Set();
    const rows = [];
    (recentEnrollments || []).forEach((r) => {
      if (!r.email || seen.has(r.email)) return;
      seen.add(r.email);
      rows.push(r);
    });
    return rows;
  }

  function completionRate(active, completed) {
    const total = active + completed;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }

  function renderOverview(data) {
    const p = data.platform || {};
    const recent = data.recentEnrollments || [];
    const rate = completionRate(p.activeEnrollments || 0, p.completedEnrollments || 0);

    const activity = [
      ...recent.slice(0, 5).map((r) => ({
        type: "enroll",
        text: `${r.email} enrolled in <strong>${r.courseTitle}</strong>`,
        date: r.enrolledAt,
      })),
      ...(data.recentCertificates || []).slice(0, 5).map((c) => ({
        type: "cert",
        text: `${c.email} earned a certificate for <strong>${c.courseTitle}</strong>`,
        date: c.issuedAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const activityHtml = activity.length
      ? activity
          .map(
            (a) => `
        <li class="admin-activity-item admin-activity-item--${a.type}">
          <span class="admin-activity-icon"><i class="fa-solid ${a.type === "cert" ? "fa-award" : "fa-user-plus"}"></i></span>
          <div>
            <p>${a.text}</p>
            <time>${a.date ? new Date(a.date).toLocaleString() : "—"}</time>
          </div>
        </li>`
          )
          .join("")
      : `<li class="admin-activity-empty">No recent platform activity yet.</li>`;

    const topCourses = (data.topCourses || [])
      .slice(0, 5)
      .map(
        (c, i) => `
      <div class="admin-rank-row">
        <span class="admin-rank-num">${i + 1}</span>
        <div class="admin-rank-body">
          <strong>${c.title}</strong>
          <span>${c.students} students · ${c.completions} completed</span>
        </div>
      </div>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid">
        ${statCard("Verified learners", p.learners || 0, "fa-users", "blue")}
        ${statCard("Active enrollments", p.activeEnrollments || 0, "fa-play-circle", "yellow")}
        ${statCard("Course completions", p.completedEnrollments || 0, "fa-circle-check", "green")}
        ${statCard("Certificates issued", p.certificates || 0, "fa-award", "navy")}
      </section>

      <div class="admin-overview-grid">
        <section class="admin-panel admin-panel--highlight">
          <h2><i class="fa-solid fa-heart-pulse"></i> Platform health</h2>
          <div class="admin-health-metrics">
            <div class="admin-health-metric">
              <span>Completion rate</span>
              <strong>${rate}%</strong>
            </div>
            <div class="admin-health-metric">
              <span>Lessons completed</span>
              <strong>${p.lessonsCompleted || 0}</strong>
            </div>
            <div class="admin-health-metric">
              <span>Quiz passes</span>
              <strong>${p.quizPasses || 0}</strong>
            </div>
            <div class="admin-health-metric">
              <span>Catalog size</span>
              <strong>${p.courses || 0} courses</strong>
            </div>
          </div>
        </section>

        <section class="admin-panel">
          <h2><i class="fa-solid fa-bolt"></i> Recent activity</h2>
          <ul class="admin-activity-list">${activityHtml}</ul>
        </section>
      </div>

      <section class="admin-panel">
        <div class="admin-panel-head">
          <h2><i class="fa-solid fa-chart-line"></i> Top courses</h2>
          <a href="lms.html#courses" class="admin-panel-link">View all courses</a>
        </div>
        <div class="admin-rank-list">${topCourses || '<p class="admin-empty">No course data yet.</p>'}</div>
      </section>

      <section class="admin-quick-actions">
        <a href="lms.html#students" class="admin-quick-card"><i class="fa-solid fa-user-graduate"></i><span>Students</span></a>
        <a href="lms.html#teachers" class="admin-quick-card"><i class="fa-solid fa-chalkboard-user"></i><span>Teachers</span></a>
        <a href="lms.html#manage-courses" class="admin-quick-card"><i class="fa-solid fa-pen-to-square"></i><span>Courses</span></a>
        <a href="lms.html#enrollments" class="admin-quick-card"><i class="fa-solid fa-user-graduate"></i><span>Enrollments</span></a>
        <a href="lms.html#system" class="admin-quick-card"><i class="fa-solid fa-server"></i><span>System activity</span></a>
      </section>`;
  }

  function tablePanel(id, title, icon, desc, headers, rows, emptyColspan) {
    return `
      <section class="admin-panel" id="${id}">
        <h2><i class="fa-solid ${icon}"></i> ${title}</h2>
        <p class="admin-panel-desc">${desc}</p>
        <div class="lms-table-wrap">
          <table class="lms-table">
            <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${rows || `<tr><td colspan="${emptyColspan}">No records yet</td></tr>`}</tbody>
          </table>
        </div>
      </section>`;
  }

  function renderStudents(students, platform) {
    const p = platform || {};
    const rows = (students || [])
      .map(
        (u) => `
      <tr data-user-id="${u.id}">
        <td>
          <strong>${u.name || "—"}</strong>
          <span class="admin-course-meta">${u.email}</span>
        </td>
        <td>
          <label class="admin-toggle" title="Email verified">
            <input type="checkbox" data-field="emailVerified" ${u.emailVerified ? "checked" : ""}>
            <span></span>
          </label>
        </td>
        <td>${u.enrollments ?? 0}</td>
        <td>${u.dateJoined ? new Date(u.dateJoined).toLocaleDateString() : "—"}</td>
        <td class="admin-actions-cell">
          <button type="button" class="admin-btn-outline admin-promote-btn" data-role="teacher">Make teacher</button>
        </td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Students", students?.length || 0, "fa-user-graduate", "blue")}
        ${statCard("Verified", (students || []).filter((s) => s.emailVerified).length, "fa-user-check", "green")}
        ${statCard("With enrollments", (students || []).filter((s) => (s.enrollments || 0) > 0).length, "fa-book", "yellow")}
      </section>
      ${tablePanel(
        "students",
        "All students",
        "fa-user-graduate",
        "Verify learner emails and promote students to teacher when they should manage courses.",
        ["Student", "Verified", "Enrollments", "Joined", ""],
        rows,
        5
      )}`;
  }

  function renderTeachers(teachers, platform) {
    const p = platform || {};
    const rows = (teachers || [])
      .map(
        (u) => `
      <tr data-user-id="${u.id}">
        <td>
          <strong>${u.name || "—"}</strong>
          <span class="admin-course-meta">${u.email}</span>
        </td>
        <td>
          <select class="admin-role-select" data-field="role" aria-label="Role for ${u.email}">
            <option value="teacher" ${u.role === "teacher" ? "selected" : ""}>Teacher</option>
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </td>
        <td>${u.coursesTeaching ?? 0}</td>
        <td>${u.enrollments ?? 0}</td>
        <td class="admin-actions-cell">
          <a href="lms.html#manage-courses" class="lms-link">Assign courses</a>
          ${u.role !== "admin" ? `<button type="button" class="admin-btn-danger admin-demote-btn">Remove teacher</button>` : ""}
        </td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-panel admin-form-card" id="add-teacher">
        <div class="admin-panel-head">
          <h2><i class="fa-solid fa-user-plus"></i> Add teacher</h2>
        </div>
        <form class="admin-form" id="adminAddTeacherForm">
          <div class="admin-form-grid">
            <label class="admin-field">
              <span>Full name</span>
              <input type="text" name="name" required placeholder="e.g. Ahmed Hassan">
            </label>
            <label class="admin-field">
              <span>Email</span>
              <input type="email" name="email" required placeholder="teacher@example.com">
            </label>
            <label class="admin-field admin-field--wide">
              <span>Password (optional)</span>
              <input type="password" name="password" minlength="8" placeholder="Leave blank to auto-generate a temporary password">
            </label>
          </div>
          <div class="admin-form-actions">
            <button type="submit" class="admin-btn-primary"><i class="fa-solid fa-user-plus"></i> Create teacher account</button>
          </div>
        </form>
      </section>
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Teachers & admins", teachers?.length || 0, "fa-chalkboard-user", "navy")}
        ${statCard("Courses managed", (teachers || []).reduce((n, t) => n + (t.coursesTeaching || 0), 0), "fa-book", "yellow")}
        ${statCard("Platform teachers", p.teachers || 0, "fa-users", "blue")}
      </section>
      ${tablePanel(
        "teachers",
        "Instructors & admins",
        "fa-chalkboard-user",
        "Assign courses under Manage courses. Demote teachers back to student if needed.",
        ["Name", "Role", "Courses", "Enrollments", ""],
        rows,
        5
      )}`;
  }

  function renderEnrollmentsList(enrollments, platform) {
    const p = platform || {};
    const rows = (enrollments || [])
      .map(
        (r) => `
      <tr data-user-id="${r.userId}" data-course-id="${r.courseId}">
        <td>${r.email}</td>
        <td>${r.courseTitle}</td>
        <td>${r.enrolledAt ? new Date(r.enrolledAt).toLocaleDateString() : "—"}</td>
        <td><span class="lms-status-pill lms-status-pill--${r.completed ? "done" : "active"}">${r.completed ? "Completed" : "Active"}</span></td>
        <td class="admin-actions-cell">
          <button type="button" class="admin-btn-danger admin-unenroll-btn">Remove</button>
        </td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("All enrollments", p.enrollments || enrollments?.length || 0, "fa-list", "default")}
        ${statCard("Active", p.activeEnrollments || 0, "fa-play-circle", "yellow")}
        ${statCard("Completed", p.completedEnrollments || 0, "fa-circle-check", "green")}
      </section>
      ${tablePanel(
        "enrollments",
        "All enrollments",
        "fa-user-graduate",
        "Remove enrollments to free up slots or reset learner progress.",
        ["Learner", "Course", "Enrolled", "Status", ""],
        rows,
        5
      )}`;
  }

  async function patchUser(userId, payload) {
    return window.BSAPI.patch(`/learning/lms/users/${userId}/`, payload);
  }

  function bindStudentActions(root) {
    root.querySelectorAll("tr[data-user-id]").forEach((row) => {
      const userId = row.dataset.userId;

      row.querySelector('input[data-field="emailVerified"]')?.addEventListener("change", async (e) => {
        try {
          await patchUser(userId, { emailVerified: e.target.checked });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
        } catch (err) {
          e.target.checked = !e.target.checked;
          window.alert(err.message || "Could not update verification.");
        }
      });

      row.querySelector(".admin-promote-btn")?.addEventListener("click", async () => {
        if (!confirm("Promote this student to teacher?")) return;
        try {
          await patchUser(userId, { role: "teacher" });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.remove(), 800);
        } catch (err) {
          window.alert(err.message || "Could not promote user.");
        }
      });
    });
  }

  function bindTeacherActions(root) {
    bindUserActions(root);
    root.querySelectorAll(".admin-demote-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const userId = row?.dataset.userId;
        if (!userId || !confirm("Demote this teacher to student?")) return;
        try {
          await patchUser(userId, { role: "student" });
          row.remove();
        } catch (err) {
          window.alert(err.message || "Could not demote user.");
        }
      });
    });
  }

  function bindUserActions(root) {
    root.querySelectorAll("tr[data-user-id]").forEach((row) => {
      const userId = row.dataset.userId;

      row.querySelector(".admin-role-select")?.addEventListener("change", async (e) => {
        try {
          await patchUser(userId, { role: e.target.value });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
        } catch (err) {
          window.alert(err.message || "Could not update role.");
        }
      });

      row.querySelector('input[data-field="emailVerified"]')?.addEventListener("change", async (e) => {
        try {
          await patchUser(userId, { emailVerified: e.target.checked });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
        } catch (err) {
          e.target.checked = !e.target.checked;
          window.alert(err.message || "Could not update verification.");
        }
      });
    });
  }

  function bindEnrollmentActions(root) {
    root.querySelectorAll(".admin-unenroll-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const userId = row?.dataset.userId;
        const courseId = row?.dataset.courseId;
        if (!userId || !courseId) return;
        if (!confirm("Remove this enrollment and clear the learner's progress for this course?")) return;
        try {
          await window.BSAPI.delete(`/learning/lms/enrollments/${userId}/${courseId}/`);
          row.remove();
        } catch (err) {
          window.alert(err.message || "Could not remove enrollment.");
        }
      });
    });
  }

  function formatDuration(seconds) {
    if (!seconds || seconds < 1) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function renderSystem(data) {
    const stats = data.stats || {};
    const users = data.users || [];
    const visits = data.visits || [];
    const watching = data.watching || [];
    const current = data.currentlyWatching || [];

    const userRows = users
      .map(
        (u) => `
      <tr>
        <td>
          <strong>${u.name || "—"}</strong>
          <span class="admin-course-meta">${u.email}</span>
        </td>
        <td><span class="lms-tag">${u.role}</span></td>
        <td>${u.enrollments ?? 0}</td>
        <td>${u.visits ?? 0}</td>
        <td>${u.lastCourse ? `${u.lastCourse} · L${u.lastLesson || 1}` : "—"}</td>
        <td>${u.lastVisit ? new Date(u.lastVisit).toLocaleString() : "—"}</td>
      </tr>`
      )
      .join("");

    const visitRows = visits
      .map(
        (v) => `
      <tr>
        <td>${v.name || "Guest"}${v.email ? `<span class="admin-course-meta">${v.email}</span>` : ""}</td>
        <td>${v.pagePath}</td>
        <td>${v.pageTitle || "—"}</td>
        <td>${v.visitedAt ? new Date(v.visitedAt).toLocaleString() : "—"}</td>
      </tr>`
      )
      .join("");

    const currentRows = current
      .map(
        (w) => `
      <tr>
        <td>
          <strong>${w.name || "—"}</strong>
          <span class="admin-course-meta">${w.email}</span>
        </td>
        <td>${w.courseTitle}</td>
        <td>L${w.lessonNumber}: ${w.lessonTitle}</td>
        <td>${w.updatedAt ? new Date(w.updatedAt).toLocaleString() : "—"}</td>
      </tr>`
      )
      .join("");

    const watchRows = watching
      .map(
        (w) => `
      <tr>
        <td>
          <strong>${w.name || "—"}</strong>
          <span class="admin-course-meta">${w.email}</span>
        </td>
        <td>${w.courseTitle}</td>
        <td>L${w.lessonNumber}: ${w.lessonTitle}</td>
        <td>${formatDuration(w.watchSeconds)}</td>
        <td>${w.updatedAt ? new Date(w.updatedAt).toLocaleString() : "—"}</td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Total users", stats.totalUsers || 0, "fa-users", "blue")}
        ${statCard("Today's visits", stats.todayVisits || 0, "fa-eye", "yellow")}
        ${statCard("Week visits", stats.weekVisits || 0, "fa-chart-line", "green")}
        ${statCard("Active learners", stats.activeLearners || 0, "fa-play", "navy")}
      </section>

      ${tablePanel(
        "system-users",
        "All system users",
        "fa-users",
        "Every account on the platform with enrollments, visits, and last course activity.",
        ["User", "Role", "Enrollments", "Visits", "Last course", "Last visit"],
        userRows,
        6
      )}

      ${tablePanel(
        "system-visits",
        "Recent page visits",
        "fa-eye",
        "Pages opened across the site — logged-in users and guests.",
        ["Visitor", "Page", "Title", "When"],
        visitRows,
        4
      )}

      ${tablePanel(
        "system-current",
        "Currently watching",
        "fa-circle-play",
        "Learners with a saved resume position — likely active on a lesson now.",
        ["Learner", "Course", "Lesson", "Last active"],
        currentRows,
        4
      )}

      ${tablePanel(
        "system-watching",
        "Watch history",
        "fa-clapperboard",
        "Lesson watch time recorded from the video player.",
        ["Learner", "Course", "Lesson", "Watched", "Updated"],
        watchRows,
        5
      )}`;
  }

  function renderCourses(data) {
    const p = data.platform || {};
    const rows = (data.topCourses || [])
      .map(
        (c) => `
      <tr>
        <td>${c.title}</td>
        <td>${c.students}</td>
        <td>${c.completions}</td>
        <td>${c.students ? Math.round((c.completions / c.students) * 100) : 0}%</td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Published courses", p.courses || 0, "fa-book", "navy")}
        ${statCard("Total enrollments", p.enrollments || 0, "fa-user-graduate", "blue")}
        ${statCard("Completions", p.completedEnrollments || 0, "fa-circle-check", "green")}
      </section>
      ${tablePanel(
        "courses",
        "Course catalog performance",
        "fa-book",
        "Enrollment and completion rates across all courses.",
        ["Course", "Students", "Completions", "Rate"],
        rows,
        4
      )}`;
  }

  function renderCertificates(data) {
    const p = data.platform || {};
    const rows = (data.recentCertificates || [])
      .map(
        (c) => `
      <tr>
        <td>${c.email}</td>
        <td>${c.courseTitle}</td>
        <td>${c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "—"}</td>
        <td><a href="certificate.html?id=${c.id}" class="lms-link">Verify</a></td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Certificates issued", p.certificates || 0, "fa-award", "navy")}
        ${statCard("Quiz passes", p.quizPasses || 0, "fa-clipboard-check", "green")}
        ${statCard("Course completions", p.completedEnrollments || 0, "fa-circle-check", "yellow")}
      </section>
      ${tablePanel(
        "certificates",
        "Issued certificates",
        "fa-award",
        "Certificates earned by learners who completed courses and passed assessments.",
        ["Learner", "Course", "Issued", ""],
        rows,
        4
      )}`;
  }

  function teacherOptions(teachers, selectedId) {
    const opts = (teachers || [])
      .map(
        (t) =>
          `<option value="${t.id}" ${String(t.id) === String(selectedId) ? "selected" : ""}>${t.name} (${t.email})</option>`
      )
      .join("");
    return `<option value="">— Unassigned —</option>${opts}`;
  }

  const COURSE_CATEGORIES = ["Coding", "Design", "Business", "Personal", "General"];

  function categorySelectOptions(selected = "General") {
    return COURSE_CATEGORIES.map(
      (c) => `<option value="${c}"${c === selected ? " selected" : ""}>${c}</option>`
    ).join("");
  }

  function defaultLessonRow(index = 1, data = {}) {
    const title = data.title || "";
    const videoId = data.videoId || "";
    const duration = data.duration || "10:00";
    return `
      <div class="admin-lesson-row" data-lesson-row>
        <span class="admin-lesson-num">${index}</span>
        <label class="admin-field">
          <span>Lesson title</span>
          <input type="text" class="admin-lesson-title" required placeholder="Introduction" value="${title}">
        </label>
        <label class="admin-field">
          <span>YouTube video ID</span>
          <input type="text" class="admin-lesson-video" required placeholder="dQw4w9WgXcQ" value="${videoId}">
        </label>
        <label class="admin-field admin-field--duration">
          <span>Duration</span>
          <input type="text" class="admin-lesson-duration" value="${duration}" placeholder="12:30">
        </label>
        <button type="button" class="admin-lesson-remove" title="Remove lesson" aria-label="Remove lesson"><i class="fa-solid fa-xmark"></i></button>
      </div>`;
  }

  function lessonListMarkup() {
    return `
      <div class="admin-lessons-block admin-field--wide">
        <div class="admin-lessons-head">
          <span>Lessons</span>
          <p class="admin-panel-desc admin-lessons-hint">Use the video ID from a YouTube URL. New courses include lessons, video playback, progress tracking, roadmap, and a final quiz — like existing catalog courses.</p>
        </div>
        <div class="admin-lesson-list" id="adminLessonList">${defaultLessonRow(1)}</div>
        <button type="button" class="admin-btn-secondary" id="adminAddLessonBtn"><i class="fa-solid fa-plus"></i> Add lesson</button>
      </div>`;
  }

  function reindexLessonRows(list) {
    list.querySelectorAll("[data-lesson-row]").forEach((row, i) => {
      const num = row.querySelector(".admin-lesson-num");
      if (num) num.textContent = String(i + 1);
    });
  }

  function bindLessonBuilder(root) {
    const list = root.querySelector("#adminLessonList");
    const addBtn = root.querySelector("#adminAddLessonBtn");
    if (!list || list.dataset.bound === "1") return;
    list.dataset.bound = "1";

    addBtn?.addEventListener("click", () => {
      const count = list.querySelectorAll("[data-lesson-row]").length;
      list.insertAdjacentHTML("beforeend", defaultLessonRow(count + 1));
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".admin-lesson-remove");
      if (!btn) return;
      const rows = list.querySelectorAll("[data-lesson-row]");
      if (rows.length <= 1) {
        const msg = "A course needs at least one lesson.";
        if (window.BSToast?.show) window.BSToast.show(msg, "error");
        else window.alert(msg);
        return;
      }
      btn.closest("[data-lesson-row]")?.remove();
      reindexLessonRows(list);
    });
  }

  function parseYoutubeId(raw) {
    const value = (raw || "").trim();
    if (!value) return "";
    const match = value.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return (match ? match[1] : value).slice(0, 20);
  }

  function collectLessonsFromForm(form) {
    const list = form.querySelector("#adminLessonList");
    if (!list) return [];
    const lessons = [];
    list.querySelectorAll("[data-lesson-row]").forEach((row) => {
      const title = row.querySelector(".admin-lesson-title")?.value.trim();
      const videoId = parseYoutubeId(row.querySelector(".admin-lesson-video")?.value);
      const duration = row.querySelector(".admin-lesson-duration")?.value.trim() || "10:00";
      if (title && videoId) lessons.push({ title, videoId, duration });
    });
    return lessons;
  }

  function resetLessonList(form) {
    const list = form.querySelector("#adminLessonList");
    if (list) list.innerHTML = defaultLessonRow(1);
  }

  function animateAdminContent(root) {
    if (!root) return;
    document.body.classList.add("admin-page-ready");
    root.querySelectorAll(".admin-kpi, .admin-panel, .admin-quick-card, .admin-form-card").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i * 0.05, 0.45)}s`);
      el.classList.add("admin-reveal");
    });
  }

  function renderManageCourses(courses, platform, teachers) {
    const p = platform || {};
    const rows = (courses || [])
      .map(
        (c) => `
      <tr data-course-id="${c.id}">
        <td>
          <strong>${c.title}</strong>
          <span class="admin-course-meta">${c.category}</span>
        </td>
        <td>
          <select class="admin-role-select admin-teacher-select" data-field="teacherId" aria-label="Assign instructor for ${c.title}">
            ${teacherOptions(teachers, c.teacherId)}
          </select>
        </td>
        <td>${c.lessonCount}</td>
        <td>${c.students}</td>
        <td>
          <label class="admin-toggle" title="Featured on homepage">
            <input type="checkbox" data-field="featured" ${c.featured ? "checked" : ""}>
            <span></span>
          </label>
        </td>
        <td>
          <label class="admin-toggle" title="Free course">
            <input type="checkbox" data-field="free" ${c.free ? "checked" : ""}>
            <span></span>
          </label>
        </td>
        <td>
          <input type="number" class="admin-sort-input" data-field="sortOrder" value="${c.sortOrder ?? 0}" min="0" max="999" aria-label="Sort order">
        </td>
        <td class="admin-actions-cell">
          <a href="course-preview.html?id=${c.id}" class="lms-link" target="_blank" rel="noopener">Preview</a>
        </td>
      </tr>`
      )
      .join("");

    return `
      <section class="admin-panel admin-form-card admin-panel--highlight" id="add-course">
        <div class="admin-panel-head">
          <h2><i class="fa-solid fa-plus"></i> Add new course</h2>
        </div>
        <form class="admin-form" id="adminAddCourseForm">
          <div class="admin-form-grid">
            <label class="admin-field">
              <span>Course title</span>
              <input type="text" name="title" required placeholder="e.g. Web Development Bootcamp">
            </label>
            <label class="admin-field">
              <span>Category</span>
              <select name="category">${categorySelectOptions("General")}</select>
            </label>
            <label class="admin-field admin-field--wide">
              <span>Description</span>
              <textarea name="description" rows="2" placeholder="Short course description"></textarea>
            </label>
            <label class="admin-field">
              <span>Assign instructor</span>
              <select name="teacherId">${teacherOptions(teachers, "")}</select>
            </label>
            <label class="admin-field">
              <span>Display name (if unassigned)</span>
              <input type="text" name="instructor" placeholder="Instructor name">
            </label>
            <label class="admin-field">
              <span>Thumbnail video ID</span>
              <input type="text" name="thumbnailVideoId" placeholder="Optional — defaults to first lesson">
            </label>
            <label class="admin-field">
              <span>Playlist ID</span>
              <input type="text" name="playlistId" placeholder="Optional YouTube playlist">
            </label>
          </div>
          ${lessonListMarkup()}
          <div class="admin-form-actions">
            <label class="admin-check"><input type="checkbox" name="featured"> Featured</label>
            <label class="admin-check"><input type="checkbox" name="free" checked> Free course</label>
            <button type="submit" class="admin-btn-primary"><i class="fa-solid fa-plus"></i> Create course</button>
          </div>
        </form>
      </section>
      <section class="admin-kpi-grid admin-kpi-grid--compact">
        ${statCard("Total courses", p.courses || courses?.length || 0, "fa-book", "navy")}
        ${statCard("Featured", (courses || []).filter((c) => c.featured).length, "fa-star", "yellow")}
        ${statCard("Free courses", (courses || []).filter((c) => c.free).length, "fa-gift", "green")}
      </section>
      <section class="admin-panel" id="manage-courses">
        <h2><i class="fa-solid fa-pen-to-square"></i> Course catalog</h2>
        <p class="admin-panel-desc">Assign instructors, toggle visibility, adjust order, and preview. Changes save automatically.</p>
        <div class="lms-table-wrap">
          <table class="lms-table admin-manage-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Lessons</th>
                <th>Students</th>
                <th>Featured</th>
                <th>Free</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="8">No courses in catalog</td></tr>'}</tbody>
          </table>
        </div>
      </section>`;
  }

  async function createCourse(payload) {
    return window.BSAPI.post("/learning/lms/courses/", payload);
  }

  async function createTeacher(payload) {
    return window.BSAPI.post("/learning/lms/teachers/", payload);
  }

  function bindAddTeacherForm(root, onCreated) {
    const form = root.querySelector("#adminAddTeacherForm");
    if (!form || form.dataset.bound === "1") return;
    form.dataset.bound = "1";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: fd.get("name")?.toString().trim(),
        email: fd.get("email")?.toString().trim(),
        password: fd.get("password")?.toString().trim(),
      };
      try {
        const result = await createTeacher(payload);
        form.reset();
        let msg = `Teacher ${result.name} added successfully.`;
        if (result.temporaryPassword) {
          msg += ` Temporary password: ${result.temporaryPassword}`;
        }
        if (window.BSToast?.show) window.BSToast.show(msg, "success");
        else window.alert(msg);
        await onCreated?.();
      } catch (err) {
        window.alert(err.message || "Could not add teacher.");
      }
    });
  }

  function bindCreateCourseForm(root, onCreated) {
    const form = root.querySelector("#adminAddCourseForm");
    if (!form || form.dataset.bound === "1") return;
    form.dataset.bound = "1";
    bindLessonBuilder(root);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const lessons = collectLessonsFromForm(form);
      if (!lessons.length) {
        window.alert("Add at least one lesson with a title and YouTube video ID.");
        return;
      }

      const payload = {
        title: fd.get("title")?.toString().trim(),
        category: fd.get("category")?.toString().trim() || "General",
        description: fd.get("description")?.toString().trim(),
        instructor: fd.get("instructor")?.toString().trim(),
        teacherId: fd.get("teacherId") || null,
        thumbnailVideoId: parseYoutubeId(fd.get("thumbnailVideoId")?.toString()),
        playlistId: fd.get("playlistId")?.toString().trim(),
        featured: fd.get("featured") === "on",
        free: fd.get("free") === "on",
        lessons,
      };

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const created = await createCourse(payload);
        form.reset();
        form.querySelector('[name="free"]').checked = true;
        form.querySelector('[name="category"]').value = "General";
        resetLessonList(form);

        const lessonCount = created.lessonCount || lessons.length;
        const msg = created?.previewUrl
          ? `Course created with ${lessonCount} lesson(s). Open Preview from the catalog table to verify.`
          : `Course created with ${lessonCount} lesson(s).`;
        if (window.BSToast?.show) window.BSToast.show(msg, "success");

        await onCreated?.();
      } catch (err) {
        window.alert(err.message || "Could not create course.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  async function patchCourse(slug, payload) {
    return window.BSAPI.patch(`/learning/lms/courses/${slug}/`, payload);
  }

  function bindManageCourseActions(root) {
    root.querySelectorAll("tr[data-course-id]").forEach((row) => {
      const slug = row.dataset.courseId;
      row.querySelectorAll('input[type="checkbox"][data-field]').forEach((input) => {
        input.addEventListener("change", async () => {
          const field = input.dataset.field;
          try {
            await patchCourse(slug, { [field]: input.checked });
            row.classList.add("admin-row-saved");
            setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
          } catch (e) {
            input.checked = !input.checked;
            window.BSToast?.show?.(e.message || "Could not save change", "error");
          }
        });
      });

      const sortInput = row.querySelector(".admin-sort-input");
      if (!sortInput) return;
      let sortTimer;
      sortInput.addEventListener("change", async () => {
        clearTimeout(sortTimer);
        const value = parseInt(sortInput.value, 10);
        if (!Number.isFinite(value) || value < 0) {
          sortInput.value = "0";
          return;
        }
        try {
          await patchCourse(slug, { sortOrder: value });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
        } catch (e) {
          window.BSToast?.show?.(e.message || "Could not save sort order", "error");
        }
      });

      row.querySelector(".admin-teacher-select")?.addEventListener("change", async (e) => {
        const val = e.target.value;
        try {
          await patchCourse(slug, { teacherId: val || null });
          row.classList.add("admin-row-saved");
          setTimeout(() => row.classList.remove("admin-row-saved"), 1200);
        } catch (err) {
          window.alert(err.message || "Could not assign instructor.");
        }
      });
    });
  }

  function renderSection(data) {
    const section = currentSection();
    switch (section) {
      case "courses":
        return renderCourses(data);
      case "certificates":
        return renderCertificates(data);
      default:
        return renderOverview(data);
    }
  }

  function updateHero() {
    const section = currentSection();
    const meta = SECTION_META[section];
    const title = document.getElementById("lmsTitle");
    const sub = document.getElementById("lmsSubtitle");
    if (title) title.textContent = meta.title;
    if (sub) sub.textContent = meta.subtitle;
  }

  async function render() {
    const content = document.getElementById("lmsContent");
    if (!content || !_adminData) return;
    updateHero();
    const section = currentSection();

    if (section === "manage-courses") {
      content.innerHTML = `<p class="admin-loading">Loading course catalog</p>`;
      try {
        const [courses, teachers] = await Promise.all([
          window.BSAPI.get("/learning/lms/courses/"),
          window.BSAPI.get("/learning/lms/users/?role=teacher"),
        ]);
        const reload = async () => {
          const [fresh, teachersFresh] = await Promise.all([
            window.BSAPI.get("/learning/lms/courses/"),
            window.BSAPI.get("/learning/lms/users/?role=teacher"),
          ]);
          content.innerHTML = renderManageCourses(fresh, _adminData.platform, teachersFresh);
          bindManageCourseActions(content);
          bindCreateCourseForm(content, reload);
          animateAdminContent(content);
        };
        content.innerHTML = renderManageCourses(courses, _adminData.platform, teachers);
        bindManageCourseActions(content);
        bindCreateCourseForm(content, reload);
        animateAdminContent(content);
      } catch (e) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load courses. ${e.message || ""}</p>`;
      }
    } else if (section === "students") {
      content.innerHTML = `<p class="admin-loading">Loading students</p>`;
      try {
        const students = await window.BSAPI.get("/learning/lms/users/?role=student");
        content.innerHTML = renderStudents(students, _adminData.platform);
        bindStudentActions(content);
        animateAdminContent(content);
      } catch (e) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load students. ${e.message || ""}</p>`;
      }
    } else if (section === "teachers" || section === "instructors") {
      content.innerHTML = `<p class="admin-loading">Loading teachers</p>`;
      try {
        const teachers = await window.BSAPI.get("/learning/lms/users/?role=teacher");
        const reloadTeachers = async () => {
          const fresh = await window.BSAPI.get("/learning/lms/users/?role=teacher");
          content.innerHTML = renderTeachers(fresh, _adminData.platform);
          bindTeacherActions(content);
          bindAddTeacherForm(content, reloadTeachers);
          animateAdminContent(content);
        };
        content.innerHTML = renderTeachers(teachers, _adminData.platform);
        bindTeacherActions(content);
        bindAddTeacherForm(content, reloadTeachers);
        animateAdminContent(content);
      } catch (e) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load teachers. ${e.message || ""}</p>`;
      }
    } else if (section === "users") {
      window.location.hash = "students";
      return;
    } else if (section === "enrollments") {
      content.innerHTML = `<p class="admin-loading">Loading enrollments…</p>`;
      try {
        const enrollments = await window.BSAPI.get("/learning/lms/enrollments/");
        content.innerHTML = renderEnrollmentsList(enrollments, _adminData.platform);
        bindEnrollmentActions(content);
        animateAdminContent(content);
      } catch (e) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load enrollments. ${e.message || ""}</p>`;
      }
    } else if (section === "system") {
      content.innerHTML = `<p class="admin-loading">Loading system activity…</p>`;
      try {
        const systemData = await window.BSAPI.get("/learning/lms/system/");
        content.innerHTML = renderSystem(systemData);
        animateAdminContent(content);
      } catch (e) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load system activity. ${e.message || ""}</p>`;
      }
    } else {
      content.innerHTML = renderSection(_adminData);
      animateAdminContent(content);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.BSAppShell?.mountSidebar?.("admin");
  }

  function setAdminDate() {
    const el = document.getElementById("adminDate");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  async function bootLms() {
    const content = document.getElementById("lmsContent");
    try {
      _adminData = await window.BSAPI.get("/learning/lms/overview/");
      render();
    } catch (e) {
      if (content) {
        content.innerHTML = `<p class="admin-empty admin-empty--error">Could not load admin data. ${e.message || ""}</p>`;
      }
    }

    document.getElementById("lmsSearch")?.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter" || !e.target.value.trim()) return;
      const q = e.target.value.trim().toLowerCase();
      if (q.includes("@")) {
        window.location.hash = "students";
      } else {
        window.location.hash = "manage-courses";
      }
      await render();
    });
  }

  setAdminDate();
  document.addEventListener("auth:ready", bootLms);
  if (window.__authGuardPassed) bootLms();
  window.addEventListener("hashchange", render);
})();
