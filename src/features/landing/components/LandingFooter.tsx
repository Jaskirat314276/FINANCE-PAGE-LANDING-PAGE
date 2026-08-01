import { Logo } from '@/components/Logo';
import { SEBI_DISCLAIMER } from '../data';

const COLS = [
  {
    title: 'Product',
    links: ['How it works', 'Why trust it', 'Features', 'Strategies'],
    hrefs: ['#how-it-works', '#why-trust-it', '#features', '#strategies'],
  },
  {
    title: 'Resources',
    links: ['GitHub', 'Roadmap', 'License (MIT)'],
    hrefs: ['https://github.com/Jaskirat314276/FINANCE-AGENT', '#', '#'],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A real advisor, not a chatbot — for Indian markets.
            </p>
          </div>
          <div className="flex gap-16">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="eyebrow">{c.title}</p>
                <ul className="mt-3 space-y-2">
                  {c.links.map((l, i) => (
                    <li key={l}>
                      <a
                        href={c.hrefs[i]}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                        {...(c.hrefs[i].startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/[0.06] pt-6 text-center">
          <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-slate-500">{SEBI_DISCLAIMER}</p>
          <p className="mt-3 text-xs text-slate-600">
            © {new Date().getFullYear()} Seeker AI · Built for Indian investors.
          </p>
        </div>
      </div>
    </footer>
  );
}
