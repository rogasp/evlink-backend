'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SubscribeCard() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>No Active Subscription</CardTitle>
        <CardDescription>You do not have an active subscription. Please subscribe to get access to premium features.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push('/billing')} className="cursor-pointer">Manage Subscription</Button>
      </CardContent>
    </Card>
  );
}
