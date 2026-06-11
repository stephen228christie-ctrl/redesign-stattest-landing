import { Eyebrow, Reveal } from "./ui";

const faqs = [
  {
    q: "Can't I just ask ChatGPT which test to use?",
    a: "You can — but StatTest Selector is built specifically for psychology dissertations. It knows your exact design constraints, checks your normality assumptions, gives you the APA template, the G*Power path, and a supervisor-ready justification. ChatGPT gives you a generic answer. This gives you a defensible one.",
  },
  {
    q: "Is the free tier actually useful or just a teaser?",
    a: "Genuinely useful — every free analysis is complete: the test recommendation, the full explanation, the APA write-up template, SPSS/jamovi steps, and the G*Power guide. You get 3 full analyses free. Pro doesn't unlock hidden features — it simply removes the limit, which matters once you're iterating on your design or helping coursemates.",
  },
  {
    q: "What if I'm on JASP, not SPSS or jamovi?",
    a: "JASP and jamovi share an almost identical interface and menu structure — the jamovi steps work for JASP with minimal adaptation. Both are free, and we note this inside the app.",
  },
  {
    q: "I'm an undergraduate. Is this suitable for me?",
    a: "Absolutely. The tool is designed for UG dissertation projects as much as postgrad ones. The explanations avoid unnecessary jargon, and the free tier covers everything a standard UG project needs.",
  },
  {
    q: "Will I get charged again automatically?",
    a: "Never — there's nothing to cancel because there's no subscription. Plans are prepaid passes: ₹99 buys 30 days of Pro, ₹199 buys 90 days. When the time runs out you simply drop back to the free tier. We don't store any payment method, so we couldn't auto-charge you even if we wanted to.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="border-b border-line bg-panel/50">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-12 px-5 py-20 md:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow index="6" label="Discussion" />
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Questions you&rsquo;re probably thinking.
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <details className="group border-b border-line py-1 open:pb-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-display text-xl font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="font-mono text-sm text-ink-soft transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
