import { Skeleton } from "@/components/ui/skeleton";

export const SettingsSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 h-12 max-w-lg mx-auto">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Sound Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            <div>
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
