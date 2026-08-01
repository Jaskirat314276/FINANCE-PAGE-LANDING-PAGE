import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { SplitWords } from '../motion/SplitWords';
import { formatIN } from '@/lib/utils';

/*
 * Signature Animation #3b — the manifesto.
 * Scroll-scrubbed word reveal (opacity only), then the receipts:
 * 9 · 12 · 1,000 · 0 — with "0 invented numbers" landing last.
 */

const STATS = [
  { value: 9, label: 'profile steps' },
  { value: 12, label: 'advisory sections' },
  { value: 1000, label: 'simulated futures' },
  { value: 0, label: 'invented numbers', kicker: true },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      if (reduced) {
        gsap.set(q('.mf-word'), { opacity: 1 });
        gsap.set(q('.mf-grad'), { opacity: 1 });
        q<HTMLElement>('.mf-stat-num').forEach((el) => {
          el.textContent = formatIN(Number(el.dataset.value));
        });
        gsap.set(q('.mf-stat'), { autoAlpha: 1, y: 0 });
        return;
      }

      // Aurora drift.
      gsap.to(q('.mf-aurora'), {
        x: 60,
        y: -40,
        scale: 1.15,
        duration: 18,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Word-by-word brighten, tied to scroll.
      gsap.to(q('.mf-word'), {
        opacity: 1,
        stagger: 0.02,
        duration: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: q('.mf-text')[0],
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.6,
        },
      });

      // "shows its work." flips to the brand gradient only at full reveal.
      gsap.to(q('.mf-grad'), {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: q('.mf-text')[0],
          start: 'bottom 52%',
          end: 'bottom 42%',
          scrub: 0.6,
        },
      });

      // Counters — once, when the receipts row arrives.
      ScrollTrigger.create({
        trigger: q('.mf-stats')[0],
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            q('.mf-stat'),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
          );
          q<HTMLElement>('.mf-stat-num').forEach((el) => {
            const target = Number(el.dataset.value);
            if (el.dataset.kicker) {
              // "0" stamps in late — it does not count.
              gsap.fromTo(
                el,
                { scale: 0, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, delay: 1.15, duration: 0.45, ease: 'back.out(2.2)' },
              );
              el.textContent = '0';
              return;
            }
            const proxy = { v: 0 };
            gsap.to(proxy, {
              v: target,
              duration: 1.1,
              ease: 'expo.out',
              onUpdate: () => (el.textContent = formatIN(proxy.v)),
            });
          });
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative overflow-hidden py-32 sm:py-40">
      <div
        aria-hidden
        className="mf-aurora pointer-events-none absolute left-1/4 top-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/[0.13] blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="eyebrow">Why we built it</p>
        <h2 className="mf-text mt-8 max-w-4xl text-[clamp(2rem,5.5vw,4.25rem)] font-extrabold leading-[1.12] tracking-tight text-white">
          <SplitWords
            wordClassName="mf-word opacity-[0.13]"
            lines={[
              [{ t: 'Most investors get generic tips.' }],
              [{ t: 'We built the advisor we wanted —' }],
              [{ t: 'one that knows your goals, your risk, your taxes,' }],
            ]}
          />
          {/* last line by hand: the gradient flips ON only at full reveal */}
          <span className="split-line">
            <span className="split-word mf-word opacity-[0.13]">and</span>{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span aria-hidden className="mf-grad text-gradient absolute inset-0 opacity-0">
                shows its work.
              </span>
              <span className="split-word mf-word opacity-[0.13]">shows</span>{' '}
              <span className="split-word mf-word opacity-[0.13]">its</span>{' '}
              <span className="split-word mf-word opacity-[0.13]">work.</span>
            </span>
          </span>
        </h2>

        <div className="mf-stats mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="mf-stat glass-inset p-6 text-center">
              <p
                className={`mf-stat-num tnum text-4xl font-extrabold sm:text-5xl ${
                  s.kicker ? 'inline-block text-accent drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]' : 'text-white'
                }`}
                data-value={s.value}
                data-kicker={s.kicker ? '1' : undefined}
              >
                0
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-500">
          An educational tool that treats you like an adult — see the SEBI note below.
        </p>
      </div>
    </section>
  );
}
