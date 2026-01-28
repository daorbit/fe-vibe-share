import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initAuth } from "@/store/slices/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initAuth());
    }
  }, [dispatch, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        {/* App Shell Skeleton */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;