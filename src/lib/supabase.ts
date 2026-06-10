import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zxanxrgjfrfywwzgsrwy.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_MMwrkcT_rGOVhCcaV61A9g_3eEFnKZ8";

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
