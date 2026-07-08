/**
 * Barwaaqo Skills — 25 YouTube-based courses
 * Each course links to a YouTube playlist; lessons use verified embeddable videos.
 */
window.BARWAAQO_COURSES = [
  {
    id: "ui-ux-fundamentals",
    title: "UI/UX Design Fundamentals",
    description: "Master user interface and user experience design — wireframes, Figma mockups, visual design, and prototyping.",
    category: "Design",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=5",
    playlistId: "PL32lfzEo50SrtB6L8Q1nS47y0emxNRut",
    thumbnailVideoId: "c9Wg6Cb_YlU",
    rating: 4.8,
    reviewCount: 1200,
    badge: "Bestseller",
    badgeClass: "badge-yellow",
    featured: true,
    free: true,
    lessons: [
      { id: 1, title: "UI/UX Design — Wireframe to Figma", videoId: "c9Wg6Cb_YlU", duration: "1:26:21" },
      { id: 2, title: "What is Graphic Design?", videoId: "sByzHoiYFX0", duration: "6:30" },
      { id: 3, title: "CSS for UI Implementation", videoId: "1Rs2ND1ryYc", duration: "4:32:00" },
      { id: 4, title: "Photoshop for Visual Design", videoId: "IyR_uYsRdPs", duration: "33:00" },
      { id: 5, title: "HTML Structure for Interfaces", videoId: "ScMzIvxBSi4", duration: "11:00" }
    ]
  },
  {
    id: "web-development-bootcamp",
    title: "Web Development Bootcamp",
    description: "Build modern websites with HTML, CSS, and responsive design — from your first page to mobile-friendly layouts.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=8",
    playlistId: "PL77LFcZGHYRCU0QUI0JgXYext-1ctMvo0",
    thumbnailVideoId: "pQN-pnXPaVg",
    rating: 4.9,
    reviewCount: 2400,
    badge: "Hot",
    badgeClass: "badge-orange",
    featured: true,
    free: true,
    lessons: [
      { id: 1, title: "Learn HTML – Full Tutorial", videoId: "pQN-pnXPaVg", duration: "1:32:47" },
      { id: 2, title: "HTML Forms & Input Elements", videoId: "UB1O30fR-EE", duration: "28:15" },
      { id: 3, title: "CSS Crash Course", videoId: "yfoY53QXEnI", duration: "1:25:00" },
      { id: 4, title: "CSS Flexbox", videoId: "JJSoEo8JSnc", duration: "18:42" },
      { id: 5, title: "Responsive Web Design", videoId: "srvUrASNj0s", duration: "35:20" },
      { id: 6, title: "CSS Zero to Hero", videoId: "1Rs2ND1ryYc", duration: "4:32:00" }
    ]
  },
  {
    id: "digital-marketing-mastery",
    title: "Digital Marketing Mastery",
    description: "Learn SEO, content strategy, and communication skills to grow any business online.",
    category: "Business",
    instructor: "HubSpot Academy",
    instructorAvatar: "https://i.pravatar.cc/40?img=9",
    playlistId: "PLkLb693fnlVw1O74n0G2RsgqHRQ9F_80",
    thumbnailVideoId: "kqtD5dpn9C8",
    rating: 4.7,
    reviewCount: 890,
    badge: "New",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "What is Digital Marketing?", videoId: "kqtD5dpn9C8", duration: "8:15" },
      { id: 2, title: "SEO Fundamentals", videoId: "xsVTqzratPs", duration: "12:30" },
      { id: 3, title: "Business Writing Essentials", videoId: "8S0FDjFBj8o", duration: "18:20" },
      { id: 4, title: "Public Speaking for Brands", videoId: "Unzc731iCUY", duration: "9:58" }
    ]
  },
  {
    id: "data-science-python",
    title: "Data Science with Python",
    description: "Analyze data with pandas and matplotlib — build real data science skills from scratch.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=12",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "r-uOLxNrNk8",
    rating: 4.9,
    reviewCount: 1800,
    badge: "Popular",
    badgeClass: "badge-blue",
    featured: true,
    free: true,
    lessons: [
      { id: 1, title: "Data Analysis with Python – Intro", videoId: "r-uOLxNrNk8", duration: "10:05" },
      { id: 2, title: "Reading Data with Pandas", videoId: "ZyhVh-qRZPA", duration: "15:30" },
      { id: 3, title: "Data Visualization", videoId: "0P7QnIQDBJY", duration: "22:10" },
      { id: 4, title: "Machine Learning Overview", videoId: "i_LwzRVP7bg", duration: "3:52:00" }
    ]
  },
  {
    id: "javascript-full-course",
    title: "JavaScript Full Course",
    description: "Complete JavaScript tutorial for beginners — variables, functions, DOM, and modern ES6+ features.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=15",
    playlistId: "PL8p2bkYVfsN4N1ZXTEC9etH2zwq-dfcN7",
    thumbnailVideoId: "PkZNo7MFNFg",
    rating: 4.9,
    reviewCount: 3200,
    badge: "Bestseller",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "JavaScript Basics – Full Course", videoId: "PkZNo7MFNFg", duration: "3:26:43" },
      { id: 2, title: "JavaScript ES6 Features", videoId: "NCwa_xi0Uuc", duration: "1:12:00" },
      { id: 3, title: "Async JavaScript", videoId: "PoRJizFvM7s", duration: "45:20" },
      { id: 4, title: "100+ Web Dev Tips", videoId: "erEgovG9WBs", duration: "1:05:00" }
    ]
  },
  {
    id: "python-basics",
    title: "Python for Beginners",
    description: "Learn Python programming from zero — syntax, data types, loops, functions, and practical projects.",
    category: "Coding",
    instructor: "Programming with Mosh",
    instructorAvatar: "https://i.pravatar.cc/40?img=11",
    playlistId: "PLrWUxd6__LlOznqgt5k0sHwDDbOm0g5H8",
    thumbnailVideoId: "_uQrJ0TkZlc",
    rating: 4.8,
    reviewCount: 2100,
    badge: "Hot",
    badgeClass: "badge-orange",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Python for Beginners – Full Course", videoId: "_uQrJ0TkZlc", duration: "6:14:07" },
      { id: 2, title: "Variables & Data Types", videoId: "cQT33yu9pY8", duration: "12:40" },
      { id: 3, title: "Python Beginners Crash Course", videoId: "eWRfhZUzrAc", duration: "4:19:00" },
      { id: 4, title: "Learn Python – Full Course", videoId: "rfscVS0vtbw", duration: "4:26:00" }
    ]
  },
  {
    id: "react-crash-course",
    title: "React.js Crash Course",
    description: "Build interactive UIs with React — components, state, hooks, and a complete project walkthrough.",
    category: "Coding",
    instructor: "Traversy Media",
    instructorAvatar: "https://i.pravatar.cc/40?img=20",
    playlistId: "PL4cUxe5kc5jqmHM_VLm3VXLWwtqroFxt2",
    thumbnailVideoId: "w7ejDZ8SWv8",
    rating: 4.8,
    reviewCount: 1500,
    badge: "Popular",
    badgeClass: "badge-blue",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "React JS Crash Course 2024", videoId: "w7ejDZ8SWv8", duration: "2:05:30" },
      { id: 2, title: "Full Stack Web Development", videoId: "nu_pCVPKzTk", duration: "6:49:00" },
      { id: 3, title: "Web Development Best Practices", videoId: "erEgovG9WBs", duration: "1:05:00" },
      { id: 4, title: "CSS Quick Refresher", videoId: "1PnVor36_40", duration: "20:00" }
    ]
  },
  {
    id: "sql-beginners",
    title: "SQL for Beginners",
    description: "Query databases with SQL — SELECT, JOINs, aggregations, and real-world database skills.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=14",
    playlistId: "PL7827kDwv4eBYMU6nOEeq2",
    thumbnailVideoId: "HXV3zeQKqGY",
    rating: 4.7,
    reviewCount: 980,
    badge: "New",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "SQL Tutorial – Full Course", videoId: "HXV3zeQKqGY", duration: "4:20:00" },
      { id: 2, title: "Data Structures in C/C++", videoId: "B31LgI4Y4DQ", duration: "2:01:00" },
      { id: 3, title: "Intro to Programming", videoId: "zOjov-2OZ0E", duration: "1:52:00" },
      { id: 4, title: "Working with Data in Python", videoId: "ZyhVh-qRZPA", duration: "15:30" }
    ]
  },
  {
    id: "graphic-design-basics",
    title: "Graphic Design Basics",
    description: "Learn color theory, typography, layout, and visual hierarchy to create professional designs.",
    category: "Design",
    instructor: "GCFGlobal",
    instructorAvatar: "https://i.pravatar.cc/40?img=25",
    playlistId: "PL8p2bkYVfsN4N1ZXTEC9etH2zwq-dfcN7",
    thumbnailVideoId: "sByzHoiYFX0",
    rating: 4.6,
    reviewCount: 650,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "What is Graphic Design?", videoId: "sByzHoiYFX0", duration: "6:30" },
      { id: 2, title: "UI/UX Design in Figma", videoId: "c9Wg6Cb_YlU", duration: "1:26:21" },
      { id: 3, title: "Photoshop Essentials", videoId: "IyR_uYsRdPs", duration: "33:00" },
      { id: 4, title: "CSS for Layout & Typography", videoId: "1Rs2ND1ryYc", duration: "4:32:00" }
    ]
  },
  {
    id: "public-speaking",
    title: "Public Speaking Confidence",
    description: "Overcome fear, structure compelling talks, and deliver presentations with confidence.",
    category: "Personal",
    instructor: "TED-Ed",
    instructorAvatar: "https://i.pravatar.cc/40?img=9",
    playlistId: "PLJicmE8fK0E2JzHQDHCSLrEp4wbuzrmQ3",
    thumbnailVideoId: "Unzc731iCUY",
    rating: 4.7,
    reviewCount: 720,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "How to Speak So People Want to Listen", videoId: "Unzc731iCUY", duration: "9:58" },
      { id: 2, title: "Body Language & Presence", videoId: "Ks-_Mh1QhMc", duration: "21:02" },
      { id: 3, title: "Overcoming Stage Fright", videoId: "M3aw2ih626s", duration: "8:30" },
      { id: 4, title: "Business Writing Skills", videoId: "8S0FDjFBj8o", duration: "18:20" }
    ]
  },
  {
    id: "excel-essentials",
    title: "Microsoft Excel Essentials",
    description: "Spreadsheets, formulas, charts, and pivot tables — everything you need for work and school.",
    category: "Business",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=30",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "UsdedFoTA68",
    rating: 4.6,
    reviewCount: 1100,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Pivot Tables & Data Analysis", videoId: "UsdedFoTA68", duration: "22:30" },
      { id: 2, title: "Data Analysis with Pandas", videoId: "ZyhVh-qRZPA", duration: "15:30" },
      { id: 3, title: "Data Visualization", videoId: "0P7QnIQDBJY", duration: "22:10" },
      { id: 4, title: "Intro to Programming Logic", videoId: "zOjov-2OZ0E", duration: "1:52:00" }
    ]
  },
  {
    id: "cybersecurity-101",
    title: "Cybersecurity 101",
    description: "Understand threats, network security, encryption, and how to protect yourself and organizations online.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=18",
    playlistId: "PL870822A085BF6F7E",
    thumbnailVideoId: "inWWhr5tnEA",
    rating: 4.8,
    reviewCount: 1400,
    badge: "Popular",
    badgeClass: "badge-blue",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Cybersecurity Full Course", videoId: "inWWhr5tnEA", duration: "4:18:00" },
      { id: 2, title: "Network Security Basics", videoId: "qiQR5rTSshw", duration: "16:45" },
      { id: 3, title: "Git Security & Version Control", videoId: "RGOj5yH7evk", duration: "1:09:00" },
      { id: 4, title: "Computer Science Foundations", videoId: "zOjov-2OZ0E", duration: "1:52:00" }
    ]
  },
  {
    id: "nodejs-backend",
    title: "Node.js Backend Development",
    description: "Build server-side applications with Node.js — APIs, npm, and full-stack JavaScript workflows.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=16",
    playlistId: "PL4cUxe5kc5jqmHM_VLm3VXLWwtqroFxt2",
    thumbnailVideoId: "Oe421EPjeBE",
    rating: 4.8,
    reviewCount: 1650,
    badge: "Hot",
    badgeClass: "badge-orange",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Node.js Full Course", videoId: "Oe421EPjeBE", duration: "4:42:00" },
      { id: 2, title: "Node.js Tutorial", videoId: "TlB_eWDSMt4", duration: "1:00:00" },
      { id: 3, title: "Full Stack Web Development", videoId: "nu_pCVPKzTk", duration: "6:49:00" },
      { id: 4, title: "JavaScript Async Patterns", videoId: "PoRJizFvM7s", duration: "45:20" }
    ]
  },
  {
    id: "git-github",
    title: "Git & GitHub for Developers",
    description: "Version control from scratch — commits, branches, pull requests, and team collaboration on GitHub.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=22",
    playlistId: "PL870822A085BF6F7E",
    thumbnailVideoId: "RGOj5yH7evk",
    rating: 4.9,
    reviewCount: 2800,
    badge: "Bestseller",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Git and GitHub Crash Course", videoId: "RGOj5yH7evk", duration: "1:09:00" },
      { id: 2, title: "Web Dev Workflow Tips", videoId: "erEgovG9WBs", duration: "1:05:00" },
      { id: 3, title: "Intro to Programming", videoId: "zOjov-2OZ0E", duration: "1:52:00" },
      { id: 4, title: "Cybersecurity Awareness", videoId: "inWWhr5tnEA", duration: "4:18:00" }
    ]
  },
  {
    id: "docker-devops",
    title: "Docker & DevOps Basics",
    description: "Containerize applications with Docker — images, containers, and modern deployment fundamentals.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=19",
    playlistId: "PL870822A085BF6F7E",
    thumbnailVideoId: "fqMOX6JJhGo",
    rating: 4.7,
    reviewCount: 920,
    badge: "New",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Docker Full Course", videoId: "fqMOX6JJhGo", duration: "3:00:00" },
      { id: 2, title: "Node.js Deployment", videoId: "Oe421EPjeBE", duration: "4:42:00" },
      { id: 3, title: "Git for DevOps Teams", videoId: "RGOj5yH7evk", duration: "1:09:00" },
      { id: 4, title: "Network Security", videoId: "qiQR5rTSshw", duration: "16:45" }
    ]
  },
  {
    id: "java-programming",
    title: "Java Programming",
    description: "Learn Java from the ground up — OOP, classes, collections, and building real applications.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=13",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "eIrMbAQSU34",
    rating: 4.8,
    reviewCount: 1750,
    badge: "Popular",
    badgeClass: "badge-blue",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Java Full Course", videoId: "eIrMbAQSU34", duration: "12:30:00" },
      { id: 2, title: "Intro to Programming", videoId: "zOjov-2OZ0E", duration: "1:52:00" },
      { id: 3, title: "Data Structures C/C++", videoId: "B31LgI4Y4DQ", duration: "2:01:00" },
      { id: 4, title: "Object-Oriented Concepts", videoId: "hEgO047GxaQ", duration: "6:00:00" }
    ]
  },
  {
    id: "kotlin-mobile",
    title: "Kotlin for Android",
    description: "Build Android apps with Kotlin — modern syntax, UI components, and mobile development basics.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=21",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "F9UC9DY-vIU",
    rating: 4.7,
    reviewCount: 840,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Kotlin Full Course", videoId: "F9UC9DY-vIU", duration: "4:39:00" },
      { id: 2, title: "Flutter Mobile Development", videoId: "VPvVD8t02U8", duration: "37:00" },
      { id: 3, title: "Java Foundations", videoId: "eIrMbAQSU34", duration: "12:30:00" },
      { id: 4, title: "Programming Intro", videoId: "zOjov-2OZ0E", duration: "1:52:00" }
    ]
  },
  {
    id: "flutter-mobile",
    title: "Flutter Mobile Apps",
    description: "Create cross-platform mobile apps with Flutter and Dart — widgets, layouts, and responsive UI.",
    category: "Coding",
    instructor: "Google Developers",
    instructorAvatar: "https://i.pravatar.cc/40?img=24",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "VPvVD8t02U8",
    rating: 4.7,
    reviewCount: 760,
    badge: "New",
    badgeClass: "badge-yellow",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Flutter Course for Beginners", videoId: "VPvVD8t02U8", duration: "37:00" },
      { id: 2, title: "Kotlin for Android", videoId: "F9UC9DY-vIU", duration: "4:39:00" },
      { id: 3, title: "UI/UX for Mobile Apps", videoId: "c9Wg6Cb_YlU", duration: "1:26:21" },
      { id: 4, title: "React Native Concepts", videoId: "w7ejDZ8SWv8", duration: "2:05:30" }
    ]
  },
  {
    id: "angular-framework",
    title: "Angular Framework",
    description: "Enterprise front-end development with Angular — components, services, routing, and TypeScript.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=17",
    playlistId: "PL4cUxe5kc5jqmHM_VLm3VXLWwtqroFxt2",
    thumbnailVideoId: "3dHNOWTI7H8",
    rating: 4.6,
    reviewCount: 690,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Angular Full Course", videoId: "3dHNOWTI7H8", duration: "9:00:00" },
      { id: 2, title: "JavaScript ES6+", videoId: "NCwa_xi0Uuc", duration: "1:12:00" },
      { id: 3, title: "TypeScript via Full Stack Course", videoId: "nu_pCVPKzTk", duration: "6:49:00" },
      { id: 4, title: "Web Dev Best Practices", videoId: "erEgovG9WBs", duration: "1:05:00" }
    ]
  },
  {
    id: "machine-learning",
    title: "Machine Learning Basics",
    description: "Introduction to ML — supervised learning, models, data prep, and practical AI workflows.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=12",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "i_LwzRVP7bg",
    rating: 4.8,
    reviewCount: 1320,
    badge: "Popular",
    badgeClass: "badge-blue",
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Machine Learning for Everybody", videoId: "i_LwzRVP7bg", duration: "3:52:00" },
      { id: 2, title: "Data Analysis Intro", videoId: "r-uOLxNrNk8", duration: "10:05" },
      { id: 3, title: "Pandas for Data Prep", videoId: "ZyhVh-qRZPA", duration: "15:30" },
      { id: 4, title: "Data Visualization", videoId: "0P7QnIQDBJY", duration: "22:10" }
    ]
  },
  {
    id: "programming-fundamentals",
    title: "Programming Fundamentals",
    description: "Start coding from zero — logic, algorithms, and core concepts every developer needs.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=10",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "zOjov-2OZ0E",
    rating: 4.9,
    reviewCount: 2200,
    badge: "Bestseller",
    badgeClass: "badge-yellow",
    featured: true,
    free: true,
    lessons: [
      { id: 1, title: "Intro to Programming & CS", videoId: "zOjov-2OZ0E", duration: "1:52:00" },
      { id: 2, title: "Learn Python – Full Course", videoId: "rfscVS0vtbw", duration: "4:26:00" },
      { id: 3, title: "Python for Beginners", videoId: "hEgO047GxaQ", duration: "6:00:00" },
      { id: 4, title: "C++ Programming", videoId: "vLnPwxZdW4Y", duration: "4:00:00" }
    ]
  },
  {
    id: "cpp-programming",
    title: "C++ Programming",
    description: "Systems programming with C++ — memory, pointers, OOP, and performance-focused coding.",
    category: "Coding",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=14",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "vLnPwxZdW4Y",
    rating: 4.7,
    reviewCount: 980,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "C++ Full Course", videoId: "vLnPwxZdW4Y", duration: "4:00:00" },
      { id: 2, title: "Data Structures C/C++", videoId: "B31LgI4Y4DQ", duration: "2:01:00" },
      { id: 3, title: "Intro to Programming", videoId: "zOjov-2OZ0E", duration: "1:52:00" },
      { id: 4, title: "Calculus for Programmers", videoId: "9vKqVkMQHKk", duration: "17:00" }
    ]
  },
  {
    id: "adobe-photoshop",
    title: "Adobe Photoshop Essentials",
    description: "Edit photos and create digital artwork — layers, tools, retouching, and design workflows.",
    category: "Design",
    instructor: "Envato Tuts+",
    instructorAvatar: "https://i.pravatar.cc/40?img=25",
    playlistId: "PL8p2bkYVfsN4N1ZXTEC9etH2zwq-dfcN7",
    thumbnailVideoId: "IyR_uYsRdPs",
    rating: 4.6,
    reviewCount: 540,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Photoshop for Beginners", videoId: "IyR_uYsRdPs", duration: "33:00" },
      { id: 2, title: "Graphic Design Foundations", videoId: "sByzHoiYFX0", duration: "6:30" },
      { id: 3, title: "UI Design in Figma", videoId: "c9Wg6Cb_YlU", duration: "1:26:21" },
      { id: 4, title: "CSS for Web Design", videoId: "1PnVor36_40", duration: "20:00" }
    ]
  },
  {
    id: "business-communication",
    title: "Business Communication",
    description: "Write clearly, present confidently, and communicate professionally in any workplace.",
    category: "Business",
    instructor: "Coursera",
    instructorAvatar: "https://i.pravatar.cc/40?img=9",
    playlistId: "PLJicmE8fK0E2JzHQDHCSLrEp4wbuzrmQ3",
    thumbnailVideoId: "8S0FDjFBj8o",
    rating: 4.7,
    reviewCount: 610,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Business Writing Essentials", videoId: "8S0FDjFBj8o", duration: "18:20" },
      { id: 2, title: "Public Speaking Skills", videoId: "Unzc731iCUY", duration: "9:58" },
      { id: 3, title: "Body Language on Stage", videoId: "Ks-_Mh1QhMc", duration: "21:02" },
      { id: 4, title: "Digital Marketing Basics", videoId: "kqtD5dpn9C8", duration: "8:15" }
    ]
  },
  {
    id: "hr-management",
    title: "HR Management Fundamentals",
    description: "Recruiting, onboarding, employee relations, and building strong teams in any organization.",
    category: "Personal",
    instructor: "freeCodeCamp",
    instructorAvatar: "https://i.pravatar.cc/40?img=30",
    playlistId: "PL530F7064821C58D9",
    thumbnailVideoId: "k2C5TjS2sh4",
    rating: 4.5,
    reviewCount: 480,
    badge: null,
    badgeClass: null,
    featured: false,
    free: true,
    lessons: [
      { id: 1, title: "Human Resource Management", videoId: "k2C5TjS2sh4", duration: "1:30:00" },
      { id: 2, title: "Business Communication", videoId: "8S0FDjFBj8o", duration: "18:20" },
      { id: 3, title: "Presentation Skills", videoId: "Unzc731iCUY", duration: "9:58" },
      { id: 4, title: "Overcoming Stage Fright", videoId: "M3aw2ih626s", duration: "8:30" }
    ]
  }
];

window.youtubeThumb = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

window.youtubeEmbed = (videoId) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

window.getCourseById = (id) =>
  window.BARWAAQO_COURSES.find((c) => c.id === id);

window.getFeaturedCourses = () =>
  window.BARWAAQO_COURSES.filter((c) => c.featured);

/** Homepage shows exactly 4 courses */
window.getHomeCourses = () => {
  const featured = window.getFeaturedCourses();
  if (featured.length) return featured.slice(0, 4);
  return (window.BARWAAQO_COURSES || []).slice(0, 4);
};
