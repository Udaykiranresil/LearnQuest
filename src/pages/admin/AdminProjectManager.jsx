import { useState } from "react";
import { Plus, X, Trash2, CheckCircle2, XCircle, Clock, GitFork } from "lucide-react";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import { useApp } from "../../context/AppContext";
import { newProjectId } from "../../lib/treeOps";

function NewProjectModal({ courses, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [xpReward, setXpReward] = useState(200);
  const [difficulty, setDifficulty] = useState("Beginner");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-[var(--color-parchment)]">New Project</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-parchment)]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">Attached Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">
              Requirements (one per line)
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-muted)] block mb-1.5">XP Reward</label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] block mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
              >
                {["Beginner", "Intermediate", "Advanced"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={!title.trim() || !courseId}
            onClick={() =>
              onCreate({
                id: newProjectId(title),
                courseId,
                title: title.trim(),
                description: description.trim(),
                requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
                xpReward,
                difficulty,
              })
            }
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

const STATUS_META = {
  approved: { icon: CheckCircle2, label: "Approved", color: "var(--color-verdant-bright)" },
  pending: { icon: Clock, label: "Pending", color: "var(--color-brass-bright)" },
  rejected: { icon: XCircle, label: "Rejected", color: "var(--color-oxblood-bright)" },
};

export default function AdminProjectManager() {
  const { courses, projects, users, addProject, deleteProject, updateCourse, reviewSubmission } = useApp();
  const [showModal, setShowModal] = useState(false);

  function handleCreate(project) {
    addProject(project);
    updateCourse(project.courseId, { projectId: project.id });
    setShowModal(false);
  }

  function handleDelete(project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    deleteProject(project.id);
    if (courses.find((c) => c.id === project.courseId)?.projectId === project.id) {
      updateCourse(project.courseId, { projectId: null });
    }
  }

  const submissionsByProject = projects.map((project) => ({
    project,
    submissions: users
      .filter((u) => u.role !== "admin")
      .flatMap((u) =>
        u.projectSubmissions
          .filter((s) => s.projectId === project.id)
          .map((s) => ({ ...s, user: u }))
      ),
  }));

  return (
    <Layout
      eyebrow="Administration"
      title="Projects"
      actions={
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          New Project
        </Button>
      }
    >
      <div className="space-y-6">
        {submissionsByProject.map(({ project, submissions }) => {
          const course = courses.find((c) => c.id === project.courseId);
          return (
            <div key={project.id} className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
              <div className="px-5 py-4 border-b border-[var(--color-panel-line)] flex items-center justify-between">
                <div>
                  <div className="eyebrow mb-1">{course?.title}</div>
                  <div className="font-display text-base text-[var(--color-parchment)]">
                    {project.title}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--color-brass-bright)]">
                    +{project.xpReward} XP
                  </span>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(project)}>
                    Delete
                  </Button>
                </div>
              </div>
              {submissions.length === 0 ? (
                <p className="px-5 py-5 text-sm text-[var(--color-muted)]">
                  No submissions yet.
                </p>
              ) : (
                submissions.map((sub) => {
                  const status = STATUS_META[sub.status];
                  return (
                    <div
                      key={sub.user.id}
                      className="px-5 py-3.5 flex items-center justify-between border-b border-[var(--color-panel-line)] last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-[var(--color-parchment)]">{sub.user.displayName}</div>
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-brass-bright)] font-mono mt-0.5 truncate"
                        >
                          <GitFork size={12} strokeWidth={1.8} className="shrink-0" />
                          {sub.repoUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: status.color }}>
                          <status.icon size={14} strokeWidth={1.8} />
                          {status.label}
                        </span>
                        {sub.status !== "approved" && (
                          <Button size="sm" variant="secondary" onClick={() => reviewSubmission(sub.user.id, project.id, "approved")}>
                            Approve
                          </Button>
                        )}
                        {sub.status !== "rejected" && (
                          <Button size="sm" variant="danger" onClick={() => reviewSubmission(sub.user.id, project.id, "rejected")}>
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewProjectModal courses={courses} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </Layout>
  );
}
