"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eyebrow, Reveal } from "./ui";
import { Dist, Goal, Groups, recommend } from "@/lib/recommend";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 text-[0.88rem] transition-colors ${
        active
          ? "border-paper bg-paper text-ink"
          : "border-paper/25 text-paper/80 hover:border-paper/60"
      }`}
    >
      {children}
    </button>
  );
}

export default function Preview() {
  const [goal, setGoal] = useState<Goal>("compare");
  const [groups, setGroups] = useState<Groups>("two");
  const [dist, setDist] = useState<Dist>("normal");
  const reduce = useReducedMotion();

  const rec = useMemo(
    () => recommend(goal, goal === "compare" ? groups : null, dist),
    [goal, groups, dist]
  );

  return (
    <section id="preview" className="graph-field-dark border-b border-line bg-night text-paper">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-12 px-5 py-20 md:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow index="3" label="Live preview" dark />
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Try the decision tree. Right here.
            </h2>
            <p className="mt-5 leading-relaxed text-paper/70">
              This is a simplified slice of the real selector — three of the
              five questions, for independent-groups designs. The full app
              also handles repeated measures, factorial designs, categorical
              outcomes, and assumption checks.
            </p>
            <a
              href="/app"
              className="mt-7 inline-flex items-center gap-2 border border-paper/30 px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:border-paper"
            >
              Open the full selector <span aria-hidden className="font-mono">→</span>
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal delay={0.1}>
            <div className="border border-paper/20 bg-night-soft/70 p-6 sm:p-8">
              <fieldset>
                <legend className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-paper/60">
                  Q1 · What is your goal?
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip active={goal === "compare"} onClick={() => setGoal("compare")}>
                    Compare groups
                  </Chip>
                  <Chip active={goal === "relationship"} onClick={() => setGoal("relationship")}>
                    Find a relationship
                  </Chip>
                  <Chip active={goal === "predict"} onClick={() => setGoal("predict")}>
                    Predict an outcome
                  </Chip>
                </div>
              </fieldset>

              {goal === "compare" && (
                <fieldset className="mt-6">
                  <legend className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-paper/60">
                    Q2 · How many independent groups?
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={groups === "two"} onClick={() => setGroups("two")}>
                      Two
                    </Chip>
                    <Chip active={groups === "three"} onClick={() => setGroups("three")}>
                      Three or more
                    </Chip>
                  </div>
                </fieldset>
              )}

              {goal !== "predict" && (
                <fieldset className="mt-6">
                  <legend className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-paper/60">
                    Q3 · Is your data approximately normal?
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={dist === "normal"} onClick={() => setDist("normal")}>
                      Yes, roughly normal
                    </Chip>
                    <Chip active={dist === "nonnormal"} onClick={() => setDist("nonnormal")}>
                      No / ordinal data
                    </Chip>
                  </div>
                </fieldset>
              )}

              <div className="mt-8 border-t border-paper/15 pt-6" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rec.test}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-sig">
                      Recommended test
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                      {rec.test}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-paper/70">
                      {rec.why}
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="border border-paper/15 p-4">
                        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-paper/50">
                          APA 7 template
                        </p>
                        <p className="mt-2 font-mono text-sm text-paper">{rec.apa}</p>
                      </div>
                      <div className="border border-paper/15 p-4">
                        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-paper/50">
                          If assumptions fail
                        </p>
                        <p className="mt-2 text-sm text-paper/85">{rec.alternative}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
