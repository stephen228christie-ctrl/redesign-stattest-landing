"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sb, SITE_URL } from "@/lib/supabase";

type Tab = "login" | "signup" | "forgot";

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Always use the explicit new site URL — never window.location.origin
// because Supabase ignores emailRedirectTo if it doesn't match the Site URL
const CALLBACK = `${SITE_URL}/auth/callback`;

function strength(val: string) {
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return [
    { w: "20%", c: "#C32B3E", t: "Too weak" },
    { w: "40%", c: "#D97706", t: "Weak" },
    { w: "60%", c: "#CA8A04", t: "Fair" },
    { w: "80%", c: "#2547CE", t: "Strong" },
    { w: "100%", c: "#2547CE", t: "Very strong" },
  ][Math.min(score, 4)];
}

function Field({
  label, type = "text", value, onChange, error, autoComplete,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string | null; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="block">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          type={isPw && show ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border bg-paper px-3.5 py-2.5 text-[0.95rem] outline-none transition-colors focus:border-plot ${error ? "border-sig" : "border-line-strong"}`}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-soft">
            {show ? "hide" : "show"}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-sig">{error}</span>}
    </label>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const initialTab = (params.get("tab") as Tab) || "login";
  const [tab, setTab] = useState<Tab>(["login","signup","forgot"].includes(initialTab) ? initialTab : "login");
  const returnUrl = params.get("return") || "/dashboard";

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [alert, setAlert] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [signupSent, setSignupSent] = useState(false);

  useEffect(() => {
    // If already logged in, go straight to dashboard
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = returnUrl;
    });
    // Listen for sign-in events (handles auto-confirm case)
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        window.location.href = returnUrl;
      }
    });
    return () => subscription.unsubscribe();
  }, [returnUrl]);

  function switchTab(t: Tab) {
    setTab(t); setAlert(null); setErrors({});
    setForgotSent(false); setSignupSent(false);
  }

  async function handleGoogle() {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: CALLBACK },
    });
    if (error) setAlert(error.message);
  }

  async function handleLogin() {
    if (!validEmail(email) || !pw) { setAlert("Please enter your email and password."); return; }
    setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) { setAlert(error.message); return; }
    // onAuthStateChange handles the redirect
  }

  async function handleSignup() {
    const errs: Record<string, string | null> = {
      first: first.trim() ? null : "Required",
      email: validEmail(email) ? null : "Please enter a valid email",
      pw: pw.length >= 8 ? null : "Minimum 8 characters",
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    const { data, error } = await sb.auth.signUp({
      email, password: pw,
      options: {
        data: { name: first.trim() + (last.trim() ? " " + last.trim() : "") },
        emailRedirectTo: CALLBACK,
      },
    });
    setBusy(false);
    if (error) { setAlert(error.message); return; }
    // If Supabase auto-confirmed (no email needed), session exists immediately
    if (data.session) {
      window.location.href = returnUrl;
      return;
    }
    // Email confirmation required — show "check inbox" message
    setSignupSent(true);
  }

  async function handleForgot() {
    if (!validEmail(email)) { setAlert("Please enter a valid email address."); return; }
    setBusy(true);
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: CALLBACK,
    });
    setBusy(false);
    if (error) { setAlert(error.message); return; }
    setForgotSent(true);
  }

  const s = strength(pw);

  return (
    <div className="graph-field flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex max-w-wrap items-center justify-between px-5 py-3.5 md:px-8">
          <a href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold tracking-tight">StatTest</span>
            <span className="font-mono text-[0.68rem] text-sig">p&nbsp;&lt;&nbsp;.05</span>
          </a>
          <a href="/" className="tick-link text-sm text-ink-soft">← Back to home</a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="border border-line bg-paper p-7 sm:p-9">

            {signupSent ? (
              <div className="py-4 text-center">
                <p aria-hidden className="text-4xl">📬</p>
                <h1 className="mt-4 font-display text-2xl font-semibold">Check your inbox</h1>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  We&rsquo;ve sent a confirmation link to <strong>{email}</strong>.
                  Click it and you&rsquo;ll land straight on your dashboard.
                </p>
                <p className="mt-4 text-xs text-ink-soft">
                  No email? Check your spam, or{" "}
                  <button onClick={() => { setSignupSent(false); setAlert(null); }} className="text-plot underline">
                    try again
                  </button>.
                </p>
              </div>

            ) : tab !== "forgot" ? (
              <>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sig">
                  {tab === "login" ? "Welcome back" : "Start free"}
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold">
                  {tab === "login" ? "Log in" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm text-ink-soft">
                  {tab === "login" ? "Access your analyses and Pro features." : "3 full analyses included, no card needed."}
                </p>

                <div className="mt-6 grid grid-cols-2 border border-line" role="tablist">
                  {(["login", "signup"] as Tab[]).map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
                      className={`py-2.5 font-mono text-[0.74rem] uppercase tracking-[0.14em] ${tab === t ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>
                      {t === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <button onClick={handleGoogle}
                    className="w-full border border-line-strong px-5 py-3 text-sm font-bold transition-colors hover:border-ink">
                    {tab === "login" ? "Continue with Google" : "Sign up with Google"}
                  </button>
                  <div className="my-5 flex items-center gap-3" aria-hidden>
                    <span className="h-px flex-1 bg-line" />
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft">or</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </div>

                {alert && (
                  <p role="alert" className="mb-4 border-l-2 border-sig bg-sig/5 px-3.5 py-2.5 text-sm">{alert}</p>
                )}

                {tab === "login" ? (
                  <div className="space-y-4">
                    <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
                    <Field label="Password" type="password" value={pw} onChange={setPw} autoComplete="current-password" />
                    <div className="text-right">
                      <button onClick={() => switchTab("forgot")} className="font-mono text-[0.72rem] text-plot hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <button onClick={handleLogin} disabled={busy}
                      className="w-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-night-soft disabled:opacity-50">
                      {busy ? "Logging in…" : "Log in"}
                    </button>
                    <p className="text-center text-sm text-ink-soft">
                      Don&rsquo;t have an account?{" "}
                      <button onClick={() => switchTab("signup")} className="font-bold text-plot hover:underline">Sign up free</button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First name" value={first} onChange={setFirst} error={errors.first} autoComplete="given-name" />
                      <Field label="Last name" value={last} onChange={setLast} autoComplete="family-name" />
                    </div>
                    <Field label="Email address" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" />
                    <div>
                      <Field label="Password" type="password" value={pw} onChange={setPw} error={errors.pw} autoComplete="new-password" />
                      {pw && (
                        <p className="mt-2 flex items-center gap-2" aria-live="polite">
                          <span className="h-1.5 w-28 bg-panel">
                            <span className="block h-full transition-all" style={{ width: s.w, background: s.c }} />
                          </span>
                          <span className="font-mono text-[0.7rem]" style={{ color: s.c }}>{s.t}</span>
                        </p>
                      )}
                    </div>
                    <button onClick={handleSignup} disabled={busy}
                      className="w-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-night-soft disabled:opacity-50">
                      {busy ? "Creating account…" : "Create free account"}
                    </button>
                    <p className="text-center text-xs text-ink-soft">
                      By signing up you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <p className="text-center text-sm text-ink-soft">
                      Already have an account?{" "}
                      <button onClick={() => switchTab("login")} className="font-bold text-plot hover:underline">Log in</button>
                    </p>
                  </div>
                )}
              </>

            ) : (
              <>
                <button onClick={() => switchTab("login")} className="font-mono text-[0.72rem] text-ink-soft hover:text-ink">
                  ← Back to login
                </button>
                {!forgotSent ? (
                  <>
                    <h1 className="mt-4 font-display text-3xl font-semibold">Reset your password</h1>
                    <p className="mt-2 text-sm text-ink-soft">Enter your email and we&rsquo;ll send a reset link.</p>
                    {alert && <p role="alert" className="mt-4 border-l-2 border-sig bg-sig/5 px-3.5 py-2.5 text-sm">{alert}</p>}
                    <div className="mt-6 space-y-4">
                      <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
                      <button onClick={handleForgot} disabled={busy}
                        className="w-full bg-ink px-5 py-3 text-sm font-bold text-paper hover:bg-night-soft disabled:opacity-50">
                        {busy ? "Sending…" : "Send reset link"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 text-center">
                    <p aria-hidden className="text-3xl">📬</p>
                    <h1 className="mt-3 font-display text-2xl font-semibold">Check your inbox</h1>
                    <p className="mt-2 text-sm text-ink-soft">
                      We&rsquo;ve sent a password reset link to your email. It expires in 15 minutes.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <p className="mt-5 text-center font-mono text-[0.68rem] text-ink-soft">
            Built for psychology dissertations · APA 7 · Field (2018)
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center font-mono text-sm text-ink-soft">loading…</p>}>
      <LoginInner />
    </Suspense>
  );
}
