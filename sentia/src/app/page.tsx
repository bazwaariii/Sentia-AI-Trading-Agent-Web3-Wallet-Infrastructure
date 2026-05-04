"use client";

import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import SDKSection from "@/components/SDKSection";
import DashboardPreview from "@/components/DashboardPreview";
import WebhookSection from "@/components/WebhookSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <ShowcaseCarousel />
      <FeaturesSection />
      <SDKSection />
      <DashboardPreview />
      <WebhookSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
