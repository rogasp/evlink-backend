// src/components/profile/UserInfoCardSkeleton.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserInfoCardSkeleton() {
  return (
    <Card className="mb-6">
  <CardContent className="flex items-center gap-4 py-6">
    {/* Avatar */}
    <Skeleton className="h-14 w-14 rounded-full" />

    {/* Huvudinfo + inställningar */}
    <div className="flex-1 space-y-3">
      <Skeleton className="h-6 w-32" /> {/* Name */}
      <Skeleton className="h-4 w-40" /> {/* Email */}
      <Skeleton className="h-4 w-24" /> {/* Tier/Role */}
      <Skeleton className="h-4 w-24" /> {/* SMS Credits */}

      <div className="flex flex-col gap-2 pt-2">
        <Skeleton className="h-5 w-40" /> {/* Notify Offline */}
        <Skeleton className="h-5 w-40" /> {/* Newsletter (isSubscribed) */}
      </div>
    </div>
  </CardContent>
</Card>

  )
}
