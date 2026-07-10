// Mock data layer. This whole module is the seam we'll swap for Supabase
// queries later — every consumer reads through the functions at the bottom,
// not the raw arrays, so the swap touches one file.

export const COURSES = [
  {
    id: "course-web-arch",
    title: "Foundations of Web Architecture",
    description:
      "How requests, servers, and browsers actually agree on anything. Start here before anything else.",
    icon: "Network",
    difficulty: "Beginner",
    topics: [
      {
        id: "wa-t1",
        title: "The Request Lifecycle",
        children: [
          { id: "wa-t1-s1", title: "DNS resolution and connection setup", xp: 40 },
          { id: "wa-t1-s2", title: "HTTP methods and status codes", xp: 40 },
          {
            id: "wa-t1-s3",
            title: "Headers, caching, and content negotiation",
            children: [
              { id: "wa-t1-s3-a", title: "Cache-Control and ETags", xp: 30 },
              { id: "wa-t1-s3-b", title: "Content-Type and Accept headers", xp: 30 },
            ],
          },
        ],
      },
      {
        id: "wa-t2",
        title: "Client and Server Boundaries",
        children: [
          { id: "wa-t2-s1", title: "Server-side vs client-side rendering", xp: 45 },
          { id: "wa-t2-s2", title: "APIs, contracts, and statelessness", xp: 45 },
        ],
      },
      {
        id: "wa-t3",
        title: "Security Fundamentals",
        children: [
          { id: "wa-t3-s1", title: "CORS and the same-origin policy", xp: 50 },
          { id: "wa-t3-s2", title: "Authentication vs authorization", xp: 50 },
          { id: "wa-t3-s3", title: "Common injection vectors", xp: 55 },
        ],
      },
    ],
    projectId: "proj-portfolio-api",
  },
  {
    id: "course-db-eng",
    title: "Database Engineering",
    description:
      "Schemas, indexes, and the trade-offs that decide whether a query takes 4ms or 4 seconds.",
    icon: "Database",
    difficulty: "Intermediate",
    topics: [
      {
        id: "db-t1",
        title: "Relational Modeling",
        children: [
          { id: "db-t1-s1", title: "Normal forms and normalization", xp: 45 },
          { id: "db-t1-s2", title: "Keys, constraints, and relationships", xp: 45 },
        ],
      },
      {
        id: "db-t2",
        title: "Indexing and Query Performance",
        children: [
          { id: "db-t2-s1", title: "B-tree indexes and when they help", xp: 55 },
          { id: "db-t2-s2", title: "Reading an execution plan", xp: 55 },
          { id: "db-t2-s3", title: "N+1 queries and how to spot them", xp: 50 },
        ],
      },
      {
        id: "db-t3",
        title: "Transactions and Isolation",
        children: [
          { id: "db-t3-s1", title: "ACID properties in practice", xp: 50 },
          { id: "db-t3-s2", title: "Isolation levels and their trade-offs", xp: 60 },
        ],
      },
    ],
    projectId: "proj-schema-design",
  },
  {
    id: "course-applied-ml",
    title: "Applied Machine Learning",
    description:
      "Building models that hold up outside the notebook — from clean data to a defensible evaluation.",
    icon: "BrainCircuit",
    difficulty: "Advanced",
    topics: [
      {
        id: "ml-t1",
        title: "Data Preparation",
        children: [
          { id: "ml-t1-s1", title: "Handling missing and skewed data", xp: 50 },
          { id: "ml-t1-s2", title: "Feature scaling and encoding", xp: 50 },
        ],
      },
      {
        id: "ml-t2",
        title: "Model Selection",
        children: [
          { id: "ml-t2-s1", title: "Bias-variance trade-off", xp: 60 },
          {
            id: "ml-t2-s2",
            title: "Classical models",
            children: [
              { id: "ml-t2-s2-a", title: "Linear and logistic regression", xp: 40 },
              { id: "ml-t2-s2-b", title: "Decision trees and ensembles", xp: 45 },
            ],
          },
        ],
      },
      {
        id: "ml-t3",
        title: "Evaluation Discipline",
        children: [
          { id: "ml-t3-s1", title: "Train/validation/test splits", xp: 45 },
          { id: "ml-t3-s2", title: "Precision, recall, and when each matters", xp: 55 },
        ],
      },
    ],
    projectId: "proj-ml-pipeline",
  },
  {
    id: "course-systems",
    title: "Systems Programming Fundamentals",
    description:
      "What's actually happening below the language you learned first — memory, processes, and concurrency.",
    icon: "Cpu",
    difficulty: "Advanced",
    topics: [
      {
        id: "sys-t1",
        title: "Memory Management",
        children: [
          { id: "sys-t1-s1", title: "Stack vs heap allocation", xp: 50 },
          { id: "sys-t1-s2", title: "Ownership and lifetimes", xp: 60 },
        ],
      },
      {
        id: "sys-t2",
        title: "Concurrency Primitives",
        children: [
          { id: "sys-t2-s1", title: "Threads vs processes", xp: 50 },
          { id: "sys-t2-s2", title: "Locks, mutexes, and race conditions", xp: 60 },
          { id: "sys-t2-s3", title: "Message passing as an alternative", xp: 55 },
        ],
      },
    ],
    projectId: "proj-cli-tool",
  },
];

export const PROJECTS = [
  {
    id: "proj-portfolio-api",
    courseId: "course-web-arch",
    title: "Build a Contract-First REST API",
    description:
      "Design and ship a small REST API with documented endpoints, proper status codes, and CORS configured correctly.",
    requirements: [
      "At least 4 resource endpoints with correct HTTP verbs",
      "Consistent error response shape",
      "CORS configured for a named origin, not a wildcard",
      "README documenting the contract",
    ],
    xpReward: 200,
    difficulty: "Beginner",
  },
  {
    id: "proj-schema-design",
    courseId: "course-db-eng",
    title: "Design a Normalized Schema Under Load",
    description:
      "Model a schema for a realistic domain, add the indexes it needs, and show a query plan improving after indexing.",
    requirements: [
      "Schema in at least 3rd normal form with a documented exception if any",
      "Two indexes added with before/after EXPLAIN output",
      "One transaction demonstrating isolation handling",
    ],
    xpReward: 220,
    difficulty: "Intermediate",
  },
  {
    id: "proj-ml-pipeline",
    courseId: "course-applied-ml",
    title: "Ship a Reproducible ML Pipeline",
    description:
      "Take a dataset from raw to evaluated model with a pipeline anyone else could re-run and get the same numbers from.",
    requirements: [
      "Data cleaning steps are scripted, not manual",
      "Train/validation/test split with a fixed seed",
      "Evaluation report with at least 2 relevant metrics",
    ],
    xpReward: 260,
    difficulty: "Advanced",
  },
  {
    id: "proj-cli-tool",
    courseId: "course-systems",
    title: "Build a Concurrent CLI Tool",
    description:
      "Write a command-line tool that processes multiple inputs concurrently without data races.",
    requirements: [
      "Correct use of threads or async tasks for concurrent work",
      "No data races under the provided stress test",
      "Clear usage documentation",
    ],
    xpReward: 240,
    difficulty: "Advanced",
  },
];

// 1 admin + 9 learners. Passwords are plaintext here only because this is
// the mock layer — the Supabase pass will hash these server-side.
export const USERS = [
  { id: "u-admin", username: "admin", password: "Admin#2026", role: "admin", displayName: "Uday Kiran", xp: 0, streak: 0, lastActiveDate: null, completedIds: [], badges: [], projectSubmissions: [] },
  { id: "u-01", username: "arjun.rao", password: "Kv7#nP2x", role: "user", displayName: "Arjun Rao", xp: 1850, streak: 12, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a","wa-t1-s3-b","wa-t2-s1","wa-t2-s2","wa-t3-s1","wa-t3-s2","wa-t3-s3","db-t1-s1","db-t1-s2","db-t2-s1"], badges: ["first-step","ten-marks","chapter-closed","iron-streak","architect"], projectSubmissions: [{ projectId: "proj-portfolio-api", repoUrl: "https://github.com/arjunrao/contract-first-api", status: "approved", submittedAt: "2026-06-20T10:00:00Z" }] },
  { id: "u-02", username: "meera.iyer", password: "Rt4$qL8m", role: "user", displayName: "Meera Iyer", xp: 3120, streak: 21, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a","wa-t1-s3-b","wa-t2-s1","wa-t2-s2","wa-t3-s1","wa-t3-s2","wa-t3-s3","db-t1-s1","db-t1-s2","db-t2-s1","db-t2-s2","db-t2-s3","db-t3-s1","db-t3-s2","ml-t1-s1"], badges: ["first-step","ten-marks","chapter-closed","iron-streak","architect","shipped"], projectSubmissions: [{ projectId: "proj-portfolio-api", repoUrl: "https://github.com/meeraiyer/rest-contract", status: "approved", submittedAt: "2026-06-10T10:00:00Z" }, { projectId: "proj-schema-design", repoUrl: "https://github.com/meeraiyer/schema-under-load", status: "pending", submittedAt: "2026-07-08T10:00:00Z" }] },
  { id: "u-03", username: "kabir.shah", password: "Zx9!wN3p", role: "user", displayName: "Kabir Shah", xp: 420, streak: 3, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a"], badges: ["first-step"], projectSubmissions: [] },
  { id: "u-04", username: "ananya.das", password: "Fb6&hK1v", role: "user", displayName: "Ananya Das", xp: 980, streak: 0, lastActiveDate: "2026-07-02T10:00:00Z", completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a","wa-t1-s3-b","wa-t2-s1"], badges: ["first-step","ten-marks"], projectSubmissions: [] },
  { id: "u-05", username: "rohan.verma", password: "Qm2@dS5t", role: "user", displayName: "Rohan Verma", xp: 60, streak: 1, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1"], badges: ["first-step"], projectSubmissions: [] },
  { id: "u-06", username: "diya.nair", password: "Wp8#jR4x", role: "user", displayName: "Diya Nair", xp: 2440, streak: 8, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a","wa-t1-s3-b","wa-t2-s1","wa-t2-s2","wa-t3-s1","wa-t3-s2","wa-t3-s3","db-t1-s1","db-t1-s2"], badges: ["first-step","ten-marks","chapter-closed","iron-streak"], projectSubmissions: [{ projectId: "proj-portfolio-api", repoUrl: "https://github.com/diyanair/web-arch-api", status: "approved", submittedAt: "2026-06-25T10:00:00Z" }] },
  { id: "u-07", username: "vikram.singh", password: "Lc3%gT7n", role: "user", displayName: "Vikram Singh", xp: 0, streak: 0, lastActiveDate: null, completedIds: [], badges: [], projectSubmissions: [] },
  { id: "u-08", username: "priya.menon", password: "Yh5^bV9z", role: "user", displayName: "Priya Menon", xp: 150, streak: 2, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2"], badges: ["first-step"], projectSubmissions: [] },
  { id: "u-09", username: "aditya.kumar", password: "Nx1*mZ6q", role: "user", displayName: "Aditya Kumar", xp: 4380, streak: 34, lastActiveDate: new Date().toISOString(), completedIds: ["wa-t1-s1","wa-t1-s2","wa-t1-s3-a","wa-t1-s3-b","wa-t2-s1","wa-t2-s2","wa-t3-s1","wa-t3-s2","wa-t3-s3","db-t1-s1","db-t1-s2","db-t2-s1","db-t2-s2","db-t2-s3","db-t3-s1","db-t3-s2","ml-t1-s1","ml-t1-s2","ml-t2-s1","ml-t2-s2-a","ml-t2-s2-b","ml-t3-s1"], badges: ["first-step","ten-marks","chapter-closed","iron-streak","unbroken","architect","shipped"], projectSubmissions: [{ projectId: "proj-portfolio-api", repoUrl: "https://github.com/adityakumar/rest-api-contract", status: "approved", submittedAt: "2026-05-15T10:00:00Z" }, { projectId: "proj-schema-design", repoUrl: "https://github.com/adityakumar/db-schema-design", status: "approved", submittedAt: "2026-06-18T10:00:00Z" }] },
];

export function findUserByUsername(username) {
  return USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function getProjectsForCourse(courseId) {
  return PROJECTS.filter((p) => p.courseId === courseId);
}

export function getCourseById(id) {
  return COURSES.find((c) => c.id === id);
}

export function getProjectById(id) {
  return PROJECTS.find((p) => p.id === id);
}
