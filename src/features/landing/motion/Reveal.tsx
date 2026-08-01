import { motion, type MotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Baseline section entrance: fade + rise + blur→sharp, once. */
export function Reveal({
  children,
  className,
  delay = 0,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
} & MotionProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Magnetic wrapper — element leans up to `strength` px toward the cursor. */
export function Magnetic({
  children,
  strength = 6,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  if (reduced || !canHover) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileTap={{ scale: 0.97 }}
      onPointerMove={(e) => {
        const el = e.currentTarget as HTMLElement;
        const r = el.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'translate(0px, 0px)';
        setTimeout(() => (el.style.transition = ''), 380);
      }}
    >
      {children}
    </motion.div>
  );
}
