'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingSection() {
  return (
    <section className="relative z-20 -mt-100 max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6 text-white">Choose your plan</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-md border bg-muted/80 opacity-90">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm text-left text-gray-600 space-y-1">
              <li>✔ Connect 1 vehicle</li>
              <li>✔ Real-time data</li>
              <li>✔ Home Assistant support</li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/register">Start for free</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border bg-muted/50 opacity-60 relative">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Basic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm text-left text-gray-600 space-y-1">
              <li>✔ Up to 3 vehicles</li>
              <li>✔ Email alerts</li>
              <li>✔ Smart charging control</li>
            </ul>
            <Button className="w-full" disabled>Not available</Button>
          </CardContent>
        </Card>

        <Card className="border bg-muted/50 opacity-60 relative">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm text-left text-gray-600 space-y-1">
              <li>✔ Unlimited vehicles</li>
              <li>✔ Priority support</li>
              <li>✔ Advanced automation</li>
            </ul>
            <Button className="w-full" disabled>Not available</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
