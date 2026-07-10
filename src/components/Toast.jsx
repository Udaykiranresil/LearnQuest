import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { BADGE_RULES } from "../lib/gameLogic";

export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end">
      <AnimatePresence>
        {toasts.map((t) => {
          const badge = t.badgeId ? BADGE_RULES.find((b) => b.id === t.badgeId) : null;
          const IconComp = badge ? Icons[badge.icon] || Icons.Shield : Icons.Sparkles;
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, x: 30, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 bg-[var(--color-panel-raised)] border border-[var(--color-brass)] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] min-w-[240px]"
            >
              <div className="w-9 h-9 flex items-center justify-center border border-[var(--color-brass)] shrink-0">
                <IconComp size={16} strokeWidth={1.75} className="text-[var(--color-brass-bright)]" />
              </div>
              <div>
                <div className="eyebrow mb-0.5">
                  {badge ? "Insignia Earned" : "Progress"}
                </div>
                <div className="text-sm text-[var(--color-parchment)]">
                  {badge ? badge.name : t.message}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
