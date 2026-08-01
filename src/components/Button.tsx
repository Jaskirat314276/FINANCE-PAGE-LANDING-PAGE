import { type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent-deep to-accent text-ink-950 font-semibold shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-white/[0.07] text-slate-100 border border-white/10 hover:bg-white/[0.12]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

/** Anchor-based button (standalone build has no router — see INTEGRATION.md). */
export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size }) {
  return (
    <a
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
