# Seeker AI — Landing Page

An award-style animated landing page for **Seeker AI** (the FINANCE-AGENT repo), built with
**React 18 + Vite 6 + TypeScript + Tailwind + GSAP (ScrollTrigger) + Lenis + Framer Motion + Three.js (React Three Fiber v8)**.

## Run it

```bash
npm install
npm run dev        # → http://localhost:5173
```

```bash
npm run build      # typecheck + production build (dist/)
npm run preview    # serve the production build
```

## The three signature animations

1. **"Noise → Signal" hero** — ~9,000 GPU particles drift as market chaos, then snap onto the
   Seeker chart-line (emerald → blue) in sync with the headline. WebGL, custom shader,
   lazy-loaded chunk, static SVG fallback for reduced-motion / no-WebGL.
   → `src/features/landing/three/HeroCanvas.tsx`
2. **"How Seeker thinks"** — a pinned, scroll-scrubbed 5-scene story that builds a real advisory:
   9 profile chips → risk ring 72/100 → live NSE pills → allocation donut + 1,000-path Monte Carlo
   fan → typewriter advisory with citations → the 12-section document. Stacked cards on mobile,
   static diagram under reduced-motion.
   → `src/features/landing/components/HowSeekerThinks.tsx` + `src/features/landing/pipeline/`
3. **"Every number traces to a source" + manifesto** — tracer beams verify each claimed number
   against its engine, then a scroll-scrubbed kinetic manifesto with the receipts:
   9 · 12 · 1,000 · **0 invented numbers**.
   → `GroundedProof.tsx`, `Manifesto.tsx`

Everything respects `prefers-reduced-motion`, pauses offscreen, and keeps Three.js out of the
main bundle (`dist` chunks: main ~157 KB gz, three ~223 KB gz lazy).

## Structure

```
src/
├── components/            Logo, ButtonLink (shared UI)
├── lib/utils.ts           cn, seeded RNG, rAF tween
└── features/landing/
    ├── LandingPage.tsx    orchestrator
    ├── data.ts            all product copy (ground truth from the repo)
    ├── motion/            gsap registration, Lenis provider, SplitWords, Reveal/Magnetic
    ├── three/             HeroCanvas (WebGL)
    ├── pipeline/          scene components + RiskRing/Donut/MonteCarlo bits
    └── components/        one file per section
```

To merge this into the FINANCE-AGENT monorepo, see **INTEGRATION.md**.

> Market figures shown on the page are illustrative. Seeker AI is an educational tool, not a
> SEBI-registered investment adviser.
