import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Donut, DONUT_SEGS, MonteCarloCanvas, RiskRing, type MCHandle } from './bits';
import { ADVISORY_SECTIONS, ONBOARDING_STEPS, SAMPLE } from '../data';

export type SceneMode = 'pinned' | 'flow' | 'static';

/** flow → framer whileInView; pinned/static → plain div (GSAP or final state). */
function FlowIn({
  mode,
  children,
  className,
  delay = 0,
}: {
  mode: SceneMode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  if (mode !== 'flow') return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Scene 1 · "It starts with you" ──────────────────────────── */

export function SceneProfile({ mode }: { mode: SceneMode }) {
  const pinned = mode === 'pinned';
  return (
    <div className={cn('flex h-full w-full items-center justify-center', !pinned && 'flex-col gap-8')}>
      <div className={cn('s1-grid grid grid-cols-3 gap-2.5', pinned && 'absolute')}>
        {ONBOARDING_STEPS.map((s, i) => (
          <FlowIn mode={mode} delay={i * 0.05} key={s}>
            <span className="s1-chip glass block whitespace-nowrap px-3.5 py-2 text-center text-xs text-slate-300">
              {s}
            </span>
          </FlowIn>
        ))}
      </div>
      <FlowIn mode={mode} delay={0.5} className={cn(pinned && 'absolute')}>
        <div className="s1-card glass w-72 p-6 text-center">
          <p className="eyebrow">Your profile</p>
          <div className="mt-4 flex justify-center">
            <RiskRing
              value={SAMPLE.riskScore}
              selfAnimate={mode === 'flow'}
              full={mode === 'static'}
              numClass="s1-ring-num"
              fgClass="s1-ring-fg"
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Risk score — <span className="text-slate-200">computed, never asked.</span>
          </p>
        </div>
      </FlowIn>
    </div>
  );
}

/* ── Scene 2 · "Then the market — live" ──────────────────────── */

const PILL_GROUPS: { name: string; pills: string[] }[] = [
  { name: 'Indices', pills: ['NIFTY 50 · 24,812 ▲0.4%', 'SENSEX · 81,455 ▲0.3%', 'BANK NIFTY · 51,220 ▼0.2%'] },
  { name: 'Fundamentals', pills: ['P/E 29.4', 'ROE 46%', 'D/E 0.1'] },
  { name: 'Technicals', pills: ['RSI 58', 'MACD ↑', '200-DMA ✓'] },
];

export function SceneMarket({ mode }: { mode: SceneMode }) {
  const pinned = mode === 'pinned';
  const streamRoot = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Data-stream beziers: from each pill group toward the profile card.
  // Runtime-computed (like GroundedProof's beams) so they survive resizes.
  // Layout effect: the paths need a `d` BEFORE the parent's pinned timeline
  // builds its motionPath tweens (child layout effects run first).
  useLayoutEffect(() => {
    if (!pinned) return;
    const rootEl = streamRoot.current;
    const svg = svgRef.current;
    if (!rootEl || !svg) return;

    const compute = () => {
      const rb = rootEl.getBoundingClientRect();
      if (!rb.width || !rb.height) return;
      svg.setAttribute('viewBox', `0 0 ${rb.width} ${rb.height}`);
      const card = rootEl.querySelector<HTMLElement>('.s2-profile');
      const groups = rootEl.querySelectorAll<HTMLElement>('.s2-group');
      if (!card) return;
      const cr = card.getBoundingClientRect();
      const ex = cr.right - rb.left + 6;
      const ey = cr.top + cr.height / 2 - rb.top;
      groups.forEach((g, i) => {
        const path = svg.querySelector<SVGPathElement>(`.s2-path-${i}`);
        if (!path) return;
        const gr = g.getBoundingClientRect();
        const sx = gr.left - rb.left - 8;
        const sy = gr.top + gr.height / 2 - rb.top;
        const dx = Math.max(50, (sx - ex) * 0.45);
        path.setAttribute('d', `M ${sx} ${sy} C ${sx - dx} ${sy}, ${ex + dx} ${ey}, ${ex} ${ey}`);
        const L = path.getTotalLength();
        path.style.strokeDasharray = String(L);
        if (!path.dataset.drawn) path.style.strokeDashoffset = String(L);
      });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(rootEl);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [pinned]);

  return (
    <div ref={streamRoot} className="relative flex h-full w-full items-center justify-center">
      {pinned && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="s2-stream-grad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#3987e5" stopOpacity="0.7" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className={`s2-path s2-path-${i}`}
              fill="none"
              stroke="url(#s2-stream-grad)"
              strokeWidth="1.5"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} className={`s2-packet s2-packet-${i}`} r="4" fill="#6ee7b7" opacity="0" />
          ))}
        </svg>
      )}
      <div
        className={cn(
          'relative z-10 flex w-full items-center gap-10',
          pinned ? 'mx-auto max-w-3xl justify-between px-2' : 'flex-col',
        )}
      >
        <FlowIn mode={mode}>
          <div className="s2-profile glass w-52 shrink-0 p-5 text-center">
            <p className="eyebrow">Your profile</p>
            <p className="tnum mt-2 text-3xl font-extrabold text-white">{SAMPLE.riskScore}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">risk score</p>
          </div>
        </FlowIn>
        <div className="flex min-w-0 flex-col gap-3">
          {PILL_GROUPS.map((g, gi) => (
            <FlowIn mode={mode} delay={gi * 0.14} key={g.name}>
              <div className="s2-group flex flex-wrap items-center gap-2">
                <span className={cn('text-[10px] uppercase tracking-wider text-slate-600', pinned && 'w-24 text-right')}>
                  {g.name}
                </span>
                {g.pills.map((p) => (
                  <span key={p} className="s2-pill glass-inset tnum whitespace-nowrap px-3 py-1.5 text-xs text-slate-300">
                    {p}
                  </span>
                ))}
              </div>
            </FlowIn>
          ))}
          <FlowIn mode={mode} delay={0.42}>
            <p className="s2-cap mt-1 text-xs text-slate-500">
              NSE prices, fundamentals and technicals — <span className="text-slate-300">keyless, with automatic fallbacks.</span>
            </p>
          </FlowIn>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 3 · "A quant engine does the math" ────────────────── */

export function SceneEngine({ mode, mcRef }: { mode: SceneMode; mcRef?: RefObject<MCHandle> }) {
  const pinned = mode === 'pinned';
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <FlowIn mode={mode}>
        <div className="s3-engine relative flex items-center justify-center">
          {pinned && (
            <span className="s3-in-a glass absolute right-full mr-10 whitespace-nowrap rounded-full px-4 py-2 text-xs text-slate-300">
              Your profile
            </span>
          )}
          <div className="s3-hex flex items-center gap-3">
            <svg viewBox="0 0 56 56" className="h-12 w-12 shrink-0" aria-hidden>
              <polygon
                points="28,3 50,15.5 50,40.5 28,53 6,40.5 6,15.5"
                fill="rgba(52,211,153,0.08)"
                stroke="#34d399"
                strokeWidth="1.5"
              />
              <circle cx="28" cy="28" r="6" fill="none" stroke="#34d399" strokeWidth="1.5" />
              <path d="M28 16v6M28 34v6M16 28h6M34 28h6" stroke="#34d399" strokeWidth="1.5" />
            </svg>
            <span className="eyebrow !text-accent-soft">Quant engine</span>
          </div>
          {pinned && (
            <span className="s3-in-b glass absolute left-full ml-10 whitespace-nowrap rounded-full px-4 py-2 text-xs text-slate-300">
              Live market
            </span>
          )}
        </div>
      </FlowIn>
      <div className="grid w-full max-w-2xl grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <FlowIn mode={mode} delay={0.15} className="flex items-center justify-center gap-5">
          <Donut selfAnimate={mode === 'flow'} full={mode === 'static'} segClassPrefix="s3-seg" size={150} />
          <ul className="space-y-1.5">
            {DONUT_SEGS.map((s, i) => (
              <li key={s.label} className={`s3-leg-${i} flex items-center gap-2 text-xs text-slate-400`}>
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="tnum font-semibold text-slate-200">{s.pct}%</span> {s.label}
              </li>
            ))}
          </ul>
        </FlowIn>
        <FlowIn mode={mode} delay={0.3} className="glass-inset p-4">
          <MonteCarloCanvas
            ref={mcRef}
            selfAnimate={mode === 'flow'}
            full={mode === 'static'}
            countClass="s3-mc-count"
          />
        </FlowIn>
      </div>
      <FlowIn mode={mode} delay={0.45}>
        <p className="s3-cap tnum text-center text-xs text-slate-500">
          Deterministic. Repeatable. Expected CAGR ≈ <span className="text-slate-200">{SAMPLE.cagr}</span> ·
          volatility ≈ <span className="text-slate-200">{SAMPLE.vol}</span>
        </p>
      </FlowIn>
    </div>
  );
}

/* ── Scene 4 · "The AI explains. It never invents." ──────────── */

type Token = { t: string; num?: boolean };
const AI_TEXT: Token[] = [
  { t: 'For your' },
  { t: '₹5,00,000', num: true },
  { t: 'with an aggressive risk band and a 5–10 year horizon, deploy across 7 asset classes —' },
  { t: 'expected CAGR ≈' },
  { t: '13.1%', num: true },
  { t: ', volatility ≈' },
  { t: '15.8%', num: true },
  { t: ', probability of loss' },
  { t: '8.2%', num: true },
  { t: '.' },
];
const SOURCES = ['Quant engine', 'Monte Carlo', 'Live NSE'];

export function SceneAI({ mode }: { mode: SceneMode }) {
  const words: { text: string; num?: boolean }[] = [];
  AI_TEXT.forEach((tok) =>
    tok.num
      ? words.push({ text: tok.t, num: true })
      : tok.t.split(' ').forEach((w) => words.push({ text: w })),
  );
  return (
    <div className="flex h-full w-full items-center justify-center">
      <FlowIn mode={mode} className="w-full max-w-2xl">
        <div className="glass p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="eyebrow">Seeker advisory — draft</span>
            <span className="glass-inset px-2.5 py-1 text-[10px] text-accent-soft">grounded</span>
          </div>
          <p className="mt-4 text-sm leading-[2] text-slate-300 sm:text-base">
            {words.map((w, i) =>
              mode === 'flow' ? (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.05, delay: 0.3 + i * 0.035 }}
                  className={cn('s4-word', w.num && 's4-num rounded bg-accent/15 px-1.5 py-0.5 font-semibold text-accent-soft tnum')}
                >
                  {w.text}{' '}
                </motion.span>
              ) : (
                <span
                  key={i}
                  className={cn('s4-word', w.num && 's4-num rounded bg-accent/15 px-1.5 py-0.5 font-semibold text-accent-soft tnum')}
                >
                  {w.text}{' '}
                </span>
              ),
            )}
            {mode === 'pinned' && (
              <span
                className="s4-caret caret-blink ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-accent"
                aria-hidden
              />
            )}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-600">cites</span>
            {SOURCES.map((s, i) => (
              <span key={s} className={`s4-src s4-src-${i} glass-inset px-3 py-1.5 text-xs text-slate-300`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </FlowIn>
    </div>
  );
}

/* ── Scene 5 · "Twelve sections. Zero hand-waving." ──────────── */

export function SceneAdvisory({ mode }: { mode: SceneMode }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <FlowIn mode={mode} className="w-full max-w-xl">
        <div className="glass relative p-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="eyebrow">Seeker advisory</span>
            <span className="s5-badge rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-soft tnum">
              Confidence {SAMPLE.confidence}/100
            </span>
          </div>
          <ol className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {ADVISORY_SECTIONS.map((s, i) => (
              <li key={s} className="s5-row flex items-baseline gap-2.5 text-sm text-slate-300">
                <span className="tnum text-[10px] font-semibold text-slate-600">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="s5-cap mt-5 border-t border-white/[0.06] pt-4 text-center text-sm font-semibold text-white">
            A real advisor, <span className="text-gradient">not a chatbot.</span>
          </p>
        </div>
      </FlowIn>
    </div>
  );
}
