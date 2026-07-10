import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  UserCircle,
  ShieldCheck,
  Library,
  FolderGit2,
  Users,
  LogOut,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const userLinks = [
  { to: "/app", label: "Dossier", icon: LayoutDashboard, end: true },
  { to: "/app/courses", label: "Curriculum", icon: BookOpen },
  { to: "/app/leaderboard", label: "Standings", icon: Trophy },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, end: true },
  { to: "/admin/courses", label: "Curriculum", icon: Library },
  { to: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { to: "/admin/users", label: "Members", icon: Users },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const links = currentUser?.role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--color-ink)] border-r border-[var(--color-panel-line)]">
      <div className="px-5 py-6 border-b border-[var(--color-panel-line)]">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0">
            <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-brass)" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="var(--color-brass)" strokeWidth="0.8" />
            <path
              d="M16 9 L18.5 14.5 L24 15.2 L20 19 L21 24.5 L16 21.8 L11 24.5 L12 19 L8 15.2 L13.5 14.5 Z"
              fill="var(--color-brass)"
            />
          </svg>
          <div>
            <div className="font-display text-[15px] tracking-wide leading-none text-[var(--color-parchment)]">
              LearnQuest
            </div>
            <div className="eyebrow mt-1 leading-none">
              {currentUser?.role === "admin" ? "Administration" : "The Academy"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? "border-[var(--color-brass)] bg-[var(--color-panel)] text-[var(--color-parchment)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-parchment)] hover:bg-[var(--color-panel)]/50"
              }`
            }
          >
            <Icon size={17} strokeWidth={1.6} />
            <span className="tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-panel-line)]">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="min-w-0">
            <div className="text-sm text-[var(--color-parchment)] truncate">
              {currentUser?.displayName}
            </div>
            <div className="eyebrow truncate">@{currentUser?.username}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-oxblood-bright)] transition-colors"
          >
            <LogOut size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </aside>
  );
}
