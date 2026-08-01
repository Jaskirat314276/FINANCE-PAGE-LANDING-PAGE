import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useInView } from 'framer-motion';
import { animateValue, formatIN, mulberry32 } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ── Risk-score ring ─────────────────────────────────────────── */

export function RiskRing({
  value,
  size = 108,
  selfAnimate,
  full,
  numClass,
  fgClass,
}: {
  value: number;
  size?: number;
  /** animate itself when scrolled into view (stacked mode) */
  selfAnimate?: boolean;
  /** render final state immediately (static mode) */
  full?: boolean;
  numClass?: string;
  fgClass?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const fgRef = useRef<SVGCircleElement>(null);
  const inView = useInView(numRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!selfAnimate || !inView) return;
    return animateValue(0, value, 1200, (v) => {
      if (numRef.current) numRef.current.textContent = String(Math.round(v));
      if (fgRef.current) fgRef.current.style.strokeDashoffset = String(100 - v);
    });
  }, [selfAnimate, inView, value]);

  const startOffset = full ? 100 - value : 100;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="7" />
        <circle
          ref={fgRef}
          className={fgClass}
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={startOffset}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#3987e5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={numRef} className={cn('tnum text-2xl font-extrabold text-white', numClass)}>
          {full ? value : 0}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

/* ── Allocation donut ────────────────────────────────────────── */

export const DONUT_SEGS = [
  { label: 'Direct equity', pct: 48, color: '#3987e5' },
  { label: 'Index ETFs', pct: 17, color: '#199e70' },
  { label: 'Debt', pct: 10, color: '#c98500' },
  { label: 'Gold', pct: 7, color: '#fab219' },
  { label: 'Cash & other', pct: 18, color: '#9085e9' },
];

export function Donut({
  size = 170,
  selfAnimate,
  full,
  segClassPrefix,
}: {
  size?: number;
  selfAnimate?: boolean;
  full?: boolean;
  segClassPrefix?: string; // e.g. 's3-seg' → circles get s3-seg-0..4
}) {
  const rootRef = useRef<SVGSVGElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!selfAnimate || !inView || !rootRef.current) return;
    const circles = rootRef.current.querySelectorAll<SVGCircleElement>('[data-pct]');
    const cancels: (() => void)[] = [];
    circles.forEach((c, i) => {
      const pct = Number(c.dataset.pct);
      const t = window.setTimeout(() => {
        cancels.push(
          animateValue(0, pct, 700, (v) => c.setAttribute('stroke-dasharray', `${v} ${100 - v}`)),
        );
      }, i * 260);
      cancels.push(() => window.clearTimeout(t));
    });
    return () => cancels.forEach((c) => c());
  }, [selfAnimate, inView]);

  let cum = 0;
  return (
    <svg ref={rootRef} width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148,163,184,0.10)" strokeWidth="13" />
      {DONUT_SEGS.map((s, i) => {
        const offset = 25 - cum;
        cum += s.pct;
        return (
          <circle
            key={s.label}
            className={segClassPrefix ? `${segClassPrefix}-${i}` : undefined}
            data-pct={s.pct}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={s.color}
            strokeWidth="13"
            pathLength={100}
            strokeDasharray={full ? `${s.pct} ${100 - s.pct}` : `0 100`}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}

/* ── Monte Carlo fan ─────────────────────────────────────────── */

export interface MCHandle {
  draw: (progress: number) => void;
}

const N_PATHS = 120;
const N_STEPS = 64;

function buildPaths() {
  const rnd = mulberry32(42);
  const paths: number[][] = [];
  for (let p = 0; p < N_PATHS; p++) {
    const vals = [1];
    let v = 1;
    for (let s = 1; s < N_STEPS; s++) {
      const g = (rnd() + rnd() + rnd() + rnd() - 2) / 2;
      v *= 1 + 0.0024 + 0.03 * g;
      vals.push(v);
    }
    paths.push(vals);
  }
  // Percentile bands per step.
  const p10: number[] = [];
  const p90: number[] = [];
  const p50: number[] = [];
  for (let s = 0; s < N_STEPS; s++) {
    const col = paths.map((p) => p[s]).sort((a, b) => a - b);
    p10.push(col[Math.floor(N_PATHS * 0.1)]);
    p50.push(col[Math.floor(N_PATHS * 0.5)]);
    p90.push(col[Math.floor(N_PATHS * 0.9)]);
  }
  let min = Infinity;
  let max = -Infinity;
  for (const p of paths)
    for (const v of p) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  return { paths, p10, p50, p90, min, max };
}

export const MonteCarloCanvas = forwardRef<
  MCHandle,
  { className?: string; selfAnimate?: boolean; full?: boolean; countClass?: string }
>(function MonteCarloCanvas({ className, selfAnimate, full, countClass }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const data = useMemo(buildPaths, []);
  const last = useRef(0);
  const inView = useInView(canvasRef, { once: true, amount: 0.5 });

  const draw = (progress: number) => {
    last.current = progress;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { paths, p10, p50, p90, min, max } = data;
    const pad = 8;
    const X = (s: number) => pad + (s / (N_STEPS - 1)) * (w - pad * 2);
    const Y = (v: number) => pad + (1 - (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))) * (h - pad * 2);
    const upto = Math.max(2, Math.floor(progress * N_STEPS));

    // p10–p90 band
    ctx.beginPath();
    for (let s = 0; s < upto; s++) (s === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, X(s), Y(p90[s]));
    for (let s = upto - 1; s >= 0; s--) ctx.lineTo(X(s), Y(p10[s]));
    ctx.closePath();
    ctx.fillStyle = 'rgba(52, 211, 153, 0.09)';
    ctx.fill();

    // simulated paths
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(57, 135, 229, 0.15)';
    for (const p of paths) {
      ctx.beginPath();
      for (let s = 0; s < upto; s++) (s === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, X(s), Y(p[s]));
      ctx.stroke();
    }

    // median — bright, appears near the end
    if (progress > 0.85) {
      ctx.globalAlpha = Math.min(1, (progress - 0.85) / 0.15);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6ee7b7';
      ctx.beginPath();
      for (let s = 0; s < upto; s++) (s === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, X(s), Y(p50[s]));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (countRef.current) countRef.current.textContent = formatIN(progress * 1000);
  };

  useImperativeHandle(ref, () => ({ draw }));

  useEffect(() => {
    const ro = new ResizeObserver(() => draw(last.current));
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (full) draw(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  useEffect(() => {
    if (!selfAnimate || !inView) return;
    return animateValue(0, 1, 1500, draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfAnimate, inView]);

  return (
    <div className={cn('relative', className)}>
      <p className="mb-1 flex items-baseline gap-1.5">
        <span ref={countRef} className={cn('tnum text-xl font-extrabold text-white', countClass)}>
          {full ? '1,000' : '0'}
        </span>
        <span className="text-[11px] text-slate-500">simulated futures</span>
      </p>
      <canvas ref={canvasRef} className="h-40 w-full" aria-hidden />
      <p className="sr-only">
        A fan chart of 1,000 Monte Carlo portfolio simulations spreading from one starting value, with
        the 10th–90th percentile band shaded and the median path highlighted.
      </p>
    </div>
  );
});
