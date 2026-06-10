import { createClient } from "@supabase/supabase-js";

// Same Supabase project as the original stattest-landing site, so existing
// accounts, profiles, and saved analyses keep working. The anon key is a
// public client-side key protected by Row Level Security.
const SUPABASE_URL = "https://vkytcuefcddnynesthlq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreXRjdWVmY2RkbnluZXN0aGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDI5NzEsImV4cCI6MjA5NTk3ODk3MX0.yiirwF57nVW93GcoZCzgu4wujueTOWcdqF6B_BcOVw4";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const FREE_LIMIT = 3;
