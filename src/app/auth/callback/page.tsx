"use client";

import { useEffect } from "react";
import { sb } from "@/lib/supabase";

/**
 * Supabase sends users here after:
 *  - Email confirmation (signup)
 *  - Magic link login
 *  - Password reset
 *  - Google / OAuth redirect
 *
 * The token arrives either as ?code= (PKCE flow) or as a #access_token
 * fragment. We exchange it for a session, then forward to /dashboard.
 */
export default function AuthCallback() {
  useEffect(() => {
    async function handle() {
      // PKCE code flow (most common with Next.js)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        await sb.auth.exchangeCodeForSession(code);
        window.location.replace("/dashboard");
        return;
      }

      // Implicit / hash flow (older Supabase default)
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        // Let supabase-js pick up the hash automatically
        const { data } = await sb.auth.getSession();
        if (data.session) {
          window.location.replace("/dashboard");
          return;
        }
      }

      // No token — likely landed here by accident
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
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 bg-ink animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
