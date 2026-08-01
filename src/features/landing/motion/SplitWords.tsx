import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export interface SplitSegment {
  t: string;
  c?: string; // extra classes for these words (e.g. text-gradient)
}

/**
 * Splits lines of text into `.split-line > .split-word` spans for GSAP mask
 * reveals. Real text stays in the DOM (a11y + SEO). Animate `.split-word`
 * inside a scoped useGSAP.
 */
export function SplitWords({
  lines,
  className,
  wordClassName,
}: {
  lines: SplitSegment[][];
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={className}>
      {lines.map((segs, li) => (
        <span key={li} className="split-line">
          {segs.map((seg, si) => (
            <Fragment key={si}>
              {seg.t.split(' ').map((w, wi) => (
                <Fragment key={wi}>
                  <span className={cn('split-word', wordClassName, seg.c)}>{w}</span>{' '}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}
