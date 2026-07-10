import { useState } from "react";
import { Plus, X, KeyRound, Trash2, Copy, Check } from "lucide-react";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import { useApp } from "../../context/AppContext";
import { getRankForXp } from "../../lib/gameLogic";
import { generatePassword, usernameFromName } from "../../lib/passwordGen";

function CredentialModal({ title, username, password, onClose }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(`Username: ${username}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-panel)] border border-[var(--color-brass)] w-full max-w-sm p-6">
        <h3 className="font-display text-lg text-[var(--color-parchment)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--color-muted)] mb-5">
          Share these credentials securely. The password won't be shown again.
        </p>
        <div className="bg-[var(--color-ink)] border border-[var(--color-panel-line)] p-4 space-y-2.5 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted)]">Username</span>
            <span className="font-mono text-[var(--color-parchment)]">{username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted)]">Password</span>
            <span className="font-mono text-[var(--color-brass-bright)]">{password}</span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewUserModal({ existingUsernames, onClose, onCreate }) {
  const [displayName, setDisplayName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-[var(--color-parchment)]">New Member</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-parchment)]">
            <X size={18} />
          </button>
        </div>
        <label className="text-xs text-[var(--color-muted)] block mb-1.5">Full Name</label>
        <input
          autoFocus
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Sanjay Patel"
          className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] mb-6"
        />
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={!displayName.trim()}
            onClick={() => {
              const username = usernameFromName(displayName, existingUsernames);
              const password = generatePassword();
              onCreate({
                id: `u-${Date.now()}`,
                username,
                password,
                role: "user",
                displayName: displayName.trim(),
                xp: 0,
                streak: 0,
                lastActiveDate: null,
                completedIds: [],
                badges: [],
                projectSubmissions: [],
              });
            }}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserManager() {
  const { users, addUser, resetPassword, deleteUser } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [credentialView, setCredentialView] = useState(null);

  const members = users.filter((u) => u.role !== "admin");

  function handleCreate(user) {
    addUser(user);
    setShowNew(false);
    setCredentialView({ title: "Member Created", username: user.username, password: user.password });
  }

  function handleReset(user) {
    if (!confirm(`Reset the password for ${user.displayName}?`)) return;
    const newPassword = generatePassword();
    resetPassword(user.id, newPassword);
    setCredentialView({ title: "Password Reset", username: user.username, password: newPassword });
  }

  function handleDelete(user) {
    if (!confirm(`Remove ${user.displayName} from the Academy? This cannot be undone.`)) return;
    deleteUser(user.id);
  }

  return (
    <Layout
      eyebrow="Administration"
      title="Members"
      actions={
        <Button icon={Plus} onClick={() => setShowNew(true)} disabled={members.length >= 10}>
          New Member
        </Button>
      }
    >
      {members.length >= 10 && (
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Ten members are currently enrolled. Remove one to add another.
        </p>
      )}
      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[var(--color-panel-line)] eyebrow">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Username</div>
          <div className="col-span-2">Rank</div>
          <div className="col-span-1 text-right">XP</div>
          <div className="col-span-1 text-right">Streak</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        {members.map((u) => {
          const rank = getRankForXp(u.xp);
          return (
            <div
              key={u.id}
              className="grid grid-cols-12 px-6 py-3.5 items-center border-b border-[var(--color-panel-line)] last:border-b-0"
            >
              <div className="col-span-3 text-sm text-[var(--color-parchment)]">{u.displayName}</div>
              <div className="col-span-2 font-mono text-xs text-[var(--color-muted)]">@{u.username}</div>
              <div className="col-span-2 font-display text-sm text-[var(--color-brass-bright)]">{rank.name}</div>
              <div className="col-span-1 text-right font-mono text-sm text-[var(--color-parchment)]">{u.xp}</div>
              <div className="col-span-1 text-right font-mono text-sm text-[var(--color-parchment)]">{u.streak}</div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                <Button size="sm" variant="secondary" icon={KeyRound} onClick={() => handleReset(u)}>
                  Reset
                </Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(u)} />
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <NewUserModal
          existingUsernames={users.map((u) => u.username)}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
      {credentialView && (
        <CredentialModal {...credentialView} onClose={() => setCredentialView(null)} />
      )}
    </Layout>
  );
}
