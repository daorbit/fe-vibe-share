import { Skeleton } from "@/components/ui/skeleton";

export const PlaylistDetailSkeleton = () => {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-12 max-w-lg mx-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Cover */}
        <div className="flex justify-center mb-6">
          <Skeleton className="w-48 h-48 rounded-2xl" />
        </div>

        {/* Title & Info */}
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mb-8">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        {/* Songs List */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 rounded-xl bg-card"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailSkeleton;
