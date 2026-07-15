import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AdminAuthCtx = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; isAdmin: boolean }>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function checkAdmin(currentUser: User | null) {
    if (!currentUser) {
      setIsAdmin(false);
      setAuthError(null);
      return false;
    }
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: currentUser.id,
        _role: "admin",
      });
      if (error) {
        const { data: roleRows, error: roleError } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .limit(1);

        if (roleError) throw error;
        const allowed = (roleRows ?? []).length > 0;
        setIsAdmin(allowed);
        setAuthError(null);
        return allowed;
      }
      const allowed = Boolean(data);
      setIsAdmin(allowed);
      setAuthError(null);
      return allowed;
    } catch (error) {
      console.error("Admin role check failed", error);
      setIsAdmin(false);
      setAuthError(
        "Admin role check failed. Confirm Supabase is configured and the admin SQL migration has been run.",
      );
      return false;
    }
  }

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        await checkAdmin(currentUser);
      })
      .catch((error) => {
        console.error("Admin session check failed", error);
        setAuthError("Could not connect to Supabase auth. Check your .env settings and network.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkAdmin(currentUser);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AdminAuthCtx = {
    loading,
    user,
    isAdmin,
    authError,
    async signIn(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message, isAdmin: false };
        const currentUser = data.user ?? data.session?.user ?? null;
        setUser(currentUser);
        const allowed = await checkAdmin(currentUser);
        return { error: null, isAdmin: allowed };
      } catch (error) {
        console.error("Admin sign in failed", error);
        return {
          error: "Could not reach Supabase auth. Check your .env settings and network.",
          isAdmin: false,
        };
      }
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
