# Integrating into FINANCE-AGENT (`apps/web`)

This standalone project mirrors the repo's structure so the merge is mostly file copies.
Paste this checklist to Claude Code / Cursor inside the repo, or follow it by hand.

## 1. Install deps (repo root)

```bash
npm install gsap @gsap/react lenis three @types/three --workspace apps/web
npm install @react-three/fiber@^8 --workspace apps/web
```

**React 18 pin:** `@react-three/fiber` must stay on **v8** (v9 requires React 19). Do not upgrade React.

## 2. Copy files

| From (this project) | To (repo) |
|---|---|
| `src/features/landing/**` | `apps/web/src/features/landing/**` (replace the folder) |
| `src/lib/utils.ts` → merge | keep repo's `cn` (clsx + tailwind-merge, identical); add `mulberry32`, `animateValue`, `formatIN` |
| `src/styles/globals.css` → merge | repo already has the tokens + glass system; copy ONLY the "Landing-specific motion helpers" block (split-line/word, chip-float, cue-drop, spotlight-card, edge-mask, .eyebrow, .tnum, the lenis html rules, and `overflow-x: clip` on body) |
| `index.html` meta/OG tags | merge into `apps/web/index.html` (keep the theme bootstrap script) |

Do **not** copy: `src/components/Logo.tsx` and `Button.tsx` (repo versions exist), `App.tsx`, `main.tsx`.

## 3. Re-wire repo-specific bits (5 small edits in the landing folder)

1. `ButtonLink`/anchors → repo `<Button>` wrapped in react-router `<Link>`.
2. CTA targets: replace every `href="/auth"` with the auth-aware route from the old page:
   ```ts
   const user = useAuthStore((s) => s.user);
   const cta = user ? (user.onboarded ? '/app' : '/onboarding') : '/auth';
   ```
3. `import { SEBI_DISCLAIMER } from '../data'` → `from '@seeker/shared'` (then delete the copy in `data.ts`).
4. `LandingNav`: add the repo's `<ThemeToggle />` next to "Sign in".
5. Keep `LandingPage.tsx`'s **default export** (it is lazy-loaded from `App.tsx`; route `/`).

## 4. Optional next steps

- Feed `TICKER_ITEMS` from the live market API instead of the illustrative constants.
- Wire the strategy cards' fit scores to `/strategies` data per user.
- Add the OG image at `apps/web/public/og.png` (1200×630, dark ink + gradient line + wordmark).

## 5. Verify (from the build prompts' QA pass)

- `npm run typecheck` clean; `/` renders; `/auth` round-trip leaves no duplicate Lenis/ScrollTrigger.
- Reduced-motion ON → every section readable, no pin, no three.js chunk fetched.
- Mobile < 1024px → stacked "How Seeker thinks", no horizontal overflow.
- SEBI disclaimer intact in the footer; light theme still legible.
