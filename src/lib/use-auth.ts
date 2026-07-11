import { useEffect, useState } from "react";
import { supabase, type AppRole } from "@/integrations/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

async function fetchRole(userId: string): Promise<AppRole> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role as AppRole);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("tutor")) return "tutor";
  return "student";
}

export type AuthState = {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
};

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async (session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      const meta = session.user.user_metadata as Record<string, unknown> | undefined;
      const full = (meta?.full_name as string) || session.user.email?.split("@")[0] || "User";
      setUser({ id: session.user.id, email: session.user.email ?? "", fullName: full });
      // Defer role fetch to avoid Supabase deadlock in the auth callback.
      setTimeout(async () => {
        const r = await fetchRole(session.user.id);
        if (mounted) setRole(r);
        if (mounted) setLoading(false);
      }, 0);
    };

    supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => hydrate(session));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}

export type { AppRole };