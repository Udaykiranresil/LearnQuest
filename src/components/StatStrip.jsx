import { Flame } from "lucide-react";
import { getRankForXp } from "../lib/gameLogic";

export default function StatStrip({ user }) {
  const rank = getRankForXp(user.xp);
  return (
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-2">
        <span className="eyebrow">Rank</span>
        <span className="font-display text-sm text-[var(--color-brass-bright)]">
          {rank.name}
        </span>
      </div>
      <div className="w-px h-4 bg-[var(--color-panel-line)]" />
      <div className="flex items-center gap-2">
        <span className="eyebrow">XP</span>
        <span className="font-mono text-sm text-[var(--color-parchment)]">
          {user.xp.toLocaleString()}
        </span>
      </div>
      <div className="w-px h-4 bg-[var(--color-panel-line)]" />
      <div className="flex items-center gap-1.5">
        <Flame
          size={15}
          strokeWidth={1.75}
          className={user.streak > 0 ? "text-[var(--color-brass-bright)]" : "text-[var(--color-muted)]"}
        />
        <span className="font-mono text-sm text-[var(--color-parchment)]">
          {user.streak}
        </span>
      </div>
    </div>
  );
}
