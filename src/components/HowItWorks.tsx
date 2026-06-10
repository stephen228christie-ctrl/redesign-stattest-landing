import { Eyebrow, Reveal } from "./ui";

const steps = [
  {
    n: "1",
    title: "Describe your study",
    body: "Answer simple questions about your research objective, study design, and the type of data you collected. No statistics knowledge required.",
    tier: "Free for everyone",
  },
  {
    n: "2",
    title: "Get your test recommendation",
    body: "StatTest recommends the exact test for your design — with a clear explanation of why, common pitfalls, and the alternative test if assumptions fail.",
    tier: "Free for everyone",
  },
  {
    n: "3",
    title: "Copy your APA write-up",
    body: "A fill-in-the-blanks APA 7th-edition results template, ready to paste into your dissertation. No formatting panic.",
    tier: "Free for everyone",
  },
  {
    n: "4",
    title: "Run it & ask the AI assistant",
    body: "Exact SPSS and jamovi click-paths, a G*Power walkthrough, and an AI assistant for follow-up questions — scoped entirely to statistics.",
    tier: "Pro",
  },
  {
    n: "5",
    title: "Generate your supervisor report",
    body: "One click writes a paragraph justifying your chosen test in academic language. Paste it into your proposal or ethics form.",
    tier: "Pro",
  },
];

export default function HowItWorks() {
  return (
    <section id="method" className="border-b border-line bg-panel/50">
      <div className="mx-auto max-w-wrap px-5 py-20 md:px-8 lg:py-28">
        <Reveal>
          <Eyebrow index="2" label="Method" />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              From research question to the right test, in the order a
              methods chapter would do it.
            </h2>
            <p className="max-w-sm text-[0.95rem] text-ink-soft">
              No textbooks. No second-guessing. A guided flow that accounts
              for your exact design.
            </p>
          </div>
        </Reveal>

        {/* A procedure timeline: steps hang off a single vertical rule */}
        <ol className="relative mt-14 space-y-0 border-l border-line-strong lg:ml-2">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <li className="relative grid grid-cols-1 gap-2 py-7 pl-8 sm:grid-cols-12 sm:gap-6 lg:pl-12">
                <span
                  aria-hidden
                  className={`absolute -left-[5px] top-9 h-[9px] w-[9px] rounded-full ${
                    s.tier === "Pro" ? "bg-sig" : "bg-plot"
                  }`}
                />
                <div className="sm:col-span-3 lg:col-span-2">
                  <span className="font-mono text-sm text-ink-soft">step {s.n} / 5</span>
                  <p
                    className={`mt-1 inline-block font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:block ${
                      s.tier === "Pro" ? "text-sig" : "text-plot"
                    }`}
                  >
                    {s.tier}
                  </p>
                </div>
                <div className="sm:col-span-9 lg:col-span-7">
                  <h3 className="font-display text-2xl font-medium">{s.title}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
