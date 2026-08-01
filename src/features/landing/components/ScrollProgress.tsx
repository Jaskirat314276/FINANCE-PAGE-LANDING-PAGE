import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';

/** 2px gradient hairline tracking page scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    gsap.to(ref.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
  }, [reduced]);

  if (reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-accent to-series-1"
    />
  );
}
