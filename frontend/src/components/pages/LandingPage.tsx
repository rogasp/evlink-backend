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
      <section className="relative bg-gradient-to-br from-indigo-100 via-white to-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-6">
            EVLink – Your smart EV gateway
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Monitor, control and automate your electric vehicle with Home Assistant & Enode.
          </p>

          <div className="flex justify-center flex-wrap gap-4 mb-6">
            {clientReady && user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
              </>
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

        <div className="absolute right-10 bottom-0 w-96 opacity-20 -z-10 pointer-events-none">
          <Image src="/ev_car.png" alt="EV Car" width={400} height={300} />
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