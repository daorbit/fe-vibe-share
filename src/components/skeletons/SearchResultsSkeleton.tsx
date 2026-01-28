import { Skeleton } from "@/components/ui/skeleton";

export const UserResultSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-fade-in">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-28 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

export const PlaylistResultSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-fade-in">
    <Skeleton className="w-16 h-16 rounded-xl" />
    <div className="flex-1">
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

interface SearchResultsSkeletonProps {
  type?: 'users' | 'playlists' | 'mixed';
  count?: number;
}

export const SearchResultsSkeleton = ({ type = 'mixed', count = 4 }: SearchResultsSkeletonProps) => {
  return (
    <div className="space-y-2">
      {type === 'mixed' && (
        <>
          <div className="px-3 py-2">
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`user-${i}`} style={{ animationDelay: `${i * 50}ms` }}>
              <UserResultSkeleton />
            </div>
          ))}
          <div className="px-3 py-2 mt-4">
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`playlist-${i}`} style={{ animationDelay: `${(i + 2) * 50}ms` }}>
              <PlaylistResultSkeleton />
            </div>
          ))}
        </>
      )}
      {type === 'users' && Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 50}ms` }}>
          <UserResultSkeleton />
        </div>
      ))}
      {type === 'playlists' && Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 50}ms` }}>
          <PlaylistResultSkeleton />
        </div>
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;
