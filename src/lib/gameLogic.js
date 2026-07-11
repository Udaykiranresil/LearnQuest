// Core progression system for LearnQuest.
// Deliberately not a flat "1000xp = level up" curve — each rank requires
// more than the last, mirroring how mastery gets harder to earn over time.

export const RANKS = [
  { level: 1, name: "Initiate", threshold: 0 },
  { level: 2, name: "Apprentice", threshold: 150 },
  { level: 3, name: "Journeyman", threshold: 400 },
  { level: 4, name: "Adept", threshold: 800 },
  { level: 5, name: "Scholar", threshold: 1400 },
  { level: 6, name: "Artisan", threshold: 2200 },
  { level: 7, name: "Sage", threshold: 3200 },
  { level: 8, name: "Master", threshold: 4500 },
  { level: 9, name: "Grandmaster", threshold: 6200 },
  { level: 10, name: "Laureate", threshold: 8500 },
];

export function getRankForXp(xp) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.threshold) current = rank;
  }
  return current;
}

export function getNextRank(xp) {
  const current = getRankForXp(xp);
  const next = RANKS.find((r) => r.level === current.level + 1);
  return next || null;
}

// Returns 0..1 progress toward the next rank, for ring / bar rendering.
export function getRankProgress(xp) {
  const current = getRankForXp(xp);
  const next = getNextRank(xp);
  if (!next) return 1;
  const span = next.threshold - current.threshold;
  const gained = xp - current.threshold;
  return Math.min(1, Math.max(0, gained / span));
}

export function isStreakAlive(lastActiveISODate) {
  if (!lastActiveISODate) return false;
  const last = new Date(lastActiveISODate);
  const today = new Date();
  const diffDays = Math.floor(
    (stripTime(today) - stripTime(last)) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 1; // active today or yesterday keeps the streak alive
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function computeStreakUpdate(user) {
  const today = new Date();
  const todayISO = today.toISOString();
  if (!user.lastActiveDate) {
    return { streak: 1, lastActiveDate: todayISO };
  }
  const last = new Date(user.lastActiveDate);
  const diffDays = Math.floor(
    (stripTime(today) - stripTime(last)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) {
    return { streak: user.streak, lastActiveDate: user.lastActiveDate };
  }
  if (diffDays === 1) {
    return { streak: user.streak + 1, lastActiveDate: todayISO };
  }
  return { streak: 1, lastActiveDate: todayISO };
}

// Badge unlock rules — evaluated against a user's live stats each time
// progress changes. Kept declarative so admins can eventually extend this.
// Rarity drives the visual treatment of a badge (shelf border + unlock
// celebration). Kept as a plain tier string so it's easy for admins/design
// to reason about later without touching animation code.
export const RARITY = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

export const BADGE_RULES = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first subtopic.",
    icon: "Footprints",
    rarity: RARITY.COMMON,
    check: (stats) => stats.completedCount >= 1,
  },
  {
    id: "ten-marks",
    name: "Ten Marks",
    description: "Complete ten subtopics.",
    icon: "ListChecks",
    rarity: RARITY.COMMON,
    check: (stats) => stats.completedCount >= 10,
  },
  {
    id: "chapter-closed",
    name: "Chapter Closed",
    description: "Finish an entire course.",
    icon: "BookCheck",
    rarity: RARITY.RARE,
    check: (stats) => stats.coursesCompleted >= 1,
  },
  {
    id: "iron-streak",
    name: "Iron Streak",
    description: "Maintain a 7-day streak.",
    icon: "Flame",
    rarity: RARITY.RARE,
    check: (stats) => stats.streak >= 7,
  },
  {
    id: "unbroken",
    name: "Unbroken",
    description: "Maintain a 30-day streak.",
    icon: "ShieldCheck",
    rarity: RARITY.EPIC,
    check: (stats) => stats.streak >= 30,
  },
  {
    id: "architect",
    name: "Architect",
    description: "Submit your first project.",
    icon: "FolderGit2",
    rarity: RARITY.COMMON,
    check: (stats) => stats.projectsSubmitted >= 1,
  },
  {
    id: "shipped",
    name: "Shipped",
    description: "Get a project approved.",
    icon: "BadgeCheck",
    rarity: RARITY.RARE,
    check: (stats) => stats.projectsApproved >= 1,
  },
  {
    id: "polymath",
    name: "Polymath",
    description: "Complete three separate courses.",
    icon: "Crown",
    rarity: RARITY.LEGENDARY,
    check: (stats) => stats.coursesCompleted >= 3,
  },
];

export function evaluateBadges(stats, alreadyEarnedIds = []) {
  return BADGE_RULES.filter(
    (b) => !alreadyEarnedIds.includes(b.id) && b.check(stats)
  ).map((b) => b.id);
}
