import { useState } from "react";
import * as Icons from "lucide-react";
import { KeyRound, CheckCircle2, Clock, XCircle, Lock } from "lucide-react";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { BADGE_RULES } from "../../lib/gameLogic";

const STATUS_META = {
  approved: { icon: CheckCircle2, label: "Approved", color: "var(--color-verdant-bright)" },
  pending: { icon: Clock, label: "Under Review", color: "var(--color-brass-bright)" },
  rejected: { icon: XCircle, label: "Changes Requested", color: "var(--color-oxblood-bright)" },
};

export default function Profile() {
  const { currentUser, projects, changePassword } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (next.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    const result = await changePassword(currentUser.id, next, current);
    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMessage({ type: "success", text: "Password updated." });
  }

  return (
    <Layout eyebrow={`@${currentUser.username}`} title={currentUser.displayName}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 space-y-6">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
            <div className="eyebrow mb-4">All Insignia</div>
            <div className="grid grid-cols-4 gap-3">
              {BADGE_RULES.map((badge) => {
                const earned = currentUser.badges.includes(badge.id);
                const IconComp = Icons[badge.icon] || Icons.Shield;
                return (
                  <div
                    key={badge.id}
                    className={`p-3 border flex flex-col items-center text-center gap-2 ${
                      earned ? "border-[var(--color-brass)] bg-[var(--color-brass)]/[0.06]" : "border-[var(--color-panel-line)]"
                    }`}
                  >
                    {earned ? (
                      <IconComp size={20} strokeWidth={1.6} className="text-[var(--color-brass-bright)]" />
                    ) : (
                      <Lock size={16} strokeWidth={1.6} className="text-[var(--color-panel-line)]" />
                    )}
                    <span className={`text-[11px] leading-tight ${earned ? "text-[var(--color-parchment)]" : "text-[var(--color-muted)]"}`}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
            <div className="eyebrow mb-4">Project Submissions</div>
            {currentUser.projectSubmissions.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No projects submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {currentUser.projectSubmissions.map((sub) => {
                  const project = projects.find((p) => p.id === sub.projectId);
                  const status = STATUS_META[sub.status];
                  return (
                    <div
                      key={sub.projectId}
                      className="flex items-center justify-between py-2.5 border-b border-[var(--color-panel-line)] last:border-b-0"
                    >
                      <div>
                        <div className="text-sm text-[var(--color-parchment)]">
                          {project?.title || sub.projectId}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                          {sub.repoUrl}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs shrink-0"
                        style={{ color: status.color }}
                      >
                        <status.icon size={14} strokeWidth={1.8} />
                        {status.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-5">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
            <div className="eyebrow mb-4 flex items-center gap-2">
              <KeyRound size={13} strokeWidth={1.8} />
              Change Password
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="text-xs text-[var(--color-muted)] block mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] block mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] block mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] transition-colors"
                />
              </div>
              {message && (
                <p
                  className="text-xs"
                  style={{
                    color:
                      message.type === "error"
                        ? "var(--color-oxblood-bright)"
                        : "var(--color-verdant-bright)",
                  }}
                >
                  {message.text}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-[var(--color-brass)] text-[var(--color-void)] py-2.5 text-sm font-medium hover:bg-[var(--color-brass-bright)] transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
