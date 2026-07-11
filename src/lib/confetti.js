import confetti from "canvas-confetti";

// Palette pulled straight from index.css so bursts never clash with the
// explorer/brass theme (no default confetti rainbow).
const BRASS_PALETTE = ["#b8935b", "#d4af7a", "#e8e2d4", "#4a7c59", "#7a6142"];

export function fireLevelUpConfetti() {
  const base = {
    colors: BRASS_PALETTE,
    disableForReducedMotion: true,
    ticks: 220,
  };

  confetti({
    ...base,
    particleCount: 70,
    spread: 65,
    startVelocity: 42,
    scalar: 0.9,
    origin: { x: 0.5, y: 0.4 },
  });

  // A slightly delayed second wave from both sides reads as a "cinematic"
  // beat rather than one flat pop.
  setTimeout(() => {
    confetti({ ...base, particleCount: 35, angle: 60, spread: 55, startVelocity: 40, origin: { x: 0.1, y: 0.5 } });
    confetti({ ...base, particleCount: 35, angle: 120, spread: 55, startVelocity: 40, origin: { x: 0.9, y: 0.5 } });
  }, 180);
}

export function fireBadgeConfetti() {
  confetti({
    colors: BRASS_PALETTE,
    disableForReducedMotion: true,
    particleCount: 40,
    spread: 50,
    startVelocity: 28,
    scalar: 0.7,
    ticks: 160,
    origin: { x: 0.92, y: 0.85 }, // near the bottom-right toast corner
  });
}
