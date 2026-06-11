import { Eyebrow, Reveal } from "./ui";
import RazorpayButton from "./RazorpayButton";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    cadence: "",
    note: "Always free. No card required.",
    cta: "Start for free",
    href: "/login?tab=signup",
    featured: false,
    plan: null,
    items: [
      ["Full test selector", true],
      ['"Why this test?" explanation', true],
      ["APA write-up template", true],
      ["AI assistant", false],
      ["SPSS / jamovi steps", false],
      ["Supervisor report", false],
    ] as [string, boolean][],
  },
  {
    name: "Pro Monthly",
    price: "₹99",
    cadence: "/mo",
    note: "Cancel anytime. Instant access.",
    cta: "Get Pro — ₹99/mo",
    href: null,
    featured: true,
    plan: "pro" as const,
    items: [
      ["Everything in Free", true],
      ["AI stats assistant", true],
      ["Supervisor report", true],
      ["SPSS & jamovi steps", true],
      ["G*Power walkthrough", true],
      ["Full assumption checklist", true],
    ] as [string, boolean][],
  },
  {
    name: "Dissertation Pass",
    price: "₹199",
    cadence: " once",
    note: "3 months of full Pro. Pay once, no renewal.",
    cta: "Get Pass — ₹199",
    href: null,
    featured: false,
    plan: "pass" as const,
    items: [
      ["Everything in Pro", true],
      ["3 months — no renewal", true],
      ["Perfect for dissertation season", true],
      ["Cheaper than one tuition session", true],
    ] as [string, boolean][],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-b border-line">
      <div className="mx-auto max-w-wrap px-5 py-20 md:px-8 lg:py-28">
        <Reveal>
          <Eyebrow index="6" label="Pricing" />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Honest pricing. No annual trap.
            </h2>
            <p className="max-w-sm text-[0.95rem] text-ink-soft">
              Start free. Upgrade when you need more — for less than a cup of
              coffee.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <div
                className={`relative flex h-full flex-col p-7 sm:p-8 ${
                  t.featured ? "bg-night text-paper" : "bg-paper"
                }`}
              >
                {t.featured && (
                  <p className="absolute right-7 top-7 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-sig">
                    most popular
                  </p>
                )}
                <h3 className="font-mono text-[0.78rem] uppercase tracking-[0.2em]">
                  {t.name}
                </h3>
                <p className="mt-5 font-display text-5xl font-semibold">
                  {t.price}
                  <span
                    className={`font-body text-base font-normal ${
                      t.featured ? "text-paper/60" : "text-ink-soft"
                    }`}
                  >
                    {t.cadence}
                  </span>
                </p>
                <p className={`mt-2 text-sm ${t.featured ? "text-paper/60" : "text-ink-soft"}`}>
                  {t.note}
                </p>
                <ul className="mt-7 flex-1 space-y-2.5 text-[0.93rem]">
                  {t.items.map(([item, on]) => (
                    <li key={item} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className={
                          on
                            ? t.featured
                              ? "text-paper"
                              : "text-plot"
                            : "text-line-strong"
                        }
                      >
                        {on ? "✓" : "—"}
                      </span>
                      <span
                        className={
                          on ? "" : t.featured ? "text-paper/40" : "text-ink-soft/60"
                        }
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {t.plan ? (
                    <RazorpayButton
                      plan={t.plan}
                      planName={t.name}
                      className={`w-full px-5 py-3 text-center text-[0.92rem] font-bold transition-colors ${
                        t.featured
                          ? "bg-paper text-ink hover:bg-white"
                          : "border border-line-strong hover:border-ink"
                      }`}
                    >
                      {t.cta}
                    </RazorpayButton>
                  ) : (
                    <a
                      href={t.href!}
                      className={`inline-block w-full px-5 py-3 text-center text-[0.92rem] font-bold transition-colors border border-line-strong hover:border-ink`}
                    >
                      {t.cta}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center font-mono text-[0.72rem] text-ink-soft">
          Razorpay secure payment · India-first · Trusted by psychology students
        </p>
      </div>
    </section>
  );
}
