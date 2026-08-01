import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { TICKER_ITEMS } from '../data';
import { cn } from '@/lib/utils';

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3">
      {TICKER_ITEMS.map((it) => (
        <span
          key={it.label}
          className="glass flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs"
        >
          <span className="font-semibold text-slate-200">{it.label}</span>
          <span className="tnum text-slate-400">{it.value}</span>
          <span
            className={cn('tnum font-semibold', it.delta >= 0 ? 'text-status-good' : 'text-status-critical')}
          >
            {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta).toFixed(2)}%
          </span>
        </span>
      ))}
      <span className="whitespace-nowrap rounded-full border border-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-wider text-slate-600">
        illustrative
      </span>
    </div>
  );
}

export function TickerStrip() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tween = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: 55, repeat: -1 });
      const el = track.current!.parentElement!;
      const pause = () => tween.pause();
      const play = () => tween.play();
      el.addEventListener('pointerenter', pause);
      el.addEventListener('pointerleave', play);
      return () => {
        el.removeEventListener('pointerenter', pause);
        el.removeEventListener('pointerleave', play);
      };
    },
    { scope: track, dependencies: [reduced] },
  );

  return (
    <section aria-label="Market snapshot (illustrative)" className="relative py-6">
      <div className="edge-mask overflow-hidden">
        <div ref={track} className="flex w-max">
          <Row />
          {!reduced && <Row />}
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-600">
        Live NSE/Yahoo provider chain with automatic fallbacks — works keyless.
      </p>
    </section>
  );
}
