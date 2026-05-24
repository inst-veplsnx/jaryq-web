import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Team } from "@/components/landing/Team";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LandingMotion } from "@/components/landing/LandingMotion";

export default function LandingPage() {
  return (
    <>
      <LandingMotion />
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <Team />
      <CTA />
      <Footer />
    </>
  );
}
