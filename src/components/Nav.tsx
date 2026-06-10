"use client";

import { useState } from "react";

const links = [
  { href: "#method", label: "How it works" },
  { href: "#preview", label: "Try it" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-wrap items-center justify-between px-5 py-3.5 md:px-8">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">
            StatTest
          </span>
          <span className="font-mono text-[0.68rem] text-sig">p&nbsp;&lt;&nbsp;.05</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="tick-link text-[0.92rem] text-ink-soft hover:text-ink">
              {l.label}
            </a>
          ))}
          <a href="/login" className="tick-link text-[0.92rem] text-ink-soft hover:text-ink">
            Log in
          </a>
          <a
            href="/login?tab=signup"
            className="bg-ink px-4 py-2 text-[0.88rem] font-bold text-paper transition-colors hover:bg-night-soft"
          >
            Sign up free
          </a>
        </nav>

        <button
          className="md:hidden font-mono text-sm"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "close ×" : "menu ≡"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line px-5 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-ink-soft"
            >
              {l.label}
            </a>
          ))}
          <a href="/login" className="block py-2.5 text-ink-soft">Log in</a>
          <a
            href="/login?tab=signup"
            className="mt-2 inline-block bg-ink px-4 py-2 font-bold text-paper"
          >
            Sign up free
          </a>
        </nav>
      )}
    </header>
  );
}
