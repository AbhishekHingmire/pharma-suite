import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Period Filter Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-3 md:p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="p-4 md:p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[250px] w-full" />
      </Card>

      {/* Quick Actions & Top Products Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function SalesListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and Filter Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table/Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-2 md:p-3">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-16" />
          </Card>
        ))}
      </div>

      {/* Product Cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Date Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <div className="hidden lg:flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card className="p-4 md:p-6">
        <Skeleton className="h-6 w-64 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 md:p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
