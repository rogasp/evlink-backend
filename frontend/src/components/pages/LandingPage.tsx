'use client';

import HeroSection from '@/components/landing/HeroSection';
import PricingSection from '@/components/landing/PricingSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SupportSection from '@/components/landing/SupportSection';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <SupportSection />
      <Separator />
    </main>
  );
}