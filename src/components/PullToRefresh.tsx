import { ReactNode, forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullToRefreshProps {
  children: ReactNode;
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  shouldTrigger: boolean;
}

const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(
  ({ children, pullDistance, isRefreshing, progress, shouldTrigger }, ref) => {
    const showIndicator = pullDistance > 10 || isRefreshing;

    return (
      <div ref={ref} className="relative min-h-screen">
        {/* Pull indicator */}
        <motion.div
          className="absolute left-0 right-0 flex justify-center pointer-events-none z-50"
          style={{
            top: Math.max(pullDistance - 50, -50),
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: showIndicator ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${
              shouldTrigger || isRefreshing
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground'
            }`}
            animate={{
              scale: shouldTrigger || isRefreshing ? 1.1 : 1,
              rotate: isRefreshing ? 360 : progress * 180,
            }}
            transition={{
              rotate: isRefreshing
                ? { duration: 1, repeat: Infinity, ease: 'linear' }
                : { duration: 0.1 },
              scale: { duration: 0.2 },
            }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Content with pull offset */}
        <motion.div
          animate={{
            y: pullDistance,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }
);

PullToRefresh.displayName = 'PullToRefresh';

export default PullToRefresh;
