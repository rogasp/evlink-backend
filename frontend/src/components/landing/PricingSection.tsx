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

  type PlanKey = 'free' | 'basic' | 'pro' | 'custom';
  const plans: PlanKey[] = ['free', 'basic', 'pro', 'custom'];

  const planConfig: Record<PlanKey, {
    title: string;
    price: string;
    features: readonly string[];
    getButton: () => { label: string; href: string; disabled: boolean; badge: string | null };
  }> = {
    free: {
      title: 'Free',
      price: '0 EUR',
      features: [
        '1 connected device',
        '2 API calls per day',
        '1 day log retention',
        'No webhooks',
        'No priority support',
        '30 days: full access trial'
      ],
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
        return { label: 'Downgrade to Free', href: '/billing', disabled: false, badge: null };
      },
    },
    basic: {
      title: 'Basic',
      price: '1.99 EUR / device',
      features: [
        '2 connected devices',
        '10 API calls per device/day',
        '7 days log retention',
        'No webhooks',
        'No priority support'
      ],
      getButton: () => {
        if (loading) {
          return { label: 'Loading...', href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: 'Register', href: '/register?plan=basic', disabled: false, badge: null };
        }
        if (tier === 'basic') {
          return { label: 'Current Plan', href: '#', disabled: true, badge: 'Current plan' };
        }
        if (tier === 'free') {
          return { label: 'Upgrade to Basic', href: '/billing', disabled: false, badge: null };
        }
        // logged in & Pro/Custom
        return { label: 'Manage Subscription', href: '/billing', disabled: false, badge: null };
      },
    },
    pro: {
      title: 'Pro',
      price: '4.99 EUR / device',
      features: [
        '5 connected devices',
        '100 API calls per device/day',
        '180 days log retention',
        'Webhooks (HA + generic)',
        'Priority support (48h)'
      ],
      getButton: () => {
        if (loading) {
          return { label: 'Loading...', href: '#', disabled: true, badge: null };
        }
        if (!isLoggedIn) {
          return { label: 'Register', href: '/register?plan=pro', disabled: false, badge: null };
        }
        if (tier === 'pro') {
          return { label: 'Current Plan', href: '#', disabled: true, badge: 'Current plan' };
        }
        if (tier === 'free' || tier === 'basic') {
          return { label: 'Upgrade to Pro', href: '/billing', disabled: false, badge: null };
        }
        // logged in & Custom
        return { label: 'Manage Subscription', href: '/billing', disabled: false, badge: null };
      },
    },
    custom: {
      title: 'Custom',
      price: 'Custom pricing',
      features: [
        'Unlimited devices',
        'Custom API usage',
        'Custom log retention',
        'Advanced webhooks',
        'Priority support (24h/SLA)'
      ],
      getButton: () => ({ label: 'Contact us', href: '/contact', disabled: false, badge: 'Coming soon' }),
    },
  };

  return (
    <section className="relative z-20 -mt-100 max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6 text-white">Choose your plan</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((key) => {
          const cfg = planConfig[key];
          const btn = cfg.getButton();
          return (
            <Card
              key={key}
              className={`border shadow-md bg-white ${key === 'custom' ? 'bg-muted/50 opacity-60 relative' : ''}`}
            >
              {btn.badge && (
                <Badge variant="secondary" className="absolute top-4 right-4">
                  {btn.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{cfg.title}</CardTitle>
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
