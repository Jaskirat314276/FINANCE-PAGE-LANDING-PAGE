import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { Magnetic } from '../motion/Reveal';
import { SplitWords } from '../motion/SplitWords';
import { ButtonLink } from '@/components/Button';
import { GrainOverlay } from './GrainOverlay';
import { ONBOARDING_STEPS } from '../data';

export function FinalCTA() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap.to(q('.cta-aurora'), {
        scale: 1.12,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.fromTo(
        q('.cta-head .split-word'),
        { yPercent: 110, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative flex min-h-[88svh] items-center overflow-hidden">
      <div
        aria-hidden
        className="cta-aurora pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/[0.14] to-series-1/[0.14] blur-3xl"
      />
      <GrainOverlay />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-28 text-center">
        <h2 className="cta-head text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[1.1] tracking-tight text-white">
          <SplitWords
            lines={[
              [{ t: 'Three minutes. Nine steps.' }],
              [{ t: 'An advisor that’s' }, { t: 'actually yours.', c: 'text-gradient' }],
            ]}
          />
        </h2>

        {/* 9-step mini stepper — a quiet echo of Scene 1 */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-1 gap-y-3">
          {ONBOARDING_STEPS.map((s, i) => (
            <motion.span
              key={s}
              initial={reduced ? false : { opacity: 0.25 }}
              whileInView={reduced ? undefined : { opacity: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
              className="flex items-center gap-1"
            >
              <span className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
                {s}
              </span>
              {i < ONBOARDING_STEPS.length - 1 && <span className="h-px w-3 bg-white/10" aria-hidden />}
            </motion.span>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <ButtonLink href="/auth" size="lg">
              Create my profile <span aria-hidden>→</span>
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="/auth" size="lg" variant="ghost">
            Explore the demo — no keys needed
          </ButtonLink>
        </div>

        <p className="mt-10 text-xs text-slate-600">
          Zero-key demo mode · Your data stays yours · Open source (MIT)
        </p>
      </div>
    </section>
  );
}
