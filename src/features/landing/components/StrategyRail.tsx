import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { STRATEGIES } from '../data';
import { useReducedMotion } from '../motion/useReducedMotion';
import { cn } from '@/lib/utils';

const RISK_STYLES: Record<string, string> = {
  LOW: 'text-status-good bg-status-good/10',
  MODERATE: 'text-status-warning bg-status-warning/10',
  HIGH: 'text-status-serious bg-status-serious/10',
};

function FitRing({ fit }: { fit: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#34d399"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          initial={{ strokeDashoffset: reduced ? 100 - fit : 100 }}
          whileInView={{ strokeDashoffset: 100 - fit }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <span className="tnum absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        {fit}
      </span>
    </div>
  );
}

export function StrategyRail() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragW, setDragW] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current && viewportRef.current)
        setDragW(Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <Section
      id="strategies"
      eyebrow="Strategies"
      title={
        <>
          Eleven blueprints. <span className="text-gradient">Ranked for you.</span>
        </>
      }
      sub="Every blueprint is scored against YOUR profile — not the average investor's. Drag to explore."
      className="py-24"
    >
      <div ref={viewportRef} className="edge-mask -mx-6 overflow-hidden px-6">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -dragW, right: 0 }}
          dragElastic={0.08}
          className="flex w-max cursor-grab gap-4 pb-2 active:cursor-grabbing"
        >
          {STRATEGIES.map((s) => (
            <div key={s.name} className="glass glass-hover w-[270px] shrink-0 select-none p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold leading-snug text-white">{s.name}</h3>
                  <span
                    className={cn(
                      'mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                      RISK_STYLES[s.risk],
                    )}
                  >
                    {s.risk}
                  </span>
                </div>
                <FitRing fit={s.fit} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">{s.blurb}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-slate-600">fit score · personalized</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
