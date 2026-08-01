import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { useReducedMotion } from '../motion/useReducedMotion';
import { Logo } from '@/components/Logo';
import { ButtonLink } from '@/components/Button';
import { cn } from '@/lib/utils';
import { APP_URL } from '../data';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-trust-it', label: 'Why trust it' },
  { href: '#features', label: 'Features' },
  { href: '#strategies', label: 'Strategies' },
];

export function LandingNav() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 24,
        end: 'max',
        onUpdate: (self) => {
          setScrolled(self.scroll() > 24);
          if (reduced) return;
          // Hide on scroll down, return on scroll up.
          if (self.direction === 1 && self.scroll() > 320) {
            gsap.to(ref.current, { yPercent: -120, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
          } else {
            gsap.to(ref.current, { yPercent: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
          }
        },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <header
      ref={ref}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'glass rounded-none border-x-0 border-t-0 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6" aria-label="Main">
        <a href="#top" aria-label="Seeker AI — home">
          <Logo />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href={APP_URL} className="hidden text-sm text-slate-300 transition hover:text-white sm:block">
            Sign in
          </a>
          <ButtonLink href={APP_URL} size="sm">
            Get started
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
