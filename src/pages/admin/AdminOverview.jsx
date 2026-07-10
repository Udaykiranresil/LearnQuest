import { Link } from "react-router-dom";
import { Library, Users, FolderGit2, Clock, ArrowRight } from "lucide-react";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";

export default function AdminOverview() {
  const { users, courses, projects } = useApp();
  const learners = users.filter((u) => u.role !== "admin");
  const pendingSubmissions = learners.flatMap((u) =>
    u.projectSubmissions
      .filter((s) => s.status === "pending")
      .map((s) => ({ ...s, user: u }))
  );
  const activeStreaks = learners.filter((u) => u.streak > 0).length;

  const stats = [
    { label: "Courses Published", value: courses.length, icon: Library, to: "/admin/courses" },
    { label: "Members", value: learners.length, icon: Users, to: "/admin/users" },
    { label: "Projects Defined", value: projects.length, icon: FolderGit2, to: "/admin/projects" },
    { label: "Pending Reviews", value: pendingSubmissions.length, icon: Clock, to: "/admin/projects" },
  ];

  return (
    <Layout eyebrow="Administration" title="Overview">
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] hover:border-[var(--color-brass)] transition-colors p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <s.icon size={18} strokeWidth={1.6} className="text-[var(--color-brass)]" />
              <ArrowRight size={13} className="text-[var(--color-muted)]" />
            </div>
            <div className="font-display text-2xl text-[var(--color-parchment)] mb-1">
              {s.value}
            </div>
            <div className="eyebrow">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
        <div className="px-6 py-4 border-b border-[var(--color-panel-line)] flex items-center justify-between">
          <span className="eyebrow">Awaiting Review</span>
          <span className="font-mono text-xs text-[var(--color-muted)]">
            Streak active: {activeStreaks}/{learners.length}
          </span>
        </div>
        {pendingSubmissions.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[var(--color-muted)]">
            No submissions waiting on your review.
          </p>
        ) : (
          pendingSubmissions.map((sub) => {
            const project = projects.find((p) => p.id === sub.projectId);
            return (
              <div
                key={`${sub.user.id}-${sub.projectId}`}
                className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-panel-line)] last:border-b-0"
              >
                <div>
                  <div className="text-sm text-[var(--color-parchment)]">
                    {sub.user.displayName}{" "}
                    <span className="text-[var(--color-muted)]">— {project?.title}</span>
                  </div>
                  <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                    {sub.repoUrl}
                  </div>
                </div>
                <Link
                  to="/admin/projects"
                  className="text-xs text-[var(--color-brass)] hover:text-[var(--color-brass-bright)]"
                >
                  Review
                </Link>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
