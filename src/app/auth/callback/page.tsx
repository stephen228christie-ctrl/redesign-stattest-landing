"use client";

import { useEffect } from "react";
import { sb } from "@/lib/supabase";

// Where to land after auth. The login page stashes the user's intended
// destination (e.g. /app mid-quiz) in localStorage before redirecting out.
// Only same-site paths are honored, so a tampered value can't redirect away.
function destination(): string {
  try {
    const r = localStorage.getItem("st_return");
    localStorage.removeItem("st_return");
    if (r && r.startsWith("/") && !r.startsWith("//")) return r;
  } catch {}
  return "/dashboard";
}

export default function AuthCallback() {
  useEffect(() => {
    async function handle() {
      // Give supabase-js a moment to auto-detect the token from the URL
      // (it reads both ?code= for PKCE and #access_token for implicit flow)
      await new Promise((r) => setTimeout(r, 200));

      // Try PKCE code exchange first
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!error) { window.location.replace(destination()); return; }
      }

      // Implicit hash flow — supabase-js picks it up via detectSessionInUrl
      const hash = window.location.hash;
      if (hash.includes("access_token") || hash.includes("type=signup")) {
        // Poll briefly — supabase-js processes the hash asynchronously
        for (let i = 0; i < 10; i++) {
          const { data } = await sb.auth.getSession();
          if (data.session) { window.location.replace(destination()); return; }
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      // Fallback — check if a session already exists (e.g. auto-confirm)
      const { data } = await sb.auth.getSession();
      if (data.session) { window.location.replace(destination()); return; }

      // Nothing worked — send back to login
      window.location.replace("/login");
    }

    handle();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center graph-field">
      <div className="text-center">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">
          Verifying your account…
        </p>
        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 bg-ink animate-pulse rounded-full"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
        <p className="mt-5 text-xs text-ink-soft">Redirecting you to your dashboard…</p>
      </div>
    </div>
  );
}
