'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatteryCharging, Zap } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "../ui/button";
import Link from "next/link";

type PersonalStats = {
  total_sessions: number;
  total_kwh_charged: number | null;
  total_minutes_charged: number | null;
  average_charge_rate_kwh_per_hour: number | null;
  min_start_time: string | null;
  max_end_time: string | null;
  unique_vehicles: number;
};

export default function PersonalStatsCard() {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatMinutesToDuration = (totalMinutes: number | null): string => {
    if (totalMinutes === null) return "N/A";

    const minutesInHour = 60;
    const minutesInDay = 24 * minutesInHour;
    const minutesInMonth = 30 * minutesInDay; // Approximate

    if (totalMinutes >= minutesInMonth) {
      const months = Math.floor(totalMinutes / minutesInMonth);
      const remainingMinutes = totalMinutes % minutesInMonth;
      const days = Math.floor(remainingMinutes / minutesInDay);
      return `${months} months ${days} days`;
    } else if (totalMinutes >= minutesInDay) {
      const days = Math.floor(totalMinutes / minutesInDay);
      const remainingMinutes = totalMinutes % minutesInDay;
      const hours = Math.floor(remainingMinutes / minutesInHour);
      const minutes = Math.floor(remainingMinutes % minutesInHour);
      return `${days} days ${hours} hours ${minutes} minutes`;
    } else if (totalMinutes >= minutesInHour) {
      const hours = Math.floor(totalMinutes / minutesInHour);
      const minutes = Math.floor(totalMinutes % minutesInHour);
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${Math.floor(totalMinutes)} minutes`;
    }
  };

  const formatKwhToLargerUnits = (kwh: number | null): string => {
    if (kwh === null) return "N/A";

    if (kwh >= 1_000_000) {
      return `${(kwh / 1_000_000).toFixed(3)} TWh`;
    } else if (kwh >= 1_000) {
      return `${(kwh / 1_000).toFixed(2)} MWh`;
    } else {
      return `${kwh.toFixed(2)} kWh`;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.error("No access token found");
          setLoading(false);
          return;
        }

        const res = await authFetch("/api/stats/user", {
          method: "GET",
          accessToken: session.access_token,
        });

        if (res.data) setStats(res.data);
        else console.error(res.error);
      } catch (error) {
        console.error("Failed to fetch personal stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Your Personal Charging Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4 text-center">
          <p className="text-muted-foreground">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <Card className="p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Your Personal Charging Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t linked a vehicle yet or lack charging sessions.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const startDate = stats.min_start_time ? new Date(stats.min_start_time) : null;
  const endDate = stats.max_end_time ? new Date(stats.max_end_time) : null;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statItems = [
    { icon: BatteryCharging, label: "Charging Sessions", value: stats.total_sessions },
    { icon: Zap, label: "Total kWh Charged", value: formatKwhToLargerUnits(stats.total_kwh_charged) },
    { icon: BatteryCharging, label: "Total Minutes Charged", value: formatMinutesToDuration(stats.total_minutes_charged) },
    { icon: Zap, label: "Average Charge Rate", value: `${stats.average_charge_rate_kwh_per_hour?.toFixed(2) ?? 'N/A'} kWh/h` },
  ];

  return (
    <Card className="p-4">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Your Personal Charging Insights</CardTitle>
        {startDate && endDate && (
          <div className="text-sm text-muted-foreground">
            Data collected between {dateFormatter.format(startDate)} and {dateFormatter.format(endDate)}.
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex items-center p-4 gap-4">
              <Icon className="w-6 h-6 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-lg font-bold text-center">{value}</div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
