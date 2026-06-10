import { Eyebrow, Reveal } from "./ui";

const pains = [
  {
    q: "“Is my data normal enough for a t-test?”",
    a: "Asked at 1 a.m., three days before the proposal deadline.",
  },
  {
    q: "“My supervisor says justify the test choice.”",
    a: "The textbook chapter assumes you already know the answer.",
  },
  {
    q: "“ChatGPT gave me two different answers.”",
    a: "Generic advice can’t see your design, your scales, or your sample.",
  },
];

export default function Problem() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-12 px-5 py-20 md:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow index="1" label="The problem" />
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Choosing the test is the part nobody teaches properly.
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              You collected the data. You can run SPSS. But between
              &ldquo;research question&rdquo; and &ldquo;results section&rdquo;
              sits one decision that decides whether your analysis stands or
              falls — and most students make it by anxious guesswork.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              StatTest Selector replaces the guesswork with a guided decision:
              your design in, the defensible test out, with the reasoning
              written down so you can stand behind it.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="space-y-0">
            {pains.map((p, i) => (
              <Reveal key={p.q} delay={i * 0.08}>
                <li className="border-t border-line py-6 first:border-t-0 lg:pl-6">
                  <p className="font-display text-xl font-medium italic">{p.q}</p>
                  <p className="mt-2 text-[0.95rem] text-ink-soft">{p.a}</p>
                </li>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <li className="mt-2 border-t-2 border-ink py-6 lg:pl-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-sig">
                  The solution
                </p>
                <p className="mt-2 font-display text-xl font-medium">
                  Five plain-language questions. One exact recommendation. A
                  paragraph of justification you can paste into your proposal.
                </p>
              </li>
            </Reveal>
          </ul>
        </div>
      </div>
    </section>
  );
}
