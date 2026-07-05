import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type AppRole } from "@/integrations/supabase/client";

export type AuthState = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
};

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setRole(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .order("role", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!cancelled) setRole(((data as { role?: AppRole } | null)?.role) ?? "student");
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return {
    session,
    user: session?.user ?? null,
    role,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}