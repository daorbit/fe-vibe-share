import { WifiOff } from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { cn } from "@/lib/utils";

const OfflineIndicator = () => {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] py-2 px-4",
        "bg-destructive/95 backdrop-blur-sm text-destructive-foreground",
        "flex items-center justify-center gap-2 text-sm font-medium",
        "animate-slide-down safe-area-top"
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>You're offline</span>
    </div>
  );
};

export default OfflineIndicator;
