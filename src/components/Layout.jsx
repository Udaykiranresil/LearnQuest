import Sidebar from "./Sidebar";
import StatStrip from "./StatStrip";
import LevelUpModal from "./LevelUpModal";
import BadgeUnlockToast from "./BadgeUnlockToast";
import { useApp } from "../context/AppContext";

export default function Layout({ title, eyebrow, actions, children }) {
  const { currentUser, levelUpEvent, dismissLevelUp, badgeQueue, dismissBadge } = useApp();
  const isMember = currentUser?.role !== "admin";
  return (
    <div className="flex min-h-screen bg-[var(--color-void)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-[var(--color-void)]/95 backdrop-blur border-b border-[var(--color-panel-line)] px-8 py-5 flex items-center justify-between">
          <div>
            {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
            <h1 className="font-display text-2xl text-[var(--color-parchment)]">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {currentUser?.role !== "admin" && currentUser && (
              <StatStrip user={currentUser} />
            )}
            {actions}
          </div>
        </header>
        <main className="px-8 py-8">{children}</main>
      </div>

      {/* Celebrations are mounted once here (not per-page) so a rank-up or
          badge earned from any source shows up no matter what the user is
          looking at. Admins never see these. */}
      {isMember && (
        <>
          <LevelUpModal event={levelUpEvent} onDismiss={dismissLevelUp} />
          <BadgeUnlockToast queue={badgeQueue} onDismiss={dismissBadge} />
        </>
      )}
    </div>
  );
}
