/** Parse "H:MM:SS" or "MM:SS" duration strings to minutes */
function parseDuration(str) {
  const parts = String(str).split(":").map(Number);
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
  if (parts.length === 2) return parts[0] + parts[1] / 60;
  return 0;
}

function formatHours(minutes) {
  const h = minutes / 60;
  return h >= 1 ? `${h.toFixed(1)} hrs` : `${Math.round(minutes)} min`;
}

window.COURSE_ROADMAPS = {
  "ui-ux-fundamentals": [
    { phase: "Phase 1 — UX Foundations", from: 1, to: 2, goal: "Understand UX roles and the design process" },
    { phase: "Phase 2 — Research", from: 3, to: 3, goal: "Plan and run user research" },
    { phase: "Phase 3 — Design", from: 4, to: 4, goal: "Wireframes and interactive prototypes" },
    { phase: "Phase 4 — Validation", from: 5, to: 5, goal: "Usability testing and iteration" }
  ],
  "web-development-bootcamp": [
    { phase: "Phase 1 — HTML", from: 1, to: 2, goal: "Structure pages and build forms" },
    { phase: "Phase 2 — CSS Core", from: 3, to: 3, goal: "Style layouts and typography" },
    { phase: "Phase 3 — Layout Systems", from: 4, to: 5, goal: "Flexbox and CSS Grid" },
    { phase: "Phase 4 — Responsive", from: 6, to: 6, goal: "Mobile-first responsive sites" }
  ],
  "digital-marketing-mastery": [
    { phase: "Phase 1 — Foundations", from: 1, to: 1, goal: "Digital marketing landscape" },
    { phase: "Phase 2 — SEO", from: 2, to: 2, goal: "Search engine optimization" },
    { phase: "Phase 3 — Content & Social", from: 3, to: 4, goal: "Content and social strategy" },
    { phase: "Phase 4 — Email", from: 5, to: 5, goal: "Email campaigns that convert" }
  ],
  "data-science-python": [
    { phase: "Phase 1 — Setup", from: 1, to: 1, goal: "Python data analysis intro" },
    { phase: "Phase 2 — Pandas", from: 2, to: 3, goal: "Load, clean, and shape data" },
    { phase: "Phase 3 — Visualization", from: 4, to: 4, goal: "Charts and insights" },
    { phase: "Phase 4 — Projects", from: 5, to: 5, goal: "Real CSV workflows" }
  ],
  "javascript-full-course": [
    { phase: "Phase 1 — Core JS", from: 1, to: 1, goal: "Variables, types, functions" },
    { phase: "Phase 2 — DOM", from: 2, to: 2, goal: "Manipulate the page" },
    { phase: "Phase 3 — ES6+", from: 3, to: 3, goal: "Modern JavaScript syntax" },
    { phase: "Phase 4 — Async", from: 4, to: 4, goal: "Promises and async/await" }
  ],
  "python-basics": [
    { phase: "Phase 1 — Getting Started", from: 1, to: 1, goal: "Python syntax and setup" },
    { phase: "Phase 2 — Data Types", from: 2, to: 2, goal: "Variables and types" },
    { phase: "Phase 3 — Control Flow", from: 3, to: 3, goal: "Loops and conditionals" },
    { phase: "Phase 4 — Functions", from: 4, to: 4, goal: "Reusable code blocks" }
  ],
  "react-crash-course": [
    { phase: "Phase 1 — React Basics", from: 1, to: 1, goal: "Components and JSX" },
    { phase: "Phase 2 — Props", from: 2, to: 2, goal: "Component composition" },
    { phase: "Phase 3 — State", from: 3, to: 3, goal: "Hooks and side effects" },
    { phase: "Phase 4 — Routing", from: 4, to: 4, goal: "Multi-page React apps" }
  ],
  "sql-beginners": [
    { phase: "Phase 1 — SQL Basics", from: 1, to: 1, goal: "Databases and SELECT" },
    { phase: "Phase 2 — Queries", from: 2, to: 2, goal: "Filtering and sorting" },
    { phase: "Phase 3 — JOINs", from: 3, to: 3, goal: "Relational data" },
    { phase: "Phase 4 — Aggregates", from: 4, to: 4, goal: "GROUP BY and analytics" }
  ],
  "graphic-design-basics": [
    { phase: "Phase 1 — Intro", from: 1, to: 1, goal: "What designers do" },
    { phase: "Phase 2 — Color", from: 2, to: 2, goal: "Color theory in practice" },
    { phase: "Phase 3 — Type", from: 3, to: 3, goal: "Typography rules" },
    { phase: "Phase 4 — Layout", from: 4, to: 4, goal: "Composition and hierarchy" }
  ],
  "public-speaking": [
    { phase: "Phase 1 — Voice", from: 1, to: 1, goal: "Speak so people listen" },
    { phase: "Phase 2 — Structure", from: 2, to: 2, goal: "Craft compelling talks" },
    { phase: "Phase 3 — Presence", from: 3, to: 3, goal: "Body language on stage" },
    { phase: "Phase 4 — Confidence", from: 4, to: 4, goal: "Beat stage fright" }
  ],
  "excel-essentials": [
    { phase: "Phase 1 — Basics", from: 1, to: 1, goal: "Spreadsheet fundamentals" },
    { phase: "Phase 2 — Formulas", from: 2, to: 2, goal: "Functions and calculations" },
    { phase: "Phase 3 — Charts", from: 3, to: 3, goal: "Visualize data" },
    { phase: "Phase 4 — Pivot Tables", from: 4, to: 4, goal: "Summarize large datasets" }
  ],
  "cybersecurity-101": [
    { phase: "Phase 1 — Foundations", from: 1, to: 1, goal: "Security landscape" },
    { phase: "Phase 2 — Threats", from: 2, to: 2, goal: "Attack types and vectors" },
    { phase: "Phase 3 — Networks", from: 3, to: 3, goal: "Network security basics" },
    { phase: "Phase 4 — Identity", from: 4, to: 4, goal: "Passwords and authentication" }
  ],
  "nodejs-backend": [
    { phase: "Phase 1 — Node.js Core", from: 1, to: 1, goal: "Runtime, npm, and modules" },
    { phase: "Phase 2 — APIs", from: 2, to: 2, goal: "Build and test REST endpoints" },
    { phase: "Phase 3 — Full Stack", from: 3, to: 3, goal: "Connect front-end and back-end" },
    { phase: "Phase 4 — Async", from: 4, to: 4, goal: "Non-blocking JavaScript patterns" }
  ],
  "git-github": [
    { phase: "Phase 1 — Git Basics", from: 1, to: 1, goal: "Commits, branches, and merges" },
    { phase: "Phase 2 — Workflow", from: 2, to: 2, goal: "Professional dev practices" },
    { phase: "Phase 3 — Foundations", from: 3, to: 3, goal: "Programming fundamentals" },
    { phase: "Phase 4 — Security", from: 4, to: 4, goal: "Safe coding habits" }
  ],
  "docker-devops": [
    { phase: "Phase 1 — Containers", from: 1, to: 1, goal: "Docker images and containers" },
    { phase: "Phase 2 — Deploy", from: 2, to: 2, goal: "Ship Node.js apps" },
    { phase: "Phase 3 — GitOps", from: 3, to: 3, goal: "Version control in teams" },
    { phase: "Phase 4 — Security", from: 4, to: 4, goal: "Secure deployments" }
  ],
  "java-programming": [
    { phase: "Phase 1 — Java Core", from: 1, to: 1, goal: "Syntax and OOP basics" },
    { phase: "Phase 2 — CS Foundations", from: 2, to: 2, goal: "Programming concepts" },
    { phase: "Phase 3 — Data Structures", from: 3, to: 3, goal: "Efficient code organization" },
    { phase: "Phase 4 — OOP Deep Dive", from: 4, to: 4, goal: "Classes and objects" }
  ],
  "kotlin-mobile": [
    { phase: "Phase 1 — Kotlin", from: 1, to: 1, goal: "Modern Android language" },
    { phase: "Phase 2 — Mobile UI", from: 2, to: 2, goal: "Cross-platform with Flutter" },
    { phase: "Phase 3 — Java Bridge", from: 3, to: 3, goal: "JVM ecosystem" },
    { phase: "Phase 4 — Foundations", from: 4, to: 4, goal: "Core programming skills" }
  ],
  "flutter-mobile": [
    { phase: "Phase 1 — Flutter", from: 1, to: 1, goal: "Widgets and layouts" },
    { phase: "Phase 2 — Android", from: 2, to: 2, goal: "Kotlin companion skills" },
    { phase: "Phase 3 — UX", from: 3, to: 3, goal: "Mobile interface design" },
    { phase: "Phase 4 — React Patterns", from: 4, to: 4, goal: "Component-based UI" }
  ],
  "angular-framework": [
    { phase: "Phase 1 — Angular", from: 1, to: 1, goal: "Components and modules" },
    { phase: "Phase 2 — Modern JS", from: 2, to: 2, goal: "ES6+ syntax" },
    { phase: "Phase 3 — TypeScript", from: 3, to: 3, goal: "Typed front-end code" },
    { phase: "Phase 4 — Best Practices", from: 4, to: 4, goal: "Production-ready apps" }
  ],
  "machine-learning": [
    { phase: "Phase 1 — ML Intro", from: 1, to: 1, goal: "Models and training" },
    { phase: "Phase 2 — Data", from: 2, to: 2, goal: "Collect and explore datasets" },
    { phase: "Phase 3 — Pandas", from: 3, to: 3, goal: "Clean and shape data" },
    { phase: "Phase 4 — Viz", from: 4, to: 4, goal: "Communicate insights" }
  ],
  "programming-fundamentals": [
    { phase: "Phase 1 — CS Intro", from: 1, to: 1, goal: "How computers think" },
    { phase: "Phase 2 — Python", from: 2, to: 2, goal: "First programming language" },
    { phase: "Phase 3 — Practice", from: 3, to: 3, goal: "Build small programs" },
    { phase: "Phase 4 — C++", from: 4, to: 4, goal: "Lower-level concepts" }
  ],
  "cpp-programming": [
    { phase: "Phase 1 — C++", from: 1, to: 1, goal: "Syntax and memory" },
    { phase: "Phase 2 — Structures", from: 2, to: 2, goal: "Algorithms and data" },
    { phase: "Phase 3 — Foundations", from: 3, to: 3, goal: "Core CS concepts" },
    { phase: "Phase 4 — Math", from: 4, to: 4, goal: "Logic for developers" }
  ],
  "adobe-photoshop": [
    { phase: "Phase 1 — Photoshop", from: 1, to: 1, goal: "Tools and layers" },
    { phase: "Phase 2 — Design", from: 2, to: 2, goal: "Visual principles" },
    { phase: "Phase 3 — UI/UX", from: 3, to: 3, goal: "Digital product design" },
    { phase: "Phase 4 — Web", from: 4, to: 4, goal: "CSS implementation" }
  ],
  "business-communication": [
    { phase: "Phase 1 — Writing", from: 1, to: 1, goal: "Clear business emails" },
    { phase: "Phase 2 — Speaking", from: 2, to: 2, goal: "Confident presentations" },
    { phase: "Phase 3 — Presence", from: 3, to: 3, goal: "Body language" },
    { phase: "Phase 4 — Marketing", from: 4, to: 4, goal: "Audience messaging" }
  ],
  "hr-management": [
    { phase: "Phase 1 — HR Core", from: 1, to: 1, goal: "People operations" },
    { phase: "Phase 2 — Communication", from: 2, to: 2, goal: "Workplace writing" },
    { phase: "Phase 3 — Presentations", from: 3, to: 3, goal: "Leadership talks" },
    { phase: "Phase 4 — Confidence", from: 4, to: 4, goal: "Manage difficult moments" }
  ]
};

window.enrichCourses = function () {
  if (!window.BARWAAQO_COURSES) return;
  window.BARWAAQO_COURSES.forEach((course) => {
    const minutes = (course.lessons || []).reduce(
      (sum, l) => sum + parseDuration(l.duration),
      0
    );
    course.totalMinutes = Math.round(minutes);
    course.totalHours = (minutes / 60).toFixed(1);
    course.lessonCount = course.lessons?.length ?? course.lessonCount ?? 0;
    course.durationLabel = formatHours(minutes);
    if (!course.roadmap?.length) {
      course.roadmap = window.COURSE_ROADMAPS[course.id] || [];
    }
  });
};

window.renderRoadmap = function (course, currentLessonId) {
  if (!course.roadmap?.length) return "";
  return course.roadmap
    .map((phase) => {
      const lessonsInPhase = course.lessons.filter(
        (l) => l.id >= phase.from && l.id <= phase.to
      );
      const phaseMinutes = lessonsInPhase.reduce(
        (s, l) => s + parseDuration(l.duration),
        0
      );
      const done = currentLessonId
        ? lessonsInPhase.every((l) => l.id < currentLessonId) ||
          lessonsInPhase.some((l) => l.id === currentLessonId)
        : false;
      const complete = currentLessonId
        ? lessonsInPhase.every((l) => l.id < currentLessonId)
        : false;

      return `
        <div class="roadmap-phase${complete ? " roadmap-phase--done" : done ? " roadmap-phase--active" : ""}">
          <div class="roadmap-phase-head">
            <span class="roadmap-phase-num">${phase.phase.split("—")[0].trim()}</span>
            <div>
              <strong>${phase.phase.includes("—") ? phase.phase.split("—")[1].trim() : phase.phase}</strong>
              <span>${lessonsInPhase.length} lessons · ${formatHours(phaseMinutes)}</span>
            </div>
          </div>
          <p>${phase.goal}</p>
        </div>`;
    })
    .join("");
};

enrichCourses();
