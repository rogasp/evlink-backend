"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, BatteryCharging, Zap } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { supabase } from "@/lib/supabaseClient";

type GlobalStats = {
  unique_users: number;
  unique_vehicles: number;
  total_sessions: number;
  total_kwh_charged: number;
  total_minutes_charged: number;
  average_charge_rate_kwh_per_hour: number;
  highest_max_charge_rate_kw: number;
  highest_average_charge_rate_kw: number;
};

export default function GlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const {
            data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
            console.error("No access token found");
            return;
            }

            const res = await authFetch("/api/stats/global", {
            method: "GET",
            accessToken: session.access_token,
            });

            if (res.data) setStats(res.data);
            else console.error(res.error);
        };

        fetchStats();
    }, []);

  if (!stats) return null;

  const statItems = [
    { icon: Users, label: "Users", value: stats.unique_users },
    { icon: Car, label: "Vehicles", value: stats.unique_vehicles },
    { icon: BatteryCharging, label: "Charging Sessions", value: stats.total_sessions },
    { icon: Zap, label: "Total kWh Charged", value: `${Math.round(stats.total_kwh_charged)} kWh` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(({ icon: Icon, label, value }) => (
        <Card key={label} className="flex items-center p-4 gap-4">
          <Icon className="w-6 h-6 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-bold">{value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
