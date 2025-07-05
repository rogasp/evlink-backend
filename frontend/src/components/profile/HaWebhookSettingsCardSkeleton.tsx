// src/components/profile/HaWebhookSettingsCardSkeleton.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HaWebhookSettingsCardSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-4 py-6">
        <Skeleton className="h-5 w-32" /> {/* "Home Assistant Webhook" title */}
        <Skeleton className="h-4 w-64" /> {/* Webhook URL label/input */}
        <Skeleton className="h-4 w-64" /> {/* Webhook ID label/input */}
      </CardContent>
    </Card>
  )
}
