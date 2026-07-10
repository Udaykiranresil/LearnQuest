import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Flame, ArrowRight, Lock } from "lucide-react";
import Layout from "../../components/Layout";
import MasteryRing from "../../components/MasteryRing";
import { useApp } from "../../context/AppContext";
import { getRankForXp, getRankProgress, getNextRank, BADGE_RULES } from "../../lib/gameLogic";
import { getCourseProgress } from "../../lib/courseTree";

export default function Dashboard() {
  const { currentUser, courses, users } = useApp();
  const rank = getRankForXp(currentUser.xp);
  const nextRank = getNextRank(currentUser.xp);
  const ringRatio = getRankProgress(currentUser.xp);

  const inProgress = courses
    .map((c) => ({ course: c, progress: getCourseProgress(c, currentUser.completedIds) }))
    .filter((c) => c.progress.done > 0 && c.progress.done < c.progress.total);

  const notStarted = courses.filter(
    (c) => getCourseProgress(c, currentUser.completedIds).done === 0
  );

  const continueCourse = inProgress[0]?.course || notStarted[0];

  const sortedLeaderboard = [...users]
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.xp - a.xp);
  const myRankIndex = sortedLeaderboard.findIndex((u) => u.id === currentUser.id);

  return (
    <Layout eyebrow="Personal Record" title="Your Dossier">
      <div className="grid grid-cols-12 gap-6">
        {/* Rank ring */}
        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-7 flex flex-col items-center">
          <MasteryRing
            ratio={ringRatio}
            size={150}
            label={`LVL ${rank.level}`}
            sublabel={rank.name}
          />
          <div className="mt-5 text-center">
            {nextRank ? (
              <p className="text-xs text-[var(--color-muted)]">
                <span className="text-[var(--color-parchment)] font-mono">
                  {nextRank.threshold - currentUser.xp}
                </span>{" "}
                XP to reach{" "}
                <span className="text-[var(--color-brass-bright)]">
                  {nextRank.name}
                </span>
              </p>
            ) : (
              <p className="text-xs text-[var(--color-brass-bright)]">
                Highest rank attained.
              </p>
            )}
          </div>
        </div>

        {/* Streak + leaderboard position */}
        <div className="col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6 flex items-center justify-between">
            <div>
              <div className="eyebrow mb-1.5">Current Streak</div>
              <div className="font-display text-3xl text-[var(--color-parchment)]">
                {currentUser.streak}
                <span className="text-sm text-[var(--color-muted)] ml-1.5 font-body">
                  {currentUser.streak === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
            <Flame
              size={34}
              strokeWidth={1.4}
              className={
                currentUser.streak > 0
                  ? "text-[var(--color-brass-bright)]"
                  : "text-[var(--color-panel-line)]"
              }
            />
          </div>
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6 flex items-center justify-between">
            <div>
              <div className="eyebrow mb-1.5">Standing</div>
              <div className="font-display text-3xl text-[var(--color-parchment)]">
                #{myRankIndex + 1}
                <span className="text-sm text-[var(--color-muted)] ml-1.5 font-body">
                  of {sortedLeaderboard.length}
                </span>
              </div>
            </div>
            <Link
              to="/app/leaderboard"
              className="text-xs text-[var(--color-brass)] hover:text-[var(--color-brass-bright)] flex items-center gap-1"
            >
              View <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Badges shelf */}
        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
          <div className="eyebrow mb-4">
            Insignia — {currentUser.badges.length}/{BADGE_RULES.length}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {BADGE_RULES.map((badge) => {
              const earned = currentUser.badges.includes(badge.id);
              const IconComp = Icons[badge.icon] || Icons.Shield;
              return (
                <div
                  key={badge.id}
                  title={`${badge.name} — ${badge.description}`}
                  className={`aspect-square flex items-center justify-center border ${
                    earned
                      ? "border-[var(--color-brass)] bg-[var(--color-brass)]/10"
                      : "border-[var(--color-panel-line)]"
                  }`}
                >
                  {earned ? (
                    <IconComp size={20} strokeWidth={1.6} className="text-[var(--color-brass-bright)]" />
                  ) : (
                    <Lock size={15} strokeWidth={1.6} className="text-[var(--color-panel-line)]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue learning */}
        {continueCourse && (
          <div className="col-span-12 bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-7 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 flex items-center justify-center border border-[var(--color-panel-line)] shrink-0">
                {(() => {
                  const CIcon = Icons[continueCourse.icon] || Icons.BookOpen;
                  return <CIcon size={22} strokeWidth={1.5} className="text-[var(--color-brass)]" />;
                })()}
              </div>
              <div>
                <div className="eyebrow mb-1">
                  {inProgress[0] ? "Resume" : "Begin"}
                </div>
                <div className="font-display text-lg text-[var(--color-parchment)]">
                  {continueCourse.title}
                </div>
              </div>
            </div>
            <Link
              to={`/app/courses/${continueCourse.id}`}
              className="flex items-center gap-2 border border-[var(--color-brass)] text-[var(--color-brass-bright)] px-5 py-2.5 text-sm hover:bg-[var(--color-brass)] hover:text-[var(--color-void)] transition-colors"
            >
              Continue <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
