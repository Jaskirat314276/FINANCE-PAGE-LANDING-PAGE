import { useEffect } from 'react';
import { ScrollTrigger } from './motion/gsap';
import { SmoothScroll } from './motion/SmoothScroll';
import { LandingNav } from './components/LandingNav';
import { ScrollProgress } from './components/ScrollProgress';
import { Hero } from './components/Hero';
import { TickerStrip } from './components/TickerStrip';
import { HowSeekerThinks } from './components/HowSeekerThinks';
import { GroundedProof } from './components/GroundedProof';
import { Manifesto } from './components/Manifesto';
import { FeatureGrid } from './components/FeatureGrid';
import { StrategyRail } from './components/StrategyRail';
import { FinalCTA } from './components/FinalCTA';
import { LandingFooter } from './components/LandingFooter';

export default function LandingPage() {
  // Pinned scenes measure correctly once webfonts settle.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <SmoothScroll>
      <div id="top" className="relative">
        <ScrollProgress />
        <LandingNav />
        <main>
          <Hero />
          <TickerStrip />
          <HowSeekerThinks />
          <GroundedProof />
          <Manifesto />
          <FeatureGrid />
          <StrategyRail />
          <FinalCTA />
        </main>
        <LandingFooter />
      </div>
    </SmoothScroll>
  );
}
