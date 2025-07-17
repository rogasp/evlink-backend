'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

type Props = {
  trialEndsAt: string | null | undefined;
};

export default function TrialCard({ trialEndsAt }: Props) {
  const router = useRouter();

  const formattedDate = trialEndsAt ? format(new Date(trialEndsAt), 'yyyy-MM-dd') : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>PRO Trial Active</CardTitle>
        <CardDescription>
          Your PRO trial is active and will end on {formattedDate}. You can manage your subscription at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push('/billing')} className="cursor-pointer">Manage Subscription</Button>
      </CardContent>
    </Card>
  );
}
