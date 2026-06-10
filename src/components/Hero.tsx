"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonGhost, ButtonPrimary } from "./ui";

const HeroVisual = dynamic(() => import("./HeroVisual"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink-soft">
      sampling n = 2,400…
    </div>
  ),
});

const stats = [
  { k: "20+", v: "statistical tests covered" },
  { k: "5", v: "questions to your answer" },
  { k: "APA 7", v: "write-up templates" },
  { k: "₹0", v: "to start, always" },
];

export default function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.21, 0.6, 0.35, 1] as const;

  return (
    <section id="top" className="graph-field relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-wrap grid-cols-1 px-5 pt-14 md:px-8 lg:grid-cols-12 lg:gap-6 lg:pt-20">
        {/* Copy — deliberately wider than half, pushing the visual off-axis */}
        <div className="relative z-10 lg:col-span-7 lg:pb-24">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft"
          >
            <span className="text-sig">H₁</span> · built for psychology dissertations
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.4rem]"
          >
            Stop guessing which test to run.{" "}
            <em className="text-plot">Know</em> it.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            Answer five questions about your study. Get the exact statistical
            test, the APA 7th-edition write-up, and a justification your
            supervisor can&rsquo;t argue with.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <ButtonPrimary href="/app">Find my test</ButtonPrimary>
            <ButtonGhost href="#pricing">See Pro features</ButtonGhost>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.74rem] text-ink-soft"
          >
            {["No sign-up to start", "APA 7th edition", "SPSS & jamovi", "Made by a psychologist"].map(
              (t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="text-plot">✓</span> {t}
                </li>
              )
            )}
          </motion.ul>
        </div>

        {/* 3D rejection-region bell — bleeds off the right edge */}
        <div className="relative lg:col-span-5">
          <div className="relative -mx-5 mt-8 h-[320px] sm:h-[400px] md:-mx-8 lg:absolute lg:inset-y-0 lg:-right-24 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[140%]">
            <HeroVisual />
            <p className="pointer-events-none absolute bottom-3 right-6 font-mono text-[0.66rem] text-ink-soft lg:right-28">
              each point is a participant · <span className="text-sig">red = p &lt; .05</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat strip set on an axis rule */}
      <div className="relative z-10 mx-auto max-w-wrap px-5 pb-10 md:px-8">
        <div className="axis-rule" aria-hidden />
        <dl className="grid grid-cols-2 gap-y-6 pt-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v}>
              <dt className="sr-only">{s.v}</dt>
              <dd className="font-display text-3xl font-semibold">{s.k}</dd>
              <dd className="mt-1 text-sm text-ink-soft">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
