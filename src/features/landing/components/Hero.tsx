import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { SplitWords } from '../motion/SplitWords';
import { Magnetic } from '../motion/Reveal';
import { ButtonLink } from '@/components/Button';
import { GrainOverlay } from './GrainOverlay';
import { HeroStatic } from './HeroStatic';
import { APP_URL, QUESTIONS } from '../data';
import { mulberry32 } from '@/lib/utils';

// Three.js stays in its own lazy chunk — never loaded under reduced motion.
const HeroCanvas = lazy(() => import('../three/HeroCanvas'));

/** Any crash inside the WebGL tree degrades to the static hero, never a blank page. */
class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Hero() {
  const reduced = useReducedMotion();
  const [canvasOk, setCanvasOk] = useState(true);
  const [active, setActive] = useState(true);
  const root = useRef<HTMLElement>(null);
  const webgl = useMemo(() => (typeof window !== 'undefined' ? webglAvailable() : false), []);
  const useCanvas = webgl && canvasOk && !reduced;

  // Pause the frameloop when the hero is offscreen or the tab is hidden.
  useEffect(() => {
    if (!useCanvas || !root.current) return;
    let visible = true;
    let onScreen = true;
    const sync = () => setActive(visible && onScreen);
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        sync();
      },
      { threshold: 0.02 },
    );
    io.observe(root.current);
    const onVis = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [useCanvas]);

  // DOM copy choreography — one timeline, synced to the particle morph
  // (morph runs 1.1s → 2.7s; the gradient words land as the line completes).
  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-badge', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.2)
        .fromTo(
          '.hero-l1 .split-word',
          { yPercent: 110, autoAlpha: 0, filter: 'blur(6px)' },
          { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.064 },
          0.4,
        )
        .fromTo(
          '.hero-l2 .split-word',
          { yPercent: 110, autoAlpha: 0, filter: 'blur(6px)' },
          { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.08 },
          1.5,
        )
        .fromTo('.hero-sub', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.0)
        .fromTo('.hero-ctas', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.3)
        .fromTo(
          '.hero-chip',
          { autoAlpha: 0, y: 14, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07 },
          1.6,
        )
        .fromTo('.hero-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 2.6);

      // Content drifts up slightly as you leave the hero.
      gsap.to('.hero-content', {
        y: -60,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 30%', scrub: true },
      });
      // Scroll cue disappears on first scroll.
      gsap.to('.hero-cue', {
        autoAlpha: 0,
        scrollTrigger: { trigger: root.current, start: '2% top', toggleActions: 'play none none reverse' },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const chipStyles = useMemo(() => {
    const rnd = mulberry32(7);
    return QUESTIONS.map(() => ({
      '--float-dur': `${4 + rnd() * 2.4}s`,
      '--float-delay': `${-rnd() * 4}s`,
    })) as React.CSSProperties[];
  }, []);

  return (
    <section ref={root} id="hero" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {useCanvas ? (
        <CanvasBoundary fallback={<HeroStatic />}>
          <Suspense fallback={<HeroStatic />}>
            <HeroCanvas active={active} onContextLost={() => setCanvasOk(false)} />
          </Suspense>
        </CanvasBoundary>
      ) : (
        <HeroStatic />
      )}
      <GrainOverlay />

      <div className="hero-content relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
        <span className="hero-badge glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-slate-300 opacity-0">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Live NSE data · Grounded AI · Zero generic advice
        </span>

        <h1 className="mt-7 max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold leading-[1.04] tracking-tight text-white">
          <span className="hero-l1 block">
            <SplitWords lines={[[{ t: 'Markets are noise.' }]]} />
          </span>
          <span className="hero-l2 block">
            <SplitWords lines={[[{ t: 'Seeker finds' }, { t: 'the signal.', c: 'text-gradient' }]]} />
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Your personal AI investment advisor for Indian markets — built on your goals, your risk,
          your taxes, and live NSE data.
        </p>

        <div className="hero-ctas mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <ButtonLink href={APP_URL} size="lg">
              Get started free
              <span aria-hidden>→</span>
            </ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="#how-it-works" size="lg" variant="secondary">
              See how it thinks
              <span aria-hidden>↓</span>
            </ButtonLink>
          </Magnetic>
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
          {QUESTIONS.map((q, i) => (
            <span key={q} style={chipStyles[i]} className="chip-float inline-block">
              <span className="hero-chip glass inline-block cursor-default rounded-full px-4 py-2 text-xs text-slate-300 transition-colors hover:border-accent/40 hover:text-white">
                “{q}”
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero-cue pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 opacity-0" aria-hidden>
        <div className="relative h-11 w-px overflow-hidden bg-white/10">
          <span className="cue-dot absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
