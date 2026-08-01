import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../motion/gsap';
import { prefersReducedMotion } from '../motion/useReducedMotion';
import { mulberry32 } from '@/lib/utils';
import { DONUT_SEGS, type MCHandle } from '../pipeline/bits';
import { SceneAdvisory, SceneAI, SceneEngine, SceneMarket, SceneProfile, type SceneMode } from '../pipeline/scenes';

/*
 * Signature Animation #2 — "How Seeker thinks".
 * Desktop: a pinned 450vh scroll story, five scenes on one scrubbed timeline.
 * Mobile:  the same five scenes stacked, animating once in view.
 * Reduced: static five-step diagram.
 */

const SCENES = [
  { head: 'It starts with you.', label: 'You', start: 0.0 },
  { head: 'Then the market — live.', label: 'Market', start: 0.18 },
  { head: 'A quant engine does the math.', label: 'Engine', start: 0.38 },
  { head: 'The AI explains. It never invents.', label: 'AI', start: 0.62 },
  { head: 'Twelve sections. Zero hand-waving.', label: 'Advisory', start: 0.8 },
];

type Mode = SceneMode;

function calcMode(): Mode {
  if (prefersReducedMotion()) return 'static';
  return window.matchMedia('(min-width: 1024px)').matches ? 'pinned' : 'flow';
}

export function HowSeekerThinks() {
  const [mode, setMode] = useState<Mode>(() => (typeof window === 'undefined' ? 'flow' : calcMode()));

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setMode(calcMode());
    mql.addEventListener('change', on);
    rm.addEventListener('change', on);
    return () => {
      mql.removeEventListener('change', on);
      rm.removeEventListener('change', on);
    };
  }, []);

  return (
    <section id="how-it-works" className="relative scroll-mt-20">
      {mode === 'pinned' ? <PinnedPipeline key="pinned" /> : <FlowPipeline key={mode} mode={mode} />}
    </section>
  );
}

/* ── Desktop: pinned + scrubbed ──────────────────────────────── */

function PinnedPipeline() {
  const wrap = useRef<HTMLDivElement>(null);
  const mcRef = useRef<MCHandle>(null);

  const chipOffsets = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 9 }, () => ({
      x: (rnd() - 0.5) * 520,
      y: (rnd() - 0.5) * 340,
    }));
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(wrap);

      // Initial states.
      gsap.set(q('.hww-scene'), { autoAlpha: 0 });
      gsap.set(q('.hww-scene-0'), { autoAlpha: 1 });
      gsap.set(q('.hww-head'), { autoAlpha: 0, y: 14 });
      gsap.set(q('.hww-head-0'), { autoAlpha: 1, y: 0 });
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: '+=450%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Scene + headline crossfades, progress rail.
      SCENES.forEach((s, i) => {
        if (i > 0) {
          tl.to(q(`.hww-scene-${i - 1}`), { autoAlpha: 0, duration: 0.025, ease: 'none' }, s.start - 0.025)
            .to(q(`.hww-head-${i - 1}`), { autoAlpha: 0, y: -14, duration: 0.025, ease: 'none' }, s.start - 0.025)
            .to(q(`.hww-scene-${i}`), { autoAlpha: 1, duration: 0.025, ease: 'none' }, s.start)
            .to(q(`.hww-head-${i}`), { autoAlpha: 1, y: 0, duration: 0.025, ease: 'none' }, s.start);
        }
        tl.to(q(`.rail-dot-${i}`), { backgroundColor: '#34d399', scale: 1.3, duration: 0.01 }, Math.max(s.start, 0.001))
          .to(q(`.rail-label-${i}`), { color: 'rgb(226,232,240)', duration: 0.01 }, Math.max(s.start, 0.001));
      });

      /* S1 — chips fly in, converge into the profile card, ring draws. */
      tl.fromTo(
        q('.s1-chip'),
        {
          x: (i: number) => chipOffsets[i].x,
          y: (i: number) => chipOffsets[i].y,
          autoAlpha: 0,
          scale: 0.85,
        },
        { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.05, stagger: 0.006 },
        0.008,
      );
      tl.to(
        q('.s1-chip'),
        {
          x: (_: number, el: Element) => {
            const grid = (el as HTMLElement).offsetParent as HTMLElement;
            const h = el as HTMLElement;
            return grid.offsetWidth / 2 - (h.offsetLeft + h.offsetWidth / 2);
          },
          y: (_: number, el: Element) => {
            const grid = (el as HTMLElement).offsetParent as HTMLElement;
            const h = el as HTMLElement;
            return grid.offsetHeight / 2 - (h.offsetTop + h.offsetHeight / 2);
          },
          scale: 0.15,
          autoAlpha: 0,
          duration: 0.045,
          stagger: 0.002,
          ease: 'power2.in',
        },
        0.1,
      );
      tl.fromTo(
        q('.s1-card'),
        { autoAlpha: 0, scale: 0.7 },
        { autoAlpha: 1, scale: 1, duration: 0.04, ease: 'back.out(1.5)' },
        0.115,
      );
      const ringProxy = { v: 0 };
      const ringFg = q<SVGCircleElement>('.s1-ring-fg')[0];
      const ringNum = q<HTMLElement>('.s1-ring-num')[0];
      tl.to(
        ringProxy,
        {
          v: 72,
          duration: 0.05,
          ease: 'none',
          onUpdate: () => {
            if (ringFg) ringFg.style.strokeDashoffset = String(100 - ringProxy.v);
            if (ringNum) ringNum.textContent = String(Math.round(ringProxy.v));
          },
        },
        0.125,
      );

      /* S2 — data streams in. */
      tl.fromTo(q('.s2-profile'), { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.03 }, 0.19);
      tl.fromTo(
        q('.s2-pill'),
        { autoAlpha: 0, x: 110 },
        { autoAlpha: 1, x: 0, duration: 0.04, stagger: 0.006 },
        0.21,
      );
      tl.fromTo(q('.s2-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.3);

      /* S3 — the engine computes: donut + Monte Carlo. */
      tl.fromTo(
        q('.s3-engine'),
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.03, ease: 'back.out(1.6)' },
        0.39,
      );
      DONUT_SEGS.forEach((s, k) => {
        tl.fromTo(
          q(`.s3-seg-${k}`),
          { attr: { 'stroke-dasharray': '0 100' } },
          { attr: { 'stroke-dasharray': `${s.pct} ${100 - s.pct}` }, duration: 0.03, ease: 'none' },
          0.405 + k * 0.026,
        );
        tl.fromTo(
          q(`.s3-leg-${k}`),
          { autoAlpha: 0, x: -10 },
          { autoAlpha: 1, x: 0, duration: 0.02 },
          0.41 + k * 0.026,
        );
      });
      const mcProxy = { v: 0 };
      tl.to(
        mcProxy,
        { v: 1, duration: 0.16, ease: 'none', onUpdate: () => mcRef.current?.draw(mcProxy.v) },
        0.44,
      );
      tl.fromTo(q('.s3-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.58);

      /* S4 — typewriter + citations (scrubbing back un-types it). */
      tl.fromTo(
        q('.s4-word'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.004, stagger: 0.0022, ease: 'none' },
        0.635,
      );
      tl.fromTo(
        q('.s4-src'),
        { autoAlpha: 0, y: 8, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.02, stagger: 0.008 },
        0.755,
      );

      /* S5 — the 12 sections stack; confidence stamps on. */
      tl.fromTo(
        q('.s5-row'),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.02, stagger: 0.006 },
        0.815,
      );
      tl.fromTo(
        q('.s5-badge'),
        { scale: 0, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.02, ease: 'back.out(2)' },
        0.94,
      );
      tl.fromTo(q('.s5-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.96);
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap}>
      <div className="mx-auto flex h-[100svh] max-w-6xl flex-col px-6 pb-8 pt-24">
        <div className="shrink-0">
          <p className="eyebrow">How it works</p>
          <div className="relative mt-3 h-12">
            {SCENES.map((s, i) => (
              <h3
                key={s.head}
                className={`hww-head hww-head-${i} absolute inset-x-0 top-0 text-2xl font-extrabold tracking-tight text-white sm:text-3xl`}
              >
                {s.head}
              </h3>
            ))}
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="hww-scene hww-scene-0 absolute inset-0">
            <SceneProfile mode="pinned" />
          </div>
          <div className="hww-scene hww-scene-1 absolute inset-0">
            <SceneMarket mode="pinned" />
          </div>
          <div className="hww-scene hww-scene-2 absolute inset-0">
            <SceneEngine mode="pinned" mcRef={mcRef} />
          </div>
          <div className="hww-scene hww-scene-3 absolute inset-0">
            <SceneAI mode="pinned" />
          </div>
          <div className="hww-scene hww-scene-4 absolute inset-0">
            <SceneAdvisory mode="pinned" />
          </div>

          {/* Progress rail */}
          <div className="absolute -right-1 top-1/2 hidden -translate-y-1/2 flex-col gap-7 xl:flex" aria-hidden>
            {SCENES.map((s, i) => (
              <div key={s.label} className="flex items-center justify-end gap-2.5">
                <span className={`rail-label-${i} text-[10px] uppercase tracking-wider text-slate-600`}>
                  {s.label}
                </span>
                <span className={`rail-dot-${i} h-2 w-2 rounded-full bg-white/15`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile stacked / reduced-motion static ──────────────────── */

function FlowPipeline({ mode }: { mode: Mode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-20 px-6 py-16">
      <div>
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          From your answers to a real advisory.
        </h2>
      </div>
      {[
        <SceneProfile key="s1" mode={mode} />,
        <SceneMarket key="s2" mode={mode} />,
        <SceneEngine key="s3" mode={mode} />,
        <SceneAI key="s4" mode={mode} />,
        <SceneAdvisory key="s5" mode={mode} />,
      ].map((scene, i) => (
        <div key={SCENES[i].label}>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="tnum text-xs font-semibold text-slate-600">
              {String(i + 1).padStart(2, '0')}/05
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{SCENES[i].head}</h3>
          </div>
          <div className="relative">{scene}</div>
        </div>
      ))}
    </div>
  );
}
