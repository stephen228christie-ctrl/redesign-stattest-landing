import { Eyebrow, Reveal } from "./ui";

const rows: [string, boolean | string, boolean | string][] = [
  ["Analyses included", "3", "Unlimited"],
  ["Test selector — all 20+ tests", true, true],
  ["“Why this test?” explanation", true, true],
  ["APA 7th-edition write-up template", true, true],
  ["Alternative test comparison", true, true],
  ["SPSS & jamovi step-by-step guide", true, true],
  ["G*Power path & settings", true, true],
  ["Full assumption checklist", true, true],
];

function Mark({ on, label }: { on: boolean | string; label: string }) {
  if (typeof on === "string")
    return <span className="font-mono text-[0.78rem] font-medium">{on}</span>;
  return on ? (
    <span className="text-plot" aria-label={`Included: ${label}`}>✓</span>
  ) : (
    <span className="text-line-strong" aria-label={`Not included: ${label}`}>—</span>
  );
}

export default function Features() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-12 px-5 py-20 md:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4 lg:col-start-1">
          <Reveal>
            <Eyebrow index="4" label="Free vs Pro" />
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Everything you need, nothing you don&rsquo;t.
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Every analysis is complete — the test recommendation, the
              reasoning, the APA template, the software steps, and the power
              analysis. Free gives you 3 full analyses; Pro simply removes
              the limit for as long as your pass runs.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal delay={0.1}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-ink font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink-soft">
                  <th scope="col" className="py-3 pr-4 font-medium">Feature</th>
                  <th scope="col" className="w-16 py-3 text-center font-medium">Free</th>
                  <th scope="col" className="w-16 py-3 text-center font-medium text-sig">Pro</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([f, free, pro]) => (
                  <tr key={f} className="border-b border-line">
                    <th scope="row" className="py-3.5 pr-4 text-[0.95rem] font-normal">
                      {f}
                    </th>
                    <td className="py-3.5 text-center"><Mark on={free} label={f} /></td>
                    <td className="py-3.5 text-center"><Mark on={pro} label={f} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
