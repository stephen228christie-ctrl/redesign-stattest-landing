import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vkytcuefcddnynesthlq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreXRjdWVmY2RkbnluZXN0aGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDI5NzEsImV4cCI6MjA5NTk3ODk3MX0.yiirwF57nVW93GcoZCzgu4wujueTOWcdqF6B_BcOVw4";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const FREE_LIMIT = 3;

// The new site URL — used as the emailRedirectTo base
export const SITE_URL = "https://redesign-stattest-landing.vercel.app";
