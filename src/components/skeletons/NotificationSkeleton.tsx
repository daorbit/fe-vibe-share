import { Skeleton } from "@/components/ui/skeleton";

const NotificationSkeleton = () => {
  return (
    <div className="divide-y">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-3">
          {/* Avatar skeleton */}
          <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
          
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 pt-0.5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
