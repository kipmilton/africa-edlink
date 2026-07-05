import { createClient } from "@supabase/supabase-js";

// External Supabase project (publishable anon key — safe in client code).
const SUPABASE_URL = "https://jaqfrjhiiphzrtromlxv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcWZyamhpaXBoenJ0cm9tbHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDAzODgsImV4cCI6MjA5ODQxNjM4OH0.mR18f6woN7tcDUAHW0VteB9FJEoDn8ed9jkUgZVoI3A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AppRole = "admin" | "tutor" | "student";