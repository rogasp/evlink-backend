// src/components/landing/PricingSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUser';

export default function PricingSection() {
  const { isLoggedIn, tier, loading } = useUser();

  type PlanKey = 'free' | 'pro' | 'fleet';
  const plans: PlanKey[] = ['free', 'pro', 'fleet'];

  const planConfig: Record<PlanKey, {
    title: string;
    features: readonly string[];
    getButton: () => { label: string; href: string; disabled: boolean; badge: string | null };
  }> = {
    free: {
      title: 'Free',
      features: ['Connect 1 vehicle', 'Near real-time data', 'Home Assistant support'],
      getButton: () => {
        if (loading) {
          return { label: 'Loading...', href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: 'Register', href: '/register?plan=free', disabled: false, badge: null };
        }
        if (tier === 'free') {
          return { label: 'Current Plan', href: '#', disabled: true, badge: 'Current plan' };
        }
        // logged in & on Pro/Fleet
        return { label: 'Downgrade to Free', href: '/app/billing', disabled: false, badge: null };
      },
    },
    pro: {
      title: 'Pro',
      features: ['Up to 3 vehicles', 'Email/SMS alerts', 'Near real-time updates'],
      getButton: () => {
        if (loading) {
          return { label: 'Loading...', href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: 'Register', href: '/register?plan=pro', disabled: false, badge: null };
        }
        if (tier === 'free') {
          return { label: 'Upgrade to Pro', href: '/app/billing', disabled: false, badge: null };
        }
        // logged in & Pro or Fleet
        return { label: 'Manage Subscription', href: '/app/billing', disabled: false, badge: null };
      },
    },
    fleet: {
      title: 'Fleet',
      features: ['Unlimited vehicles', 'Priority support', 'TBD'],
      getButton: () => ({ label: 'Coming Soon', href: '#', disabled: true, badge: 'Coming soon' }),
    },
  };

  return (
    <section className="relative z-20 -mt-100 max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6 text-white">Choose your plan</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((key) => {
          const cfg = planConfig[key];
          const btn = cfg.getButton();
          return (
            <Card
              key={key}
              className={`border shadow-md bg-white ${key === 'fleet' ? 'bg-muted/50 opacity-60 relative' : ''}`}
            >
              {btn.badge && (
                <Badge variant="secondary" className="absolute top-4 right-4">
                  {btn.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{cfg.title}</CardTitle>
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
