"use client";

import { FREE_LIMIT } from "@/lib/supabase";

export default function AppNav({
  name,
  usage,
  isPro,
}: {
  name: string | null; // null = guest
  usage: number | null; // null = hide usage bar
  isPro: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">StatTest</span>
          <span className="font-mono text-[0.68rem] text-sig">p&nbsp;&lt;&nbsp;.05</span>
        </a>

        <div className="flex items-center gap-4">
          {usage !== null && !isPro && (
            <div className="hidden items-center gap-2 sm:flex" aria-label={`${usage} of ${FREE_LIMIT} free analyses used`}>
              <span className="font-mono text-[0.7rem] text-ink-soft">
                {usage}/{FREE_LIMIT} free
              </span>
              <span className="h-1.5 w-20 bg-panel">
                <span
                  className="block h-full bg-sig transition-all"
                  style={{ width: `${Math.min((usage / FREE_LIMIT) * 100, 100)}%` }}
                />
              </span>
            </div>
          )}
          {isPro && (
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-plot">★ Pro</span>
          )}

          {name ? (
            <a href="/dashboard" className="flex items-center gap-2 text-sm font-bold hover:text-plot">
              <span className="flex h-8 w-8 items-center justify-center bg-ink font-mono text-xs text-paper">
                {name[0].toUpperCase()}
              </span>
              <span className="hidden sm:inline">{name}</span>
            </a>
          ) : (
            <a
              href="/login?tab=signup&return=/app"
              className="bg-ink px-4 py-2 text-[0.85rem] font-bold text-paper hover:bg-night-soft"
            >
              Sign up free →
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
