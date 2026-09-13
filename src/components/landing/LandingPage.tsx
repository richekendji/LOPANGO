import { LandingNav } from "./LandingNav";
import { LandingHero } from "./LandingHero";
import { LandingFeatures } from "./LandingFeatures";
import { LandingPhilosophy } from "./LandingPhilosophy";
import { LandingProtocol } from "./LandingProtocol";
import { LandingPricing } from "./LandingPricing";
import { LandingFooter } from "./LandingFooter";
import { LandingPrefetch } from "./LandingPrefetch";

export function LandingPage() {
  return (
    <div className="landing-root relative min-h-full bg-[#f5f5f5]">
      <LandingPrefetch />
      <div className="noise-overlay" aria-hidden />
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingPhilosophy />
      <LandingProtocol />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
}
