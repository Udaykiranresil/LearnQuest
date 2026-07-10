import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GitFork, ArrowLeft, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";

const STATUS_META = {
  approved: { icon: CheckCircle2, label: "Approved", color: "var(--color-verdant-bright)" },
  pending: { icon: Clock, label: "Under Review", color: "var(--color-brass-bright)" },
  rejected: { icon: XCircle, label: "Changes Requested", color: "var(--color-oxblood-bright)" },
};

export default function ProjectSubmission() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser, projects, courses, submitProject } = useApp();

  const project = projects.find((p) => p.id === projectId);
  const course = courses.find((c) => c.id === project?.courseId);
  const existing = currentUser.projectSubmissions.find((s) => s.projectId === projectId);
  const [repoUrl, setRepoUrl] = useState(existing?.repoUrl || "");
  const [error, setError] = useState("");

  if (!project) {
    return (
      <Layout title="Not Found">
        <p className="text-[var(--color-muted)]">This project does not exist.</p>
      </Layout>
    );
  }

  const status = existing ? STATUS_META[existing.status] : null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(trimmed)) {
      setError("Enter a valid GitHub repository URL, e.g. https://github.com/user/repo");
      return;
    }
    setError("");
    submitProject(currentUser.id, projectId, trimmed);
  }

  return (
    <Layout
      eyebrow={course?.title}
      title={project.title}
      actions={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-parchment)]"
        >
          <ArrowLeft size={14} /> Back
        </button>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
            <div className="eyebrow mb-3">Brief</div>
            <p className="text-sm text-[var(--color-parchment)] leading-relaxed mb-6">
              {project.description}
            </p>
            <div className="eyebrow mb-3">Requirements</div>
            <ul className="space-y-2.5">
              {project.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-parchment)]">
                  <span className="font-mono text-xs text-[var(--color-brass)] mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-5 space-y-6">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="eyebrow">Reward</span>
              <span className="font-mono text-sm text-[var(--color-brass-bright)]">
                +{project.xpReward} XP
              </span>
            </div>

            {existing && (
              <div
                className="flex items-center gap-2 mb-5 px-3 py-2.5 border"
                style={{ borderColor: status.color, color: status.color }}
              >
                <status.icon size={15} strokeWidth={1.8} />
                <span className="text-xs">{status.label}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="eyebrow block mb-2">GitHub Repository</label>
              <div className="flex items-center gap-2.5 border border-[var(--color-panel-line)] bg-[var(--color-ink)] px-3 py-2.5 focus-within:border-[var(--color-brass)] transition-colors mb-3">
                <GitFork size={16} strokeWidth={1.6} className="text-[var(--color-muted)] shrink-0" />
                <input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="bg-transparent flex-1 outline-none text-sm text-[var(--color-parchment)] placeholder:text-[var(--color-muted)]"
                />
              </div>
              {error && (
                <p className="text-xs text-[var(--color-oxblood-bright)] mb-3">{error}</p>
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[var(--color-void)] py-2.5 text-sm font-medium hover:bg-[var(--color-brass-bright)] transition-colors"
              >
                <Send size={15} strokeWidth={1.8} />
                {existing ? "Resubmit" : "Submit for Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
