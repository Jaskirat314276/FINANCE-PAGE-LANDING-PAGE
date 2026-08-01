/** Ground-truth content from the Seeker AI product (see docs/landing-brief.md). */

export const QUESTIONS = [
  'Should I invest ₹50,000 today?',
  'Build a ₹10 lakh portfolio',
  'Compare Infosys vs TCS',
  'Why is TCS falling?',
  'How much cash should I hold?',
  'Should I buy small caps now?',
];

export const ONBOARDING_STEPS = [
  'Personal',
  'Income',
  'Financial situation',
  'Goals',
  'Risk quiz',
  'Horizon',
  'Amounts',
  'Preferences',
  'Tax',
];

export const ADVISORY_SECTIONS = [
  'Executive summary',
  'Recommendation',
  'Why this fits your profile',
  'Market & sector context',
  'Fundamental analysis',
  'Technical analysis',
  'Risk assessment',
  'Suggested allocation',
  'Investment horizon',
  'Key risks & catalysts',
  'Alternatives',
  'Action items',
];

export const FEATURES = [
  {
    icon: 'sparkles',
    title: 'AI Investment Advisor',
    text: 'Ask anything — "Should I invest ₹50,000 today?" — and get a 12-section structured answer grounded in your profile and live NSE data, never generic tips.',
  },
  {
    icon: 'chart-pie',
    title: 'Portfolio Planning',
    text: 'A quantitative engine builds allocations across stocks, ETFs, gold, debt and cash — with Monte Carlo projections and a rebalancing calendar.',
  },
  {
    icon: 'cpu-chip',
    title: 'Personalized Recommendations',
    text: 'Every suggestion is scored against your risk band, horizon, sector preferences and tax situation. Advice adapts as your profile evolves.',
  },
  {
    icon: 'globe',
    title: 'Indian Market Intelligence',
    text: 'Nifty, Sensex, Bank Nifty, sector heatmaps, top movers, fundamentals and technicals for NSE stocks — with AI daily commentary.',
  },
  {
    icon: 'flag',
    title: 'Goal Based Investing',
    text: 'House, retirement, education, freedom — each goal gets its own inflation-adjusted target, required SIP and progress tracking.',
  },
  {
    icon: 'shield',
    title: 'Risk, Measured Properly',
    text: 'No "low/medium/high" dropdowns. Scenario-based questions compute a real risk score from willingness and financial capacity.',
  },
] as const;

export const STRATEGIES: { name: string; blurb: string; fit: number; risk: 'LOW' | 'MODERATE' | 'HIGH' }[] = [
  { name: 'Conservative', blurb: 'Capital preservation first — debt-heavy with an equity sleeve.', fit: 68, risk: 'LOW' },
  { name: 'Balanced', blurb: 'The classic 60/40 tuned for Indian markets.', fit: 79, risk: 'MODERATE' },
  { name: 'Growth', blurb: 'Equity-led compounding with disciplined rebalancing.', fit: 91, risk: 'MODERATE' },
  { name: 'Aggressive', blurb: 'Maximum equity, small-cap tilt, long horizon required.', fit: 88, risk: 'HIGH' },
  { name: 'High Dividend', blurb: 'Cash-flowing large caps with dividend screens.', fit: 62, risk: 'LOW' },
  { name: 'Value', blurb: 'Quality businesses trading below intrinsic estimates.', fit: 74, risk: 'MODERATE' },
  { name: 'Momentum', blurb: 'Ride strength with strict exits and sector caps.', fit: 57, risk: 'HIGH' },
  { name: 'Swing', blurb: 'Shorter cycles on technical setups — for active hands.', fit: 41, risk: 'HIGH' },
  { name: 'Long Term Compounder', blurb: 'Buy quality, hold a decade, let ROCE do the work.', fit: 85, risk: 'MODERATE' },
  { name: 'Retirement Glidepath', blurb: 'Equity that steps down as your target date nears.', fit: 71, risk: 'LOW' },
  { name: 'Goal Based Buckets', blurb: 'Each goal gets its own bucket, horizon and mix.', fit: 83, risk: 'MODERATE' },
];

export const TICKER_ITEMS: { label: string; value: string; delta: number }[] = [
  { label: 'NIFTY 50', value: '24,812.40', delta: 0.42 },
  { label: 'SENSEX', value: '81,455.15', delta: 0.31 },
  { label: 'BANK NIFTY', value: '51,220.80', delta: -0.18 },
  { label: 'NIFTY IT', value: '43,610.25', delta: 0.66 },
  { label: 'TCS', value: '4,112.30', delta: 1.21 },
  { label: 'HAL', value: '4,890.55', delta: 2.08 },
  { label: 'ICICI Bank', value: '1,244.70', delta: 0.54 },
  { label: 'INFY', value: '1,872.10', delta: -0.83 },
  { label: 'RELIANCE', value: '3,048.90', delta: 0.12 },
  { label: 'GOLD', value: '₹74,120/10g', delta: 0.27 },
];

export const SEBI_DISCLAIMER =
  'Seeker AI is an educational tool, not a SEBI-registered investment adviser. ' +
  'Markets carry risk; past performance does not guarantee future returns. ' +
  'Consider consulting a registered adviser before acting.';

/** Sample advisory (the repo's own mock numbers). */
export const SAMPLE = {
  amount: '₹5,00,000',
  band: 'aggressive',
  horizon: '5–10 yrs',
  equityPct: 48,
  etfPct: 17,
  debtPct: 10,
  goldPct: 7,
  cashPct: 18,
  cagr: '13.1%',
  vol: '15.8%',
  pLoss: '8.2%',
  confidence: 74,
  riskScore: 72,
};
