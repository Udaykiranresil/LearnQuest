import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Check, Circle } from "lucide-react";
import { getNodeProgress } from "../lib/courseTree";

// Renders one node of the Course -> Topic -> Subtopic(s) tree. Leaves are
// checkable; parent nodes show aggregate progress and expand/collapse.
export default function TopicNode({
  node,
  index,
  depth,
  completedIds,
  onToggleLeaf,
  numberPrefix = "",
}) {
  const [open, setOpen] = useState(depth < 1);
  const isLeaf = !node.children || node.children.length === 0;
  const number = `${numberPrefix}${index + 1}`;
  const progress = isLeaf ? null : getNodeProgress(node, completedIds);
  const done = isLeaf && completedIds.includes(node.id);

  if (isLeaf) {
    return (
      <button
        onClick={(e) => onToggleLeaf(node, e)}
        className={`w-full flex items-center gap-3.5 text-left py-3 pl-[var(--indent)] pr-4 border-b border-[var(--color-panel-line)] transition-colors hover:bg-[var(--color-panel-raised)]/50 group`}
        style={{ "--indent": `${depth * 28 + 16}px` }}
      >
        <span className="font-mono text-xs text-[var(--color-muted)] w-10 shrink-0">
          {number}
        </span>
        <span
          className={`flex-1 text-sm ${
            done ? "text-[var(--color-muted)] line-through" : "text-[var(--color-parchment)]"
          }`}
        >
          {node.title}
        </span>
        <span className="font-mono text-xs text-[var(--color-brass)] shrink-0">
          {node.xp} XP
        </span>
        <span
          className={`w-5 h-5 flex items-center justify-center border shrink-0 transition-colors ${
            done
              ? "bg-[var(--color-verdant)] border-[var(--color-verdant)]"
              : "border-[var(--color-panel-line)] group-hover:border-[var(--color-brass)]"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.span
                key="done"
                initial={{ scale: 0, rotate: -35 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="flex items-center justify-center"
              >
                <Check size={13} strokeWidth={2.5} className="text-[var(--color-void)]" />
              </motion.span>
            ) : (
              <Circle key="empty" size={0} />
            )}
          </AnimatePresence>
        </span>
      </button>
    );
  }

  return (
    <div className="border-b border-[var(--color-panel-line)] last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3.5 text-left py-3.5 pl-[var(--indent)] pr-4 hover:bg-[var(--color-panel-raised)]/40 transition-colors"
        style={{ "--indent": `${depth * 28 + 16}px` }}
      >
        <ChevronRight
          size={15}
          strokeWidth={2}
          className={`shrink-0 text-[var(--color-muted)] transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span className="font-mono text-xs text-[var(--color-brass)] w-8 shrink-0">
          {number}
        </span>
        <span className="flex-1 font-display text-[15px] text-[var(--color-parchment)]">
          {node.title}
        </span>
        <span className="font-mono text-xs text-[var(--color-muted)] shrink-0">
          {progress.done}/{progress.total}
        </span>
      </button>
      {open && (
        <div>
          {node.children.map((child, i) => (
            <TopicNode
              key={child.id}
              node={child}
              index={i}
              depth={depth + 1}
              completedIds={completedIds}
              onToggleLeaf={onToggleLeaf}
              numberPrefix={`${number}.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
