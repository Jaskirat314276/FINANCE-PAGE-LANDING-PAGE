/**
 * Static hero art — reduced-motion / no-WebGL / Suspense fallback.
 * The same signal line, pre-formed, with a soft glow. Zero JS.
 */
export function HeroStatic() {
  return (
    <div aria-hidden className="absolute inset-0 flex items-end justify-center overflow-hidden pb-[12vh]">
      <svg viewBox="0 0 800 300" className="w-[86%] max-w-4xl opacity-80" fill="none">
        <defs>
          <linearGradient id="hs-g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#3987e5" />
          </linearGradient>
          <filter id="hs-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <path
          d="M40 250 C 160 240, 200 150, 300 140 S 420 205, 500 190 S 690 90, 760 55"
          stroke="url(#hs-g)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#hs-blur)"
          opacity="0.55"
        />
        <path
          d="M40 250 C 160 240, 200 150, 300 140 S 420 205, 500 190 S 690 90, 760 55"
          stroke="url(#hs-g)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="760" cy="55" r="7" fill="#34d399" opacity="0.9" />
        <circle cx="760" cy="55" r="14" fill="#34d399" opacity="0.25" />
      </svg>
    </div>
  );
}
