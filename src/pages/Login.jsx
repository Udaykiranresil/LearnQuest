import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, User, ArrowRight, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin" : "/app");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-void)] px-4">
      <div className="w-full max-w-sm">
        {/* Seal */}
        <div className="flex flex-col items-center mb-10">
          <svg width="64" height="64" viewBox="0 0 32 32" className="mb-5">
            <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-brass)" strokeWidth="1" />
            <circle cx="16" cy="16" r="11.5" fill="none" stroke="var(--color-panel-line)" strokeWidth="0.5" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="var(--color-brass)" strokeWidth="0.6" />
            <path
              d="M16 9 L18.5 14.5 L24 15.2 L20 19 L21 24.5 L16 21.8 L11 24.5 L12 19 L8 15.2 L13.5 14.5 Z"
              fill="var(--color-brass)"
            />
          </svg>
          <h1 className="font-display text-3xl text-[var(--color-parchment)] tracking-wide">
            LearnQuest
          </h1>
          <p className="eyebrow mt-2">Entry Requires Credentials</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] px-7 py-8"
        >
          <div className="mb-5">
            <label className="eyebrow block mb-2">Username</label>
            <div className="flex items-center gap-2.5 border border-[var(--color-panel-line)] bg-[var(--color-ink)] px-3 py-2.5 focus-within:border-[var(--color-brass)] transition-colors">
              <User size={16} strokeWidth={1.6} className="text-[var(--color-muted)]" />
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. arjun.rao"
                className="bg-transparent flex-1 outline-none text-sm text-[var(--color-parchment)] placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="eyebrow block mb-2">Password</label>
            <div className="flex items-center gap-2.5 border border-[var(--color-panel-line)] bg-[var(--color-ink)] px-3 py-2.5 focus-within:border-[var(--color-brass)] transition-colors">
              <KeyRound size={16} strokeWidth={1.6} className="text-[var(--color-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent flex-1 outline-none text-sm text-[var(--color-parchment)] placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 mb-5 text-[var(--color-oxblood-bright)] text-xs">
              <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[var(--color-void)] py-2.5 text-sm font-medium tracking-wide hover:bg-[var(--color-brass-bright)] transition-colors disabled:opacity-50"
          >
            Enter the Academy
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </form>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          Accounts are issued by an administrator. Contact them if you don't
          have credentials.
        </p>
      </div>
    </div>
  );
}
