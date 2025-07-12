'use client';

import { useUserContext } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
// Removed useRouter import
import { authFetch } from '@/lib/authFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface InsightsData {
  total_users?: number;
  new_users_1day?: number;
  new_users_7days?: number;
  new_users_30days?: number;
  total_vehicles?: number;
  new_vehicles_1day?: number;
  new_vehicles_7days?: number;
  new_vehicles_30days?: number;
  total_revenue?: number;
  monthly_revenue?: number;
  yearly_revenue?: number;
  basic_subscriptions?: number;
  pro_subscriptions?: number;
  users_on_trial?: number;
}

/**
 * AdminDashboardPage component displays various statistics and insights for administrators.
 * It fetches data from backend API endpoints and presents it in a dashboard format.
 */
export default function AdminDashboardPage() {
  const { mergedUser, loading, accessToken } = useUserContext();
  // Removed router = useRouter();
  const [insights, setInsights] = useState<InsightsData>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false); // New state to prevent re-fetching

  useEffect(() => {
    const fetchInsights = async () => {
      if (!accessToken || !mergedUser || hasFetched) { // Added hasFetched check
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const endpoints = [
          '/insights/users/total',
          '/insights/users/new/1day',
          '/insights/users/new/7days',
          '/insights/users/new/30days',
          '/insights/vehicles/total',
          '/insights/vehicles/new/1day',
          '/insights/vehicles/new/7days',
          '/insights/vehicles/new/30days',
          '/insights/revenue/total',
          `/insights/revenue/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`,
          `/insights/revenue/yearly?year=${new Date().getFullYear()}`,
          '/insights/subscriptions/basic',
          '/insights/subscriptions/pro',
          '/insights/users/on_trial',
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const { data, error } = await authFetch(endpoint, { method: 'GET', accessToken });
            if (error) {
              toast.error(`Failed to fetch ${endpoint}: ${error.message}`);
              return null;
            }
            return data;
          })
        );

        const combinedInsights: InsightsData = results.reduce((acc, current) => {
          if (current) {
            return { ...acc, ...current };
          } 
          return acc;
        }, {});

        setInsights(combinedInsights);
        setHasFetched(true); // Set to true after successful fetch
      } catch (error) {
        console.error('Error fetching insights:', error);
        toast.error('Failed to fetch admin insights.');
      } finally {
        setDataLoading(false);
      }
    };

    if (accessToken && mergedUser && mergedUser.role === 'admin' && !hasFetched) { // Added hasFetched check
      fetchInsights();
    }
  }, [accessToken, mergedUser, hasFetched]); // Added hasFetched to dependencies

  if (loading || !mergedUser) {
    return (
      <div className="container py-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {dataLoading ? (
        <p>Loading insights...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_users ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <div className="text-md font-bold mt-2">{insights.new_users_1day ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Users (24h)</p>
              <div className="text-md font-bold mt-2">{insights.new_users_7days ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Users (7d)</p>
              <div className="text-md font-bold mt-2">{insights.new_users_30days ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Users (30d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicle Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_vehicles ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Total Vehicles</p>
              <div className="text-md font-bold mt-2">{insights.new_vehicles_1day ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Vehicles (24h)</p>
              <div className="text-md font-bold mt-2">{insights.new_vehicles_7days ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Vehicles (7d)</p>
              <div className="text-md font-bold mt-2">{insights.new_vehicles_30days ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">New Vehicles (30d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${insights.total_revenue?.toFixed(2) ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <div className="text-md font-bold mt-2">${insights.monthly_revenue?.toFixed(2) ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              <div className="text-md font-bold mt-2">${insights.yearly_revenue?.toFixed(2) ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Yearly Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.basic_subscriptions ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Basic Subscriptions</p>
              <div className="text-md font-bold mt-2">{insights.pro_subscriptions ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Pro Subscriptions</p>
              <div className="text-md font-bold mt-2">{insights.users_on_trial ?? 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Users on Trial</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}