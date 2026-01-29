import { Skeleton } from "@/components/ui/skeleton";

export const DiscoverSkeleton = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <Skeleton className="h-7 w-28 mb-3" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* User cards */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverSkeleton;
