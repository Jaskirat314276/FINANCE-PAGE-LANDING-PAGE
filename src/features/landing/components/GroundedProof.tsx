import { useCallback, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { Section } from './Section';

/*
 * Signature Animation #3a — "Every number traces to a source."
 * Tracer beams draw from each claimed number to the engine that produced it;
 * a ✓ stamps each number as the system checks itself.
 */

// traced-span index → source card index (last one is the stock names → Live NSE)
const NUM_TO_CARD = [0, 1, 1, 1, 2];

const CARDS = [
  { title: 'Allocation matrix', sub: 'Quant engine — risk-band tilts, sector caps' },
  { title: '1,000-path Monte Carlo', sub: 'Seeded simulation — CAGR, volatility, P(loss)' },
  { title: 'Live NSE data', sub: 'nse → yahoo provider chain, cached, keyless' },
];

export function GroundedProof() {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const computeBeams = useCallback(() => {
    const rootEl = root.current;
    const svg = svgRef.current;
    if (!rootEl || !svg) return;
    const rb = rootEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rb.width} ${rb.height}`);
    const cards = rootEl.querySelectorAll<HTMLElement>('.gp-card');
    NUM_TO_CARD.forEach((cardIdx, i) => {
      const num = rootEl.querySelector<HTMLElement>(`.gp-num-${i}`);
      const path = svg.querySelector<SVGPathElement>(`.gp-beam-${i}`);
      const card = cards[cardIdx];
      if (!num || !path || !card) return;
      const nr = num.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const sx = nr.left + nr.width / 2 - rb.left;
      const sy = nr.bottom - rb.top + 2;
      const ex = cr.left + cr.width / 2 - rb.left + (i - 1.5) * 14;
      const ey = cr.top - rb.top - 2;
      const dy = Math.max(40, (ey - sy) * 0.45);
      path.setAttribute('d', `M ${sx} ${sy} C ${sx} ${sy + dy}, ${ex} ${ey - dy}, ${ex} ${ey}`);
    });
  }, []);

  useEffect(() => {
    computeBeams();
    const ro = new ResizeObserver(computeBeams);
    if (root.current) ro.observe(root.current);
    window.addEventListener('resize', computeBeams);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeBeams);
    };
  }, [computeBeams]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      computeBeams();

      if (reduced) {
        // Static: beams connected, ticks visible.
        q<SVGPathElement>('.gp-beam').forEach((p) => {
          p.style.strokeDasharray = 'none';
          p.style.opacity = '0.5';
        });
        gsap.set(q('.gp-tick'), { scale: 1, autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.fromTo(q('.gp-excerpt'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6 });
      tl.fromTo(
        q('.gp-card'),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
        0.25,
      );

      q<SVGPathElement>('.gp-beam').forEach((p, i) => {
        const at = 0.9 + i * 0.35;
        // Prepare dash (lengths settle after d attributes are set).
        tl.call(
          () => {
            const L = p.getTotalLength();
            p.style.strokeDasharray = String(L);
            if (!p.dataset.done) p.style.strokeDashoffset = String(L);
          },
          undefined,
          at - 0.05,
        );
        tl.to(q(`.gp-num-${i}`), { backgroundColor: 'rgba(52,211,153,0.16)', color: '#6ee7b7', duration: 0.25 }, at);
        tl.to(p, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut', onComplete: () => (p.dataset.done = '1') }, at + 0.05);
        const card = q('.gp-card')[NUM_TO_CARD[i]];
        tl.to(card, { y: -6, borderColor: 'rgba(52,211,153,0.45)', duration: 0.3 }, at + 0.45);
        tl.to(card, { y: 0, duration: 0.4 }, at + 0.85);
        tl.fromTo(
          q(`.gp-tick-${i}`),
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.5)' },
          at + 0.5,
        );
      });
      tl.fromTo(q('.gp-footer'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, '+=0.2');

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 60%',
        onEnter: () => tl.play(0),
        onLeaveBack: () => {
          tl.pause(0);
          q<SVGPathElement>('.gp-beam').forEach((p) => delete p.dataset.done);
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const numCls =
    'gp-num tnum rounded px-1 font-semibold text-white underline decoration-accent/50 decoration-2 underline-offset-4';

  return (
    <Section
      id="why-trust-it"
      eyebrow="Why trust it"
      title={
        <>
          Every number traces <span className="text-gradient">to a source.</span>
        </>
      }
      sub="The AI writes the explanation. The quant engine does the arithmetic."
      className="py-28"
    >
      <div ref={root} className="relative">
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="gp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#3987e5" />
            </linearGradient>
          </defs>
          {NUM_TO_CARD.map((_, i) => (
            <path key={i} className={`gp-beam gp-beam-${i}`} fill="none" stroke="url(#gp-grad)" strokeWidth="2" />
          ))}
        </svg>

        <div className="gp-excerpt glass relative mx-auto max-w-3xl p-7 sm:p-9">
          <p className="eyebrow">From a live advisory</p>
          <p className="mt-4 text-base leading-[1.9] text-slate-300 sm:text-lg">
            Deploy{' '}
            <span className="relative inline-block">
              <span className={`${numCls} gp-num-0`}>48%</span>
              <Tick i={0} />
            </span>{' '}
            into direct equity across{' '}
            <span className="relative inline-block">
              <span className={`${numCls} gp-num-4`}>TCS, ICICI Bank and HAL</span>
              <Tick i={4} />
            </span>
            , 17% into index ETFs… expected CAGR ≈{' '}
            <span className="relative inline-block">
              <span className={`${numCls} gp-num-1`}>13.1%</span>
              <Tick i={1} />
            </span>{' '}
            with volatility ≈{' '}
            <span className="relative inline-block">
              <span className={`${numCls} gp-num-2`}>15.8%</span>
              <Tick i={2} />
            </span>
            . Probability of loss over your horizon:{' '}
            <span className="relative inline-block">
              <span className={`${numCls} gp-num-3`}>8.2%</span>
              <Tick i={3} />
            </span>
            .
          </p>
        </div>

        <div className="mt-32 grid gap-5 sm:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.title} className="gp-card glass p-5 text-center">
              <p className="font-semibold text-white">{c.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{c.sub}</p>
            </div>
          ))}
        </div>

        <p className="gp-footer mt-10 text-center text-sm text-slate-500">
          If the data is missing, Seeker says so — every advisory carries an honest{' '}
          <span className="text-slate-300">data note</span>.
        </p>
      </div>
    </Section>
  );
}

function Tick({ i }: { i: number }) {
  return (
    <span
      className={`gp-tick gp-tick-${i} absolute -right-2.5 -top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-ink-950 opacity-0`}
      aria-hidden
    >
      ✓
    </span>
  );
}
