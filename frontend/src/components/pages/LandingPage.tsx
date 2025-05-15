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
      <section className="relative overflow-hidden text-white py-24 bg-indigo-700 min-h-[600px]">
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

          <div className="flex justify-center flex-wrap gap-4 mb-6">
            {clientReady && user && (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}

            <Button variant="ghost" asChild>
              <Link href="/admin/status">
                <Badge variant="outline" className="hover:bg-indigo-200 hover:text-indigo-900 transition">
                  Service Status →
                </Badge>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-12">Why choose EVLink?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-indigo-700 text-lg">🔌 Connect Any EV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Supports most EV brands through Enode. Instantly link your vehicle and start syncing data to Home Assistant.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-indigo-700 text-lg">📊 Real-Time Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor charging status, battery level and range in real time – right from your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-indigo-700 text-lg">⚡ Smart Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automate pre-heating, smart charging and schedules using Home Assistant routines and scenes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Support Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-6">EVLink is open source & built for the community</h2>
        <p className="text-gray-600 text-lg mb-8">
          This project is a personal hobby, built on evenings and weekends. If you find it useful, you can support its future.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://github.com/rogasp/evlink"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
          >
            ⭐ Star on GitHub
          </a>

          <a
            href="https://www.buymeacoffee.com/rogasp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-3 border border-yellow-400 text-sm font-medium rounded-md bg-yellow-300 text-black hover:bg-yellow-400"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-12">Choose your plan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free plan */}
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-left text-gray-600 space-y-2">
                <li>✔ Connect 1 vehicle</li>
                <li>✔ Real-time data</li>
                <li>✔ Home Assistant support</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Start for free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Basic plan */}
          <Card className="border bg-muted/50 opacity-60 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">Coming soon</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Basic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-left text-gray-600 space-y-2">
                <li>✔ Up to 3 vehicles</li>
                <li>✔ Email alerts</li>
                <li>✔ Smart charging control</li>
              </ul>
              <Button className="w-full" disabled>
                Not available
              </Button>
            </CardContent>
          </Card>

          {/* Pro plan */}
          <Card className="border bg-muted/50 opacity-60 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">Coming soon</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-left text-gray-600 space-y-2">
                <li>✔ Unlimited vehicles</li>
                <li>✔ Priority support</li>
                <li>✔ Advanced automation</li>
              </ul>
              <Button className="w-full" disabled>
                Not available
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />
    </main>
  );
}
