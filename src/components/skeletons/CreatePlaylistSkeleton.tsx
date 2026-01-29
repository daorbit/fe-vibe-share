import { Skeleton } from "@/components/ui/skeleton";

export const CreatePlaylistSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="w-16 h-8" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Cover */}
        <div className="flex justify-center">
          <Skeleton className="w-40 h-40 rounded-xl" />
        </div>

        {/* Title input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Description input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-10" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>

        {/* Songs section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistSkeleton;
