"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import AppNav from "@/components/AppNav";
import RazorpayButton from "@/components/RazorpayButton";
import { sb, FREE_LIMIT } from "@/lib/supabase";
import {
  Answers,
  QS,
  T,
  TestInfo,
  effectiveNorm,
  nextQ,
  recommend,
} from "@/lib/quiz-data";

type TabId = "why" | "run" | "wr" | "power" | "ass";
const TABS: [TabId, string][] = [
  ["why", "Why?"],
  ["run", "Run it"],
  ["wr", "Write up"],
  ["power", "G*Power"],
  ["ass", "Assumptions"],
];

export default function QuizApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [count, setCount] = useState(0);

  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<string[]>(["objective"]);
  const [showWall, setShowWall] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const currentQ = history[history.length - 1];
  const atResult = currentQ === "result";

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await sb
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setIsPro(profile?.plan === "pro" || profile?.plan === "pass");
        const { count: c } = await sb
          .from("analyses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        setCount(c || 0);
      }
      setAuthReady(true);
    })();
  }, []);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  function selectOpt(key: string, val: string) {
    setAnswers((a) => ({ ...a, [key]: val }));
  }

  function goNext() {
    const q = QS[currentQ];
    if (!q || !answers[q.key]) return;
    const nq = nextQ(currentQ, answers);

    if (nq === "result") {
      if (!user) {
        setShowWall(true);
        return;
      }
      if (!isPro && count >= FREE_LIMIT) {
        setShowPaywall(true);
        return;
      }
    }
    setHistory((h) => [...h, nq]);
  }

  function goBack() {
    if (history.length <= 1) return;
    setHistory((h) => h.slice(0, -1));
  }

  function startNew() {
    setAnswers({});
    setHistory(["objective"]);
    setShowPaywall(false);
  }

  async function wallGoogle() {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app" },
    });
    if (error) showToastMsg(error.message);
  }

  const name = user
    ? (user.user_metadata?.name as string | undefined)?.split(" ")[0] ||
      user.email!.split("@")[0]
    : null;

  const step = history.length;
  const pct = atResult ? 100 : Math.min(90, Math.round((step / 8) * 100));

  const paywallTest = showPaywall ? T[recommend(answers)] : null;

  return (
    <div className="graph-field min-h-screen">
      <AppNav name={name} usage={user && authReady ? count : null} isPro={isPro} />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8">
        {/* Progress axis */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
            <span>{atResult ? "Result" : `Step ${step}`}</span>
            <span>{pct}% complete</span>
          </div>
          <div className="axis-rule mt-3" aria-hidden>
            <div
              className="absolute inset-y-0 left-0 bg-sig transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {!authReady ? (
          <p className="py-20 text-center font-mono text-sm text-ink-soft">
            loading your session…
          </p>
        ) : showPaywall && paywallTest ? (
          <Paywall test={paywallTest} onNew={startNew} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22 }}
            >
              {atResult ? (
                <Result
                  answers={answers}
                  user={user}
                  isPro={isPro}
                  count={count}
                  setCount={setCount}
                  onNew={startNew}
                  toast={showToastMsg}
                />
              ) : (
                <QuestionCard
                  qid={currentQ}
                  answers={answers}
                  onSelect={selectOpt}
                  onNext={goNext}
                  onBack={goBack}
                  canBack={history.length > 1}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Guest signup wall */}
      {showWall && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wall-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-night/70 p-5"
        >
          <div className="w-full max-w-md border border-line bg-paper p-7 sm:p-9">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sig">
              One step left
            </p>
            <h2 id="wall-title" className="mt-3 font-display text-2xl font-semibold">
              Create a free account to see your test
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              You&rsquo;re one answer away from your recommendation. Sign up
              free — takes 30 seconds.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "3 full analyses — free forever",
                "APA write-up templates saved automatically",
                "Full analysis history — reopen anytime",
                "No credit card required",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-plot">✓</span> {t}
                </li>
              ))}
            </ul>
            <button
              onClick={wallGoogle}
              className="mt-6 w-full border border-line-strong px-5 py-3 text-sm font-bold hover:border-ink"
            >
              Continue with Google
            </button>
            <a
              href="/login?tab=signup&return=/app"
              className="mt-3 block w-full bg-ink px-5 py-3 text-center text-sm font-bold text-paper hover:bg-night-soft"
            >
              Sign up with email →
            </a>
            <p className="mt-4 text-center text-sm text-ink-soft">
              Already have an account?{" "}
              <a href="/login?return=/app" className="font-bold text-plot underline">
                Log in
              </a>
            </p>
            <button
              onClick={() => setShowWall(false)}
              className="mt-4 w-full text-center font-mono text-[0.72rem] text-ink-soft hover:text-ink"
            >
              ← back to my answers
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
        {toast && (
          <p className="bg-ink px-5 py-2.5 font-mono text-[0.78rem] text-paper shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Question card ───────────────────────── */

function QuestionCard({
  qid,
  answers,
  onSelect,
  onNext,
  onBack,
  canBack,
}: {
  qid: string;
  answers: Answers;
  onSelect: (key: string, val: string) => void;
  onNext: () => void;
  onBack: () => void;
  canBack: boolean;
}) {
  const q = QS[qid];
  if (!q) return null;
  const sel = answers[q.key] || null;

  return (
    <div className="border border-line bg-paper p-6 sm:p-9">
      <div className="flex items-start gap-4">
        <span aria-hidden className="text-3xl">{q.icon}</span>
        <div>
          <h1 className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
            {q.title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{q.sub}</p>
        </div>
      </div>

      <div className="mt-7 space-y-2.5" role="radiogroup" aria-label={q.title}>
        {q.opts.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={sel === o.id}
            onClick={() => onSelect(q.key, o.id)}
            className={`w-full border p-4 text-left transition-colors ${
              sel === o.id
                ? "border-ink bg-panel"
                : "border-line hover:border-line-strong"
            }`}
          >
            <span className="flex items-start gap-3">
              <span aria-hidden className="text-xl">{o.emoji}</span>
              <span>
                <span className="block font-bold">
                  {o.label}
                  {sel === o.id && <span className="ml-2 text-plot">✓</span>}
                </span>
                <span className="mt-0.5 block text-sm text-ink-soft">{o.desc}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!canBack}
          className="font-mono text-sm text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!sel}
          className="bg-ink px-7 py-3 text-sm font-bold text-paper transition-colors hover:bg-night-soft disabled:cursor-not-allowed disabled:opacity-30"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Paywall ───────────────────────── */

function Paywall({ test, onNew }: { test: TestInfo; onNew: () => void }) {
  return (
    <div className="border border-line bg-paper p-7 text-center sm:p-10">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sig">
        🔒 Free limit reached
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        You&rsquo;ve used all {FREE_LIMIT} free analyses
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Your recommended test is ready —{" "}
        <strong className="text-ink">{test.n}</strong>. Upgrade to Pro for
        unlimited analyses, full explanations, APA write-ups, SPSS steps, and
        the AI assistant.
      </p>
      <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm">
        {["Why this test?", "Assumptions", "APA write-up", "SPSS steps", "G*Power guide", "AI assistant"].map(
          (t) => (
            <li key={t} className="flex gap-2 text-ink-soft">
              <span aria-hidden>🔒</span> {t}
            </li>
          )
        )}
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <RazorpayButton plan="pro" planName="Pro Monthly" className="bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-night-soft">
          Upgrade — ₹99/month
        </RazorpayButton>
        <RazorpayButton plan="pass" planName="Dissertation Pass" className="border border-line-strong px-6 py-3 text-sm font-bold hover:border-ink">
          ₹199 Dissertation Pass (3 months)
        </RazorpayButton>
      </div>
      <button onClick={onNew} className="mt-6 font-mono text-[0.75rem] text-ink-soft hover:text-ink">
        ← Start a new analysis (free)
      </button>
    </div>
  );
}

/* ───────────────────────── Result ───────────────────────── */

function Result({
  answers,
  user,
  isPro,
  count,
  setCount,
  onNew,
  toast,
}: {
  answers: Answers;
  user: User | null;
  isPro: boolean;
  count: number;
  setCount: (n: number) => void;
  onNew: () => void;
  toast: (m: string) => void;
}) {
  const tk = recommend(answers);
  const tt = T[tk];
  const altTT = tt?.altKey ? T[tt.altKey] : null;
  const [tab, setTab] = useState<TabId>("why");
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current || !user || !tt) return;
    if (!isPro && count >= FREE_LIMIT) return;
    saved.current = true;
    (async () => {
      try {
        await sb.from("analyses").insert({
          user_id: user.id,
          recommended_test: tt.n,
          test_emoji: tt.e,
          test_category: tt.b,
          explanation: tt.why,
          apa_template: tt.wr ? tt.wr[0] : "",
          assumptions: tt.ass,
          inputs: answers,
        });
        setCount(count + 1);
        toast("✅ Analysis saved to your history");
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tt)
    return (
      <p className="py-10 text-center text-ink-soft">
        Please go back and answer all questions.
      </p>
    );

  function copy(text: string, msg: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast(msg);
  }

  const methods = `The present study employed the ${tt.n} to analyse the data. This test was selected as appropriate for the research design and level of measurement of the dependent variable (Field, 2018). Effect size will be reported using ${tt.eff.split("—")[0].trim()}.`;

  return (
    <div>
      {/* Header */}
      <div className="border border-line bg-paper p-6 sm:p-9">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-plot">
          ✓ Recommended test
        </p>
        <h1 className="mt-3 flex items-center gap-3 font-display text-3xl font-semibold sm:text-4xl">
          <span aria-hidden>{tt.e}</span> {tt.n}
        </h1>
        <p className="mt-2 text-ink-soft">{tt.tl}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.15em] ${
                tt.b === "Parametric"
                  ? "bg-plot/10 text-plot"
                  : tt.b === "Non-Parametric"
                    ? "bg-sig/10 text-sig"
                    : "bg-panel text-ink-soft"
              }`}
            >
              {tt.b}
            </span>
            {tt.ph && (
              <span className="bg-sig/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.15em] text-sig">
                Post-hoc needed
              </span>
            )}
          </div>
          <p className="font-mono text-[0.7rem] text-ink-soft">
            design fit:{" "}
            <span aria-label={`${tt.fit} out of 5`}>
              {"★".repeat(tt.fit)}
              <span className="opacity-25">{"★".repeat(5 - tt.fit)}</span>
            </span>
          </p>
        </div>
        {altTT && tt.alt && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-soft">
            Alternative: <strong className="text-ink">{altTT.n}</strong> —{" "}
            {tt.alt.w}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-5 border border-line bg-paper">
        <div role="tablist" aria-label="Test details" className="flex flex-wrap border-b border-line">
          {TABS.map(([id, lbl]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 font-mono text-[0.74rem] uppercase tracking-[0.12em] sm:px-5 ${
                tab === id
                  ? "border-b-2 border-sig font-medium text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-8" role="tabpanel">
          {tab === "why" && (
            <div className="space-y-5 text-[0.95rem] leading-relaxed">
              <Block label="Why this test?">{tt.why}</Block>
              <Note tone="tip">💡 <strong>Example:</strong> {tt.ex}</Note>
              <Block label="Effect size">{tt.eff}</Block>
              <Block label="Suggested visualisation">{tt.viz}</Block>
              {tt.cnt && <Note tone="warn">🚫 <strong>Cannot tell you:</strong> {tt.cnt}</Note>}
              {tt.sup && <Note tone="tip">💬 <strong>Supervisor tip:</strong> {tt.sup}</Note>}
              {tt.sw && <Note tone="tip">💡 <strong>Software tip:</strong> {tt.sw}</Note>}
            </div>
          )}

          {tab === "run" && (
            <div className="space-y-2">
              <p className="mb-3 text-sm text-ink-soft">Expand your software:</p>
              {(
                [
                  ["SPSS", tt.spss],
                  ["jamovi (free)", tt.jmv],
                  [
                    "JASP (free)",
                    "Same pathway as jamovi — navigate to the equivalent test section and move your variables across.",
                  ],
                ] as [string, string][]
              ).map(([sw, steps]) => (
                <details key={sw} className="group border border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                    {sw}
                    <span aria-hidden className="font-mono text-ink-soft transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <p className="border-t border-line px-4 py-3 font-mono text-[0.82rem] leading-relaxed text-ink-soft">
                    {steps}
                  </p>
                </details>
              ))}
              <Note tone="tip">💡 jamovi and JASP are free. Both work identically.</Note>
            </div>
          )}

          {tab === "wr" && tt.wr && (
            <div className="space-y-4">
              <Note tone="tip">
                📝 Fill in the blanks. Use <strong>[significantly]</strong> if p &lt; .05, or{" "}
                <strong>[not significantly]</strong> if p ≥ .05.
              </Note>
              <div className="border border-line bg-panel/50">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-soft">
                    APA 7th edition template
                  </span>
                  <button
                    onClick={() => copy(tt.wr![0], "📋 APA template copied!")}
                    className="font-mono text-[0.72rem] font-medium text-plot hover:underline"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="px-4 py-4 font-mono text-[0.85rem] leading-relaxed">{tt.wr[0]}</p>
              </div>
              <Note tone="tip">📖 <strong>Plain English:</strong> {tt.wr[1]}</Note>
              <Note tone="warn">
                ⚠️ Never write &ldquo;proves&rdquo; — write &ldquo;suggests&rdquo;,
                &ldquo;indicates&rdquo;, or &ldquo;failed to reject H₀&rdquo;.
              </Note>
            </div>
          )}

          {tab === "power" && (
            <div className="space-y-5 text-[0.95rem] leading-relaxed">
              <Block label="G*Power path">
                <span className="font-mono text-[0.85rem]">{tt.gp || "Check G*Power documentation."}</span>
              </Block>
              <Note tone="tip">
                Required inputs: α (usually .05), Power (aim for .80 minimum; .90 is increasingly
                expected), and Effect Size from prior literature.
              </Note>
              <Block label="Effect size for this test">{tt.eff}</Block>
              <p className="text-center font-mono text-[0.7rem] text-ink-soft">
                G*Power is free — search &ldquo;G*Power Faul 2007&rdquo; to download.
              </p>
            </div>
          )}

          {tab === "ass" && (
            <div>
              <p className="mb-4 text-sm text-ink-soft">Verify these before running your analysis:</p>
              <ol className="space-y-3">
                {tt.ass.map((a, i) => (
                  <li key={a} className="flex gap-3 text-[0.95rem]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-ink font-mono text-xs text-paper">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ol>
              {tt.ph && (
                <Note tone="tip">
                  📋 <strong>Post-hoc tests required:</strong> {tt.ph}
                </Note>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => copy(methods, "📋 Methods paragraph copied!")}
          className="border border-line-strong px-5 py-3 text-sm font-bold hover:border-ink"
        >
          📋 Copy methods paragraph
        </button>
        <button onClick={onNew} className="px-5 py-3 font-mono text-sm text-ink-soft hover:text-ink">
          ↺ Start a new analysis
        </button>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-1.5">{children}</p>
    </div>
  );
}

function Note({ tone, children }: { tone: "tip" | "warn"; children: React.ReactNode }) {
  return (
    <p
      className={`mt-4 border-l-2 px-4 py-3 text-sm leading-relaxed ${
        tone === "warn" ? "border-sig bg-sig/5" : "border-plot bg-plot/5"
      }`}
    >
      {children}
    </p>
  );
}
