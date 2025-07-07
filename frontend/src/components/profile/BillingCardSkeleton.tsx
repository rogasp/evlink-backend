// src/components/profile/BillingCardSkeleton.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BillingCardSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-6 py-6">
        {/* Abonnemangsinfo */}
        <div>
          <Skeleton className="h-5 w-32 mb-2" /> {/* "Subscription" title */}
          <Skeleton className="h-4 w-48 mb-1" /> {/* Current plan/tier */}
          <Skeleton className="h-4 w-40" /> {/* Next billing date */}
        </div>
        {/* Fakturor */}
        <div>
          <Skeleton className="h-5 w-28 mb-2" /> {/* "Invoices" title */}
          <Skeleton className="h-4 w-56 mb-1" /> {/* Invoice row 1 */}
          <Skeleton className="h-4 w-56 mb-1" /> {/* Invoice row 2 */}
          <Skeleton className="h-4 w-56 mb-1" /> {/* Invoice row 3 */}
        </div>
      </CardContent>
    </Card>
  )
}
