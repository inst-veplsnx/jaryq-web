import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Team } from "@/components/landing/Team";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
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
