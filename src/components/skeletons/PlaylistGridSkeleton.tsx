import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistGridSkeletonProps {
  count?: number;
}

export const PlaylistGridSkeleton = ({ count = 4 }: PlaylistGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <Skeleton className="aspect-square rounded-xl mb-2" />
          <Skeleton className="h-3 w-3/4 mb-1" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default PlaylistGridSkeleton;
