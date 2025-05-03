'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import type { ApiResponse } from '@/types/api';
import { toast } from 'sonner';
import { apiFetchSafe } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const allowRegister = process.env.NEXT_PUBLIC_ALLOW_REGISTER === 'true';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInterestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error }: ApiResponse<{ message?: string }> = await apiFetchSafe('/interest', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw new Error(error.message || 'Submission failed');
      toast.success(data?.message || 'Thank you for your interest!');
      setName('');
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      console.error('Interest submission error:', err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative z-0 bg-gradient-to-br from-indigo-100 via-white to-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-6">
            EVLink – your smart EV gateway
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Control, monitor and automate your electric vehicle with Home Assistant and Enode.
          </p>

          {allowRegister ? (
            <div className="space-x-4">
              <Button asChild>
                <a href="/register">Get Started</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/login">Log In</a>
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto mt-10">
              <Card>
                <CardHeader>
                  <CardTitle>We’re not live yet</CardTitle>
                  <CardDescription>
                    Enter your name and email to get notified when we launch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInterestSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      required
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Notify Me'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Decorative image */}
        <div className="absolute right-10 bottom-0 w-96 opacity-20 -z-10 pointer-events-none">
          <Image src="/ev_car.png" alt="EV Car" width={400} height={300} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">🔌 Real-time Charging</h3>
          <p className="text-gray-600">Monitor your EV battery, charging speed and range in real time.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">📊 Insights & Automation</h3>
          <p className="text-gray-600">Integrate seamlessly with Home Assistant and smart home automation.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">🔒 Secure & Scalable</h3>
          <p className="text-gray-600">Built with FastAPI and Next.js. Safe, fast and open-source.</p>
        </div>
      </section>
    </main>
  );
}
