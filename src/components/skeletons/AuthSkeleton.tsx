import { Skeleton } from "@/components/ui/skeleton";

export const AuthSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-xl" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Form */}
        <div className="space-y-4 bg-card p-6 rounded-2xl">
          {/* Email input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-11 w-full rounded-lg" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-px flex-1" />
          </div>

          {/* Social buttons */}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* Footer link */}
        <div className="flex justify-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
