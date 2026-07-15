import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Breakthrough Collection LLC" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, isAdmin, loading, authError, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, user, isAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.isAdmin) {
      navigate({ to: "/admin" });
      return;
    }
    setError("Sign-in succeeded, but this account does not have admin access yet.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-8">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/60 text-gold">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl text-ink">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Breakthrough Collection LLC · Store Management
        </p>

        <p className="mt-4 rounded-sm border border-border bg-cream/60 p-3 text-center text-xs leading-relaxed text-foreground/70">
          New Supabase project? Create the admin user in Supabase Auth, run the admin SQL migration,
          then grant access with <span className="font-medium text-ink">grant_admin_by_email</span>.
        </p>

        {user && !isAdmin && !loading && (
          <p className="mt-4 rounded-sm border border-border bg-cream/60 p-3 text-center text-xs text-foreground/75">
            You're signed in as {user.email}, but that account doesn't have admin access.
          </p>
        )}
        {authError && (
          <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-center text-xs text-destructive">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
            />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
          >
            {submitting ? "Please wait..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
