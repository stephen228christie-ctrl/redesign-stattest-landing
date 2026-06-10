# StatTest Selector — Landing Page

A complete redesign of the StatTest Selector landing page: a guided tool that helps psychology students find the right statistical test, with APA 7 write-ups, SPSS/jamovi steps, and supervisor justification reports.

## Design concept

**"The journal article meets the scatter plot."** The visual identity is drawn from the world the product lives in — statistics, APA manuscripts, and graph paper:

- **Signature 3D hero** — a bivariate-normal point cloud of 2,400 "participants" rendered in React Three Fiber. Points beyond ±1.96 SD glow significance-red: the rejection region, the brand's `p < .05` motif. The cloud tilts toward the cursor and breathes; it falls back to a static render under `prefers-reduced-motion`.
- **Typography** — Spectral (journal-style display serif), Atkinson Hyperlegible (body, designed for readability), IBM Plex Mono (stat notation, eyebrows, APA templates).
- **Structure as information** — section eyebrows are set like manuscript running heads (`§2 · Method`, `Conclusion · reject the null`), dividers are styled as chart axes with tick marks, testimonials are framed as peer-review comments.
- **Live preview** — a working slice of the actual decision tree (goal → groups → distribution → recommended test + APA template + fallback test).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber / Three.js

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub and import the repo in [Vercel](https://vercel.com/new) — no configuration needed (`npm run build`, output is fully static).

## Accessibility & performance

- Honors `prefers-reduced-motion` (3D idle + Framer reveals)
- Visible keyboard focus, skip link, semantic landmarks, labelled table marks
- Three.js chunk is dynamically imported; first load JS ≈ 129 kB
- Native `<details>` FAQ — works without JavaScript
