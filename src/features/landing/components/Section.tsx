import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '../motion/Reveal';

export function Section({
  id,
  eyebrow,
  title,
  sub,
  children,
  className,
  center,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  sub?: string;
  children?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <section id={id} className={cn('relative mx-auto max-w-6xl scroll-mt-24 px-6', className)}>
      {(eyebrow || title || sub) && (
        <Reveal className={cn('mb-12', center && 'text-center')}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
          )}
          {sub && <p className={cn('mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base', center && 'mx-auto')}>{sub}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}
