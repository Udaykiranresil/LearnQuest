import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { BADGE_RULES, RARITY } from "../lib/gameLogic";
import { fireBadgeConfetti } from "../lib/confetti";

const RARITY_STYLE = {
  [RARITY.COMMON]: {
    border: "var(--color-brass)",
    glow: "rgba(184,147,91,0.25)",
    label: "Common Insignia",
  },
  [RARITY.RARE]: {
    border: "var(--color-indigo-bright)",
    glow: "rgba(77,123,163,0.3)",
    label: "Rare Insignia",
  },
  [RARITY.EPIC]: {
    border: "var(--color-oxblood-bright)",
    glow: "rgba(178,84,84,0.3)",
    label: "Epic Insignia",
  },
  [RARITY.LEGENDARY]: {
    border: "var(--color-brass-bright)",
    glow: "rgba(212,175,122,0.45)",
    label: "Legendary Insignia",
  },
};

// Shows one badge at a time from the shared queue. Driven by AppContext so
// it announces badges earned from ANY source (subtopic completion, an admin
// approving a project, etc.), not just the page the user happens to be on.
export default function BadgeUnlockToast({ queue, onDismiss }) {
  const badgeId = queue?.[0];
  const badge = badgeId ? BADGE_RULES.find((b) => b.id === badgeId) : null;
  const style = badge ? RARITY_STYLE[badge.rarity] || RARITY_STYLE[RARITY.COMMON] : null;
  const IconComp = badge ? Icons[badge.icon] || Icons.Shield : Icons.Shield;

  useEffect(() => {
    if (!badge) return;
    fireBadgeConfetti();
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      <AnimatePresence mode="wait">
        {badge && (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, x: 36, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={onDismiss}
            className="relative overflow-hidden flex items-center gap-4 bg-[var(--color-panel-raised)] border px-5 py-4 min-w-[280px] cursor-pointer"
            style={{
              borderColor: style.border,
              boxShadow: `0 12px 32px rgba(0,0,0,0.45), 0 0 40px ${style.glow}`,
            }}
          >
            {/* Shimmer sweep */}
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 1.1, delay: 0.15, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 pointer-events-none"
              style={{
                background: `linear-gradient(100deg, transparent, ${style.glow}, transparent)`,
              }}
            />

            <motion.div
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-11 h-11 flex items-center justify-center border shrink-0"
              style={{ borderColor: style.border, perspective: 400 }}
            >
              <IconComp size={19} strokeWidth={1.75} style={{ color: style.border }} />
            </motion.div>

            <div className="relative">
              <div className="eyebrow mb-0.5" style={{ color: style.border }}>
                {style.label} Earned
              </div>
              <div className="text-sm text-[var(--color-parchment)] font-display">
                {badge.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
