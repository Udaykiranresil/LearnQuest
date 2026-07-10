import { Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function AdminTreeNode({ node, depth, onAddChild, onUpdate, onRemove }) {
  const [open, setOpen] = useState(true);
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div style={{ marginLeft: depth * 22 }}>
      <div className="flex items-center gap-2 py-1.5 group">
        {!isLeaf ? (
          <button onClick={() => setOpen((o) => !o)} className="shrink-0">
            <ChevronRight
              size={14}
              className={`text-[var(--color-muted)] transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <input
          value={node.title}
          onChange={(e) => onUpdate(node.id, { title: e.target.value })}
          className="flex-1 bg-transparent border-b border-transparent hover:border-[var(--color-panel-line)] focus:border-[var(--color-brass)] outline-none text-sm text-[var(--color-parchment)] py-1 transition-colors"
        />

        {isLeaf && (
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              value={node.xp}
              onChange={(e) => onUpdate(node.id, { xp: Number(e.target.value) })}
              className="w-16 bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-2 py-1 text-xs font-mono text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
            />
            <span className="text-[10px] text-[var(--color-muted)] font-mono">XP</span>
          </div>
        )}

        <button
          onClick={() => onAddChild(node.id)}
          title="Add sub-item"
          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-brass-bright)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
        <button
          onClick={() => onRemove(node.id)}
          title="Remove"
          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-oxblood-bright)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      {!isLeaf && open && (
        <div className="border-l border-[var(--color-panel-line)] ml-1.5">
          {node.children.map((child) => (
            <AdminTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
