import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChartPieIcon,
  CpuChipIcon,
  FlagIcon,
  GlobeAsiaAustraliaIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Section } from './Section';
import { FEATURES } from '../data';
import { useReducedMotion } from '../motion/useReducedMotion';

const ICONS = {
  sparkles: SparklesIcon,
  'chart-pie': ChartPieIcon,
  'cpu-chip': CpuChipIcon,
  globe: GlobeAsiaAustraliaIcon,
  flag: FlagIcon,
  shield: ShieldCheckIcon,
} as const;

export function FeatureGrid() {
  const reduced = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const gridRef = useRef<HTMLDivElement>(null);

  // Heroicons don't ship pathLength — set it once so the CSS hover redraw
  // (stroke-dasharray: 1 → dashoffset animation) works on every icon.
  useEffect(() => {
    gridRef.current
      ?.querySelectorAll<SVGPathElement>('.fg-icon path')
      .forEach((p) => p.setAttribute('pathLength', '1'));
  }, []);

  return (
    <Section
      id="features"
      eyebrow="What you get"
      title={
        <>
          A real advisor, <span className="text-gradient">not a chatbot.</span>
        </>
      }
      sub="Profile-aware. Data-grounded. Explainable. Every number traces to a source."
      center
      className="py-24"
    >
      <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon, title, text }, i) => {
          const Icon = ICONS[icon];
          return (
            <motion.article
              key={title}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="spotlight-card glass group p-6 text-left active:bg-white/[0.05]"
              onPointerMove={
                canHover
                  ? (e) => {
                      const el = e.currentTarget as HTMLElement;
                      const r = el.getBoundingClientRect();
                      el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
                      el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
                    }
                  : undefined
              }
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-series-1/25 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Icon className="fg-icon h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </motion.article>
          );
        })}
      </div>
    </Section>
  );
}
