import { useEffect, useState, useSyncExternalStore } from "react";
import type { AppRole } from "@/integrations/supabase/client";

export type MockUser = {
  id: string;
  email: string;
  fullName: string;
};

type StoredAuth = { user: MockUser; role: AppRole } | null;

const KEY = "serenog.auth";

function detectRole(email: string): AppRole {
  const e = email.trim().toLowerCase();
  if (e === "sophia1@gmail.com") return "admin";
  if (e === "sophia2@gmail.com") return "tutor";
  if (e === "sophia3@gmail.com") return "student";
  return "student";
}

function read(): StoredAuth {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function emit() {
  listeners.forEach((l) => l());
}

export function signInMock(email: string, fullName?: string): { user: MockUser; role: AppRole } {
  const role = detectRole(email);
  const user: MockUser = {
    id: email.toLowerCase(),
    email: email.trim(),
    fullName: fullName || email.split("@")[0],
  };
  const payload = { user, role };
  localStorage.setItem(KEY, JSON.stringify(payload));
  emit();
  return payload;
}

export function signOutMock() {
  localStorage.removeItem(KEY);
  emit();
}

export type AuthState = {
  user: MockUser | null;
  role: AppRole | null;
  loading: boolean;
};

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY),
    () => null,
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);
  const parsed: StoredAuth = snapshot ? (JSON.parse(snapshot) as StoredAuth) : null;
  return {
    user: parsed?.user ?? null,
    role: parsed?.role ?? null,
    loading,
    signOut: async () => { signOutMock(); },
  };
}

// Kept only so other modules importing from here don't break during scan.
export type { AppRole };
// Silence unused import
void read;