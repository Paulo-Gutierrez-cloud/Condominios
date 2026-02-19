import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-1">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-7 w-20 mt-2" />
                        <Skeleton className="h-3 w-28 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    )
}
