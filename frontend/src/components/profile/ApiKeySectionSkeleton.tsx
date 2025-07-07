// src/components/profile/ApiKeySectionSkeleton.tsx

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ApiKeySectionSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-4 py-6">
        <Skeleton className="h-5 w-32" /> {/* Section title */}
        <Skeleton className="h-4 w-64" /> {/* Api key value */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded" /> {/* Copy button */}
          <Skeleton className="h-8 w-24 rounded" /> {/* Regenerate button */}
        </div>
      </CardContent>
    </Card>
  )
}
