"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/** Scroll-triggered reveal that respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section label set like a stat-notation running head, e.g. "§2 · METHOD". */
export function Eyebrow({
  index,
  label,
  dark = false,
}: {
  index: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <p
      className={`font-mono text-[0.72rem] tracking-[0.22em] uppercase ${
        dark ? "text-paper/60" : "text-ink-soft"
      }`}
    >
      <span className={dark ? "text-sig" : "text-sig"}>§{index}</span>
      <span className="mx-2">·</span>
      {label}
    </p>
  );
}

export function ButtonPrimary({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 px-6 py-3 font-body font-bold text-[0.95rem] transition-transform duration-200 hover:-translate-y-0.5 ${
        dark
          ? "bg-paper text-ink hover:bg-white"
          : "bg-ink text-paper hover:bg-night-soft"
      }`}
    >
      {children}
      <span aria-hidden className="font-mono">→</span>
    </a>
  );
}

export function ButtonGhost({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 px-6 py-3 font-body font-bold text-[0.95rem] border transition-colors ${
        dark
          ? "border-paper/30 text-paper hover:border-paper"
          : "border-line-strong text-ink hover:border-ink"
      }`}
    >
      {children}
    </a>
  );
}
