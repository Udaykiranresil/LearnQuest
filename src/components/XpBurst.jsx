import { AnimatePresence, motion } from "framer-motion";

// Renders floating "+XP" callouts anchored to arbitrary viewport coordinates.
// `bursts` is [{ key, x, y, amount }] — spawn/cleanup is managed by the caller.
export default function XpBurst({ bursts }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -54, scale: 1 }}
            exit={{ opacity: 0, y: -74, scale: 0.9 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "fixed", left: b.x, top: b.y }}
            className="flex items-center gap-1 font-mono text-sm font-semibold text-[var(--color-verdant-bright)] -translate-x-1/2 -translate-y-1/2"
          >
            +{b.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
