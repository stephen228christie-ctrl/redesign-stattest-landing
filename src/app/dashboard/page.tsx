"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AppNav from "@/components/AppNav";
import { sb, FREE_LIMIT } from "@/lib/supabase";

const UPGRADE_URL = "https://stattest-landing.vercel.app/upgrade.html";

interface Profile {
  name?: string;
  plan?: string;
  created_at?: string;
}

interface Analysis {
  id: string;
  recommended_test: string;
  test_emoji?: string;
  test_category?: string;
  research_question?: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) {
        window.location.href = "/login?return=/dashboard";
        return;
      }
      setUser(session.user);

      const [{ data: prof }, { data: recent, count }] = await Promise.all([
        sb.from("profiles").select("*").eq("id", session.user.id).single(),
        sb
          .from("analyses")
          .select("*", { count: "exact" })
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setProfile(prof || null);
      setAnalyses(recent || []);
      setTotal(count ?? (recent || []).length);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    if (!confirm("Are you sure you want to sign out?")) return;
    await sb.auth.signOut();
    window.location.href = "/login";
  }

  if (loading || !user) {
    return (
      <div className="graph-field min-h-screen">
        <AppNav name={null} usage={null} isPro={false} />
        <p className="py-24 text-center font-mono text-sm text-ink-soft">
          loading your dashboard…
        </p>
      </div>
    );
  }

  const name = profile?.name || user.email!.split("@")[0];
  const firstName = name.split(" ")[0];
  const plan = profile?.plan || "free";
  const isPro = plan !== "free";
  const remain = Math.max(0, FREE_LIMIT - total);
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const joined = profile?.created_at ? new Date(profile.created_at) : null;
  const days = joined ? Math.floor((Date.now() - joined.getTime()) / 86400000) : 0;

  const stats = [
    { k: String(total), v: "analyses run" },
    { k: isPro ? "∞" : String(remain), v: isPro ? "unlimited analyses" : "free analyses left" },
    { k: String(days), v: "days since joined" },
    { k: isPro ? (plan === "pass" ? "Pass" : "Pro") : "Free", v: "current plan" },
  ];

  return (
    <div className="graph-field min-h-screen">
      <AppNav name={firstName} usage={isPro ? null : total} isPro={isPro} />

      <main className="mx-auto max-w-wrap px-5 pb-24 pt-10 md:px-8">
        {/* Greeting row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
              Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              {greet}, {firstName}
            </h1>
          </div>
          <a
            href="/app"
            className="bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-night-soft"
          >
            + New analysis
          </a>
        </div>

        {/* Stat strip on an axis */}
        <div className="mt-10">
          <div className="axis-rule" aria-hidden />
          <dl className="grid grid-cols-2 gap-y-6 pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.v}>
                <dd className="font-display text-3xl font-semibold">{s.k}</dd>
                <dt className="mt-1 text-sm text-ink-soft">{s.v}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Upgrade banner (free only) */}
        {!isPro && (
          <div className="mt-10 border border-line bg-night p-6 text-paper sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sig">
                  ✦ Free plan
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  You&rsquo;ve used {total} of {FREE_LIMIT} free analyses
                </p>
                <p className="mt-1 max-w-md text-sm text-paper/70">
                  Upgrade to Pro for unlimited analyses, APA write-ups, SPSS
                  steps, and the AI assistant.
                </p>
                <div className="mt-4 h-1.5 w-56 max-w-full bg-paper/15">
                  <div
                    className="h-full bg-sig"
                    style={{ width: `${Math.min((total / FREE_LIMIT) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={UPGRADE_URL} className="bg-paper px-5 py-3 text-sm font-bold text-ink hover:bg-white">
                  Upgrade — ₹99/mo
                </a>
                <a href={UPGRADE_URL} className="border border-paper/30 px-5 py-3 text-sm font-bold hover:border-paper">
                  ₹199 pass
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Recent analyses */}
          <section className="lg:col-span-7">
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">
                Recent analyses
              </h2>
            </div>
            <div className="mt-4 border-t-2 border-ink">
              {analyses.length === 0 ? (
                <div className="py-14 text-center">
                  <p aria-hidden className="text-3xl">📭</p>
                  <p className="mt-3 font-display text-xl font-medium">No analyses yet</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Run your first analysis to get started. Your results will
                    be saved here automatically.
                  </p>
                  <a
                    href="/app"
                    className="mt-5 inline-block bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-night-soft"
                  >
                    Start a new analysis →
                  </a>
                </div>
              ) : (
                <ul>
                  {analyses.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center gap-3 border-b border-line py-4"
                    >
                      <span aria-hidden className="text-2xl">{a.test_emoji || "📊"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{a.recommended_test}</p>
                        <p className="truncate text-sm text-ink-soft">
                          {a.research_question || "No question saved"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] ${
                          a.test_category === "Non-Parametric"
                            ? "bg-sig/10 text-sig"
                            : a.test_category === "Advanced"
                              ? "bg-panel text-ink-soft"
                              : "bg-plot/10 text-plot"
                        }`}
                      >
                        {a.test_category || "—"}
                      </span>
                      <span className="font-mono text-[0.72rem] text-ink-soft">
                        {new Date(a.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <a href="/app" className="font-mono text-[0.74rem] font-medium text-plot hover:underline">
                        ↗ open
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Account summary */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">
              Account summary
            </h2>
            <div className="mt-4 border-t-2 border-ink">
              <div className="flex items-center gap-3 border-b border-line py-4">
                <span className="flex h-11 w-11 items-center justify-center bg-ink font-mono text-paper">
                  {firstName[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{name}</p>
                  <p className="truncate text-sm text-ink-soft">{user.email}</p>
                </div>
              </div>
              <dl className="text-sm">
                {(
                  [
                    ["Plan", plan === "pro" ? "Pro Monthly" : plan === "pass" ? "Dissertation Pass" : "Free"],
                    ["Member since", joined ? joined.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"],
                    ["Analyses run", String(total)],
                    ["Status", "● Active"],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line py-3">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className={k === "Status" ? "text-plot" : "font-bold"}>{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                onClick={signOut}
                className="mt-5 w-full border border-line-strong py-2.5 text-sm font-bold text-ink-soft hover:border-sig hover:text-sig"
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
