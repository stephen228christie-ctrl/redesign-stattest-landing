import { Eyebrow, Reveal } from "./ui";

const quotes = [
  {
    body:
      "I spent two days debating between a t-test and Mann–Whitney. This tool gave me the answer in 3 minutes and explained it better than my textbook.",
    initials: "PA",
    name: "Priya A.",
    role: "MSc Clinical Psychology",
  },
  {
    body:
      "The supervisor report alone is worth it. I pasted it into my proposal and my supervisor said the justification was thorough. First time she's said that.",
    initials: "RK",
    name: "Rahul K.",
    role: "MA Psychology, Delhi",
  },
  {
    body:
      "The SPSS steps are exactly how my software looks. I don't have to translate from some foreign textbook example anymore. Just click exactly what it says.",
    initials: "SM",
    name: "Sneha M.",
    role: "PhD student, Pune",
  },
];

export default function Testimonials() {
  return (
    <section className="border-b border-line bg-panel/50">
      <div className="mx-auto max-w-wrap px-5 py-20 md:px-8 lg:py-28">
        <Reveal>
          <Eyebrow index="5" label="Peer review" />
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Built from dissertation panic. Tested in the real world.
          </h2>
        </Reveal>

        {/* Staggered, asymmetric column rhythm instead of three equal cards */}
        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-12">
          {quotes.map((q, i) => (
            <Reveal
              key={q.initials}
              delay={i * 0.08}
              className={
                [
                  "md:col-span-5 md:col-start-1",
                  "md:col-span-5 md:col-start-7 md:mt-16",
                  "md:col-span-5 md:col-start-3 md:-mt-4",
                ][i]
              }
            >
              <figure className="border-l-2 border-sig bg-paper p-6 sm:p-7">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
                  Reviewer {i + 1} · accept
                </p>
                <blockquote className="mt-3 font-display text-lg leading-relaxed">
                  “{q.body}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center bg-ink font-mono text-xs text-paper"
                  >
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{q.name}</span>
                    <span className="block text-sm text-ink-soft">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
