import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import { fireLevelUpConfetti } from "../lib/confetti";

// Shown whenever AppContext detects the current user's XP crossed into a
// new rank threshold, regardless of which page triggered the XP gain.
export default function LevelUpModal({ event, onDismiss }) {
  useEffect(() => {
    if (!event) return;
    fireLevelUpConfetti();
    const timer = setTimeout(onDismiss, 4200);
    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-void)]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center px-14 py-12 border border-[var(--color-brass)] bg-[var(--color-panel)]"
            style={{ boxShadow: "0 0 0 1px rgba(184,147,91,0.15), 0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(184,147,91,0.18)" }}
          >
            {/* Corner ticks, echoing the astrolabe/instrument motif used elsewhere */}
            {["-top-px -left-px", "-top-px -right-px", "-bottom-px -left-px", "-bottom-px -right-px"].map((pos) => (
              <span
                key={pos}
                className={`absolute ${pos} w-3 h-3 border-[var(--color-brass)] ${
                  pos.includes("top") ? "border-t" : "border-b"
                } ${pos.includes("left") ? "border-l" : "border-r"}`}
              />
            ))}

            <motion.div
              initial={{ rotate: -20, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 14 }}
              className="w-16 h-16 flex items-center justify-center border border-[var(--color-brass)] mb-6"
              style={{
                boxShadow: "0 0 30px rgba(212,175,122,0.35)",
              }}
            >
              <Sparkle size={28} strokeWidth={1.5} className="text-[var(--color-brass-bright)]" />
            </motion.div>

            <div className="eyebrow mb-2 tracking-[0.2em]">Rank Attained</div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-4xl text-[var(--color-parchment)] text-center mb-1"
            >
              {event?.name}
            </motion.div>
            <div className="font-mono text-xs text-[var(--color-brass-bright)] tracking-wide">
              LEVEL {event?.level}
            </div>

            <button
              onClick={onDismiss}
              className="mt-8 text-xs text-[var(--color-muted)] hover:text-[var(--color-parchment)] border-b border-transparent hover:border-[var(--color-panel-line)] transition-colors"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
