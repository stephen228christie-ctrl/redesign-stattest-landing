import { ButtonPrimary, Reveal } from "./ui";

export function FinalCTA() {
  return (
    <section className="graph-field-dark bg-night text-paper">
      <div className="mx-auto max-w-wrap px-5 py-24 text-center md:px-8 lg:py-32">
        <Reveal>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-paper/60">
            <span className="text-sig">Conclusion</span> · reject the null
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your dissertation deserves the <em className="text-paper">right</em> test.
          </h2>
          <p className="mt-5 text-lg text-paper/70">
            Start free in 30 seconds. No account needed.
          </p>
          <div className="mt-9 flex justify-center">
            <ButtonPrimary href="/app" dark>
              Find my statistical test
            </ButtonPrimary>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-night text-paper/60">
      <div className="mx-auto flex max-w-wrap flex-col items-start justify-between gap-4 border-t border-paper/15 px-5 py-8 text-sm sm:flex-row sm:items-center md:px-8">
        <p>
          <span className="font-display text-base font-semibold text-paper">
            StatTest Selector
          </span>
          <span className="ml-2 font-mono text-[0.7rem] text-sig">p &lt; .05</span>
        </p>
        <p className="font-mono text-[0.72rem]">
          Based on APA 7th edition &amp; Field (2018) guidelines · Made for
          psychology students in India ·{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-paper">
            Privacy
          </a>
        </p>
      </div>
    </footer>
  );
}
