'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6">Why choose EVLink?</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">🔌 Connect Any EV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Supports most EV brands through Enode. Instantly link your vehicle and start syncing data to Home Assistant.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">📊 Real-Time Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Monitor charging status, battery level and range in real time – right from your dashboard.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">⚡ Smart Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Automate pre-heating, smart charging and schedules using Home Assistant routines and scenes.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}