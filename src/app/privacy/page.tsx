import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — StatTest",
  description: "How StatTest collects, stores, and protects your data.",
};

const LAST_UPDATED = "11 June 2026";
const CONTACT_EMAIL = "stephen228christie@gmail.com";

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated: {LAST_UPDATED}</p>

      <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Account data</strong> — your name and email address, collected
              when you sign up.
            </li>
            <li>
              <strong>Your analyses</strong> — the answers you give in the test
              selector and the results we generate, saved so you can revisit them
              from your dashboard.
            </li>
            <li>
              <strong>Payment data</strong> — payments are processed by Razorpay.
              We never see or store your card, UPI, or bank details; we keep only a
              record of the transaction (order id, plan, amount) for accounting.
            </li>
          </ul>
          <p className="mt-3">
            We do not use advertising trackers or third-party analytics, and we do
            not sell your data to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Where it lives</h2>
          <p className="mt-3">
            Account and analysis data is stored with Supabase, our database and
            authentication provider. Payments are handled by Razorpay (India).
            The site is hosted on Vercel. Your login session is kept in your own
            browser&apos;s local storage — we don&apos;t use tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Your rights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Access</strong> — your saved analyses and account details are
              visible on your dashboard.
            </li>
            <li>
              <strong>Deletion</strong> — you can permanently delete your account
              and all your data from the dashboard (&ldquo;Delete my account&rdquo;).
              Transaction records are retained in anonymized form, with no link to
              you, as required for accounting.
            </li>
            <li>
              <strong>Correction or export</strong> — email us and we&apos;ll help:{" "}
              <a className="underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Plans &amp; payments</h2>
          <p className="mt-3">
            Paid plans are prepaid passes: Pro Monthly grants 30 days of access and
            the Dissertation Pass grants 90 days. There is no auto-renewal and we
            store no payment instrument that could charge you again.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Changes &amp; contact</h2>
          <p className="mt-3">
            If this policy changes materially we&apos;ll update the date at the top.
            Questions? Reach us at{" "}
            <a className="underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12">
        <a href="/" className="font-mono text-[0.78rem] text-ink-soft hover:text-ink">
          ← Back to StatTest
        </a>
      </p>
    </main>
  );
}
