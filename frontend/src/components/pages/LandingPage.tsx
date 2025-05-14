// src/components/pages/LandingPage.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  const { user } = useAuth({ requireAuth: false });
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden text-white py-24 bg-indigo-700 min-h-[600px]">
  <Image
    src="/ev_car.png"
    alt=""
    fill
    className="object-cover opacity-10 z-0"
  />

  <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
    <span className="inline-block text-sm font-semibold uppercase bg-yellow-400 text-black px-3 py-1 rounded-full mb-6">
      Free to get started
    </span>

    <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl mb-4">
      Connect your EV.<br />Automate everything.
    </h1>

    <p className="text-xl sm:text-2xl font-light mb-10">
      EVLink links your electric vehicle with Home Assistant using Enode.
      It's private, scalable, and ready for power users.
    </p>

    <div className="flex flex-wrap justify-center gap-4">
      <Button size="lg" asChild>
        <Link href="/register">Start Free</Link>
      </Button>
      <Button variant="ghost" size="lg" asChild className="border border-white text-white hover:bg-white/10">
        <Link href="/roadmap">See Roadmap</Link>
      </Button>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>🔌 Real-time Charging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Live battery data, charging speed and range – right from your Home Assistant dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Smart Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Automate actions like pre-heating, smart charging and scheduling based on your routines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔒 Secure & Scalable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Built with FastAPI and Next.js. Open-source, secure and ready for scale.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />
    </main>
  );
}