// src/components/landing/PricingSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from 'react-i18next';

export default function PricingSection() {
  const { isLoggedIn, tier, loading } = useUser();
  const { t } = useTranslation();

  type PlanKey = 'free' | 'basic' | 'pro' | 'custom';
  const plans: PlanKey[] = ['free', 'basic', 'pro', 'custom'];

  const planConfig: Record<PlanKey, {
    title: string;
    price: string;
    features: readonly string[];
    getButton: () => { label: string; href: string; disabled: boolean; badge: string | null };
  }> = {
    free: {
      title: t('landing.pricing.plans.free.title'),
      price: t('landing.pricing.plans.free.price'),
      features: t('landing.pricing.plans.free.features', { returnObjects: true }) as string[],
      getButton: () => {
        if (loading) {
          return { label: t('landing.pricing.buttons.loading'), href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: t('landing.pricing.buttons.register'), href: '/register?plan=free', disabled: false, badge: null };
        }
        if (tier === 'free') {
          return { label: t('landing.pricing.buttons.currentPlan'), href: '#', disabled: true, badge: t('landing.pricing.badges.currentPlan') };
        }
        return { label: t('landing.pricing.buttons.downgradeToFree'), href: '/billing', disabled: false, badge: null };
      },
    },
    basic: {
      title: t('landing.pricing.plans.basic.title'),
      price: t('landing.pricing.plans.basic.price'),
      features: t('landing.pricing.plans.basic.features', { returnObjects: true }) as string[],
      getButton: () => {
        if (loading) {
          return { label: t('landing.pricing.buttons.loading'), href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: t('landing.pricing.buttons.register'), href: '/register?plan=basic', disabled: false, badge: null };
        }
        if (tier === 'basic') {
          return { label: t('landing.pricing.buttons.currentPlan'), href: '#', disabled: true, badge: t('landing.pricing.badges.currentPlan') };
        }
        if (tier === 'free') {
          return { label: t('landing.pricing.buttons.upgradeToBasic'), href: '/billing', disabled: false, badge: null };
        }
        // logged in & Pro/Custom
        return { label: t('landing.pricing.buttons.manageSubscription'), href: '/billing', disabled: false, badge: null };
      },
    },
    pro: {
      title: t('landing.pricing.plans.pro.title'),
      price: t('landing.pricing.plans.pro.price'),
      features: t('landing.pricing.plans.pro.features', { returnObjects: true }) as string[],
      getButton: () => {
        if (loading) {
          return { label: t('landing.pricing.buttons.loading'), href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: t('landing.pricing.buttons.register'), href: '/register?plan=pro', disabled: false, badge: null };
        }
        if (tier === 'pro') {
          return { label: t('landing.pricing.buttons.currentPlan'), href: '#', disabled: true, badge: t('landing.pricing.badges.currentPlan') };
        }
        if (tier === 'free' || tier === 'basic') {
          return { label: t('landing.pricing.buttons.upgradeToPro'), href: '/billing', disabled: false, badge: null };
        }
        // logged in & Custom
        return { label: t('landing.pricing.buttons.manageSubscription'), href: '/billing', disabled: false, badge: null };
      },
    },
    custom: {
      title: t('landing.pricing.plans.custom.title'),
      price: t('landing.pricing.plans.custom.price'),
      features: t('landing.pricing.plans.custom.features', { returnObjects: true }) as string[],
      getButton: () => ({ label: t('landing.pricing.buttons.contactUs'), href: '/contact', disabled: false, badge: t('landing.pricing.badges.comingSoon') }),
    },
  };

  return (
    <section className="relative z-20 -mt-100 max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6 text-white">{t('landing.pricing.title')}</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((key) => {
          const cfg = planConfig[key];
          const btn = cfg.getButton();
          return (
            <Card
              key={key}
              className={`relative border shadow-md bg-white ${key === 'custom' ? 'bg-muted/50 opacity-60' : ''}`}
            >
              {btn.badge && (
                <Badge variant="secondary" className="absolute top-2 right-2 z-10 text-xs">
                  {btn.badge}
                </Badge>
              )}
              <CardHeader className="pt-6">
                <CardTitle className={`text-xl font-semibold uppercase ${btn.badge ? 'mt-1' : ''}`}>{cfg.title}</CardTitle>
                <div className="mt-2 text-lg text-blue-800 font-bold">{cfg.price}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm text-left text-gray-700 space-y-1">
                  {cfg.features.map((f) => (
                    <li key={f}>✔ {f}</li>
                  ))}
                </ul>
                <Button className="w-full" disabled={btn.disabled} asChild>
                  <Link href={btn.href}>{btn.label}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
