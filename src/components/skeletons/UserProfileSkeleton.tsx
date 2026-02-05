import { Skeleton } from "@/components/ui/skeleton";

export const UserProfileSkeleton = () => {
  return (
    <div className=" animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-12 max-w-lg mx-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Avatar & Info */}
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          
          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>

          {/* Follow Button */}
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ animationDelay: `${i * 50}ms` }}>
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
