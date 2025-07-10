'use client';

import { useUserContext } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FinanceInsightsData {
  total_revenue?: number;
  monthly_revenue?: number;
  yearly_revenue?: number;
  basic_subscriptions?: number;
  pro_subscriptions?: number;
  users_on_trial?: number;
  balance?: { available: { amount: number; currency: string }[]; pending: { amount: number; currency: string }[] };
  invoices?: Invoice[]; // Changed to Invoice type
  subscriptions?: any[]; // Replace 'any' with actual Subscription type later
  customers?: Customer[]; // Changed to Customer type
}

interface Invoice {
  invoice_id: string;
  user_id: string;
  amount_due: number;
  currency: string;
  status: string;
  created_at: string;
  pdf_url?: string;
  hosted_invoice_url?: string;
}

interface Customer {
  id: string;
  email: string;
  name?: string;
  stripe_customer_id?: string;
  tier?: string;
  subscription_status?: string;
}

export default function AdminFinancePage() {
  const { mergedUser, loading, accessToken } = useUserContext();
  const [insights, setInsights] = useState<FinanceInsightsData>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const getCustomerEmail = (userId: string) => {
    const customer = insights.customers?.find(c => c.id === userId);
    return customer?.email || 'N/A';
  };

  useEffect(() => {
    const fetchFinanceInsights = async () => {
      if (!accessToken || !mergedUser || hasFetched) { // Added hasFetched check
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

        const endpoints = [
          { url: '/insights/revenue/total', key: 'total_revenue' },
          { url: `/insights/revenue/monthly?year=${currentYear}&month=${currentMonth}`, key: 'monthly_revenue' },
          { url: `/insights/revenue/yearly?year=${currentYear}`, key: 'yearly_revenue' },
          { url: '/insights/subscriptions/basic', key: 'basic_subscriptions' },
          { url: '/insights/subscriptions/pro', key: 'pro_subscriptions' },
          { url: '/insights/users/on_trial', key: 'users_on_trial' },
          { url: '/finance/balance', key: 'balance' },
          { url: '/finance/invoices', key: 'invoices' },
          { url: '/finance/subscriptions', key: 'subscriptions' },
          { url: '/finance/customers', key: 'customers' },
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const { data, error } = await authFetch(endpoint.url, { method: 'GET', accessToken });
            if (error) {
              toast.error(`Failed to fetch ${endpoint.url}: ${error.message}`);
              return { key: endpoint.key, data: null };
            }
            return { key: endpoint.key, data: data };
          })
        );

        const combinedInsights: FinanceInsightsData = {};
        results.forEach(result => {
          if (result.data !== null) {
            if (result.key === 'balance') {
                combinedInsights[result.key] = result.data;
            } else if (Array.isArray(result.data)) {
                combinedInsights[result.key as keyof FinanceInsightsData] = result.data;
            } else if (typeof result.data === 'object' && result.data !== null) {
                Object.assign(combinedInsights, result.data);
            }
          }
        });

        setInsights(combinedInsights);
        setHasFetched(true);
      } catch (error) {
        console.error('Error fetching finance insights:', error);
        toast.error('Failed to fetch finance insights.');
      } finally {
        setDataLoading(false);
      }
    };

    if (accessToken && mergedUser?.role === 'admin' && !hasFetched) {
      fetchFinanceInsights();
    }
  }, [accessToken, mergedUser, hasFetched]);

  if (loading || !mergedUser || mergedUser.role !== 'admin') {
    return (
      <div className="container py-4">
        <p>Loading or unauthorized access...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-2xl font-bold mb-4">Admin Finance Dashboard</h1>
      {dataLoading ? (
        <p>Loading finance insights...</p>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${insights.total_revenue?.toFixed(2) ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${insights.monthly_revenue?.toFixed(2) ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${insights.yearly_revenue?.toFixed(2) ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Basic Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.basic_subscriptions ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pro Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.pro_subscriptions ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users on Trial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.users_on_trial ?? 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stripe Balance (Available)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.balance?.available?.[0] ? 
                    `${(insights.balance.available[0].amount / 100).toFixed(2)} ${insights.balance.available[0].currency.toUpperCase()}` 
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stripe Balance (Pending)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.balance?.pending?.[0] ? 
                    `${(insights.balance.pending[0].amount / 100).toFixed(2)} ${insights.balance.pending[0].currency.toUpperCase()}` 
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Lists */}
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList>
              <TabsTrigger value="invoices">Invoices ({insights.invoices?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions ({insights.subscriptions?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="customers">Customers ({insights.customers?.length ?? 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              <Card>
                <CardHeader><CardTitle>Invoices List</CardTitle></CardHeader>
                <CardContent>
                  {insights.invoices && insights.invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>PDF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {insights.invoices.map((invoice) => (
                            <TableRow key={invoice.invoice_id}>
                              <TableCell className="font-mono text-xs">{invoice.invoice_id.slice(0, 8)}...</TableCell>
                              <TableCell>{getCustomerEmail(invoice.user_id)}</TableCell>
                              <TableCell>{(invoice.amount_due / 100).toFixed(2)} {invoice.currency.toUpperCase()}</TableCell>
                              <TableCell>{invoice.status}</TableCell>
                              <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {invoice.pdf_url && (
                                  <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Link
                                  </a>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p>No invoices found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader><CardTitle>Subscriptions List</CardTitle></CardHeader>
                <CardContent>
                  {insights.subscriptions && insights.subscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subscription ID</TableHead>
                            <TableHead>Customer Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {insights.subscriptions.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-mono text-xs">{sub.id.slice(0, 8)}...</TableCell>
                              <TableCell>{getCustomerEmail(sub.user_id)}</TableCell>
                              <TableCell>{sub.plan_name}</TableCell>
                              <TableCell>{sub.status}</TableCell>
                              <TableCell>{new Date(sub.current_period_start).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(sub.current_period_end).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p>No subscriptions found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="customers">
              <Card>
                <CardHeader><CardTitle>Customers List</CardTitle></CardHeader>
                <CardContent>
                  {insights.customers && insights.customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Stripe Customer ID</TableHead>
                            <TableHead>Current Plan</TableHead>
                            <TableHead>Subscription Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {insights.customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-mono text-xs">{customer.id.slice(0, 8)}...</TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell>{customer.name ?? 'N/A'}</TableCell>
                              <TableCell className="font-mono text-xs">{customer.stripe_customer_id?.slice(0, 8) ?? 'N/A'}...</TableCell>
                              <TableCell>{customer.tier ?? 'N/A'}</TableCell>
                              <TableCell>{customer.subscription_status ?? 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p>No customers found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}