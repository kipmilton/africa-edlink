import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TeamKind = "management" | "tutor";

export type TeamProfile = {
  id: string;
  userId?: string | null;
  fullName: string;
  role: string;
  kind: TeamKind;
  imageUrl: string;
  experience: string;
  email?: string | null;
  displayOrder: number;
  isActive: boolean;
};

type TeamRow = {
  id: string;
  user_id?: string | null;
  full_name?: string | null;
  role?: string | null;
  kind?: string | null;
  image_url?: string | null;
  experience?: string | null;
  email?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
};

function mapRow(row: TeamRow): TeamProfile {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    fullName: row.full_name ?? "",
    role: row.role ?? "Team member",
    kind: row.kind === "tutor" ? "tutor" : "management",
    imageUrl: row.image_url ?? "",
    experience: row.experience ?? "",
    email: row.email ?? null,
    displayOrder: row.display_order ?? 1,
    isActive: row.is_active ?? true,
  };
}

export type TeamPayload = {
  fullName: string;
  role: string;
  kind: TeamKind;
  imageUrl: string;
  experience: string;
  email?: string | null;
  userId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

function toRow(payload: Partial<TeamPayload>) {
  const row: Record<string, unknown> = {};
  if (payload.fullName !== undefined) row.full_name = payload.fullName;
  if (payload.role !== undefined) row.role = payload.role;
  if (payload.kind !== undefined) row.kind = payload.kind;
  if (payload.imageUrl !== undefined) row.image_url = payload.imageUrl;
  if (payload.experience !== undefined) row.experience = payload.experience;
  if (payload.email !== undefined) row.email = payload.email;
  if (payload.userId !== undefined) row.user_id = payload.userId;
  if (payload.displayOrder !== undefined) row.display_order = payload.displayOrder;
  if (payload.isActive !== undefined) row.is_active = payload.isActive;
  return row;
}

export function useTeam() {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("team_profiles")
      .select("*")
      .order("display_order", { ascending: true })
      .order("full_name", { ascending: true });
    setProfiles(((data ?? []) as TeamRow[]).map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("team-profiles-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_profiles" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createProfile = useCallback(
    async (payload: TeamPayload) => {
      const { error } = await supabase.from("team_profiles").insert(toRow(payload));
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const updateProfile = useCallback(
    async (id: string, patch: Partial<TeamPayload>) => {
      const { error } = await supabase.from("team_profiles").update(toRow(patch)).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("team_profiles").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  return { profiles, loading, refresh, createProfile, updateProfile, deleteProfile };
}
