import { Skeleton } from "@/components/ui/skeleton";

interface FeedSkeletonProps {
  count?: number;
}

export const FeedCardSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden mb-4 animate-fade-in">
      {/* User header */}
      <div className="p-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Cover image */}
      <Skeleton className="aspect-square w-full" />
      
      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export const FeedSkeleton = ({ count = 3 }: FeedSkeletonProps) => {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
          <FeedCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
