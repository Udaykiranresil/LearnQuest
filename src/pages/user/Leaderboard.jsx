import { Flame, Crown } from "lucide-react";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { getRankForXp } from "../../lib/gameLogic";

export default function Leaderboard() {
  const { currentUser, users } = useApp();
  const ranked = [...users]
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.xp - a.xp);

  return (
    <Layout eyebrow="Ranked by Experience" title="Standings">
      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[var(--color-panel-line)] eyebrow">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Rank</div>
          <div className="col-span-2 text-right">Streak</div>
          <div className="col-span-1 text-right">XP</div>
        </div>
        {ranked.map((user, i) => {
          const rank = getRankForXp(user.xp);
          const isMe = user.id === currentUser.id;
          return (
            <div
              key={user.id}
              className={`grid grid-cols-12 px-6 py-4 items-center border-b border-[var(--color-panel-line)] last:border-b-0 ${
                isMe ? "bg-[var(--color-brass)]/[0.06]" : ""
              }`}
            >
              <div className="col-span-1 font-mono text-sm text-[var(--color-muted)] flex items-center gap-1.5">
                {i === 0 && <Crown size={13} strokeWidth={1.8} className="text-[var(--color-brass-bright)]" />}
                {i + 1}
              </div>
              <div className="col-span-5 text-sm text-[var(--color-parchment)]">
                {user.displayName}
                {isMe && (
                  <span className="eyebrow ml-2 text-[9px]">You</span>
                )}
              </div>
              <div className="col-span-3 font-display text-sm text-[var(--color-brass-bright)]">
                {rank.name}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5 font-mono text-sm text-[var(--color-parchment)]">
                <Flame
                  size={13}
                  strokeWidth={1.8}
                  className={user.streak > 0 ? "text-[var(--color-brass-bright)]" : "text-[var(--color-panel-line)]"}
                />
                {user.streak}
              </div>
              <div className="col-span-1 text-right font-mono text-sm text-[var(--color-parchment)]">
                {user.xp.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
