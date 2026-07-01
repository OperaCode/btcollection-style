import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — BT Collection LLC" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Announcement />
      <Header />
      <section className="mx-auto max-w-md px-4 py-20 md:px-8">
        <h1 className="font-display text-4xl text-ink">{mode === "in" ? "Welcome Back" : "Create Account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === "in" ? "Sign in to your account" : "Join the BT Collection community"}</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm" />
          <button disabled={loading} className="w-full rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background disabled:opacity-50">{loading ? "..." : mode === "in" ? "Sign In" : "Sign Up"}</button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-gold">
          {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
      <Footer />
    </div>
  );
}