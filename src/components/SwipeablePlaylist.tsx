import { useState, useRef, useEffect, ReactNode } from 'react';
import { useSwipe } from '@/hooks/useSwipe';
import { triggerHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface SwipeablePlaylistProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  enabled?: boolean;
}

const SwipeablePlaylist = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  enabled = true,
}: SwipeablePlaylistProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  
  const [swipeHandlers, swipeState] = useSwipe({
    onSwipeLeft: () => {
      if (enabled && onSwipeLeft) {
        triggerHaptic('light');
        onSwipeLeft();
      }
    },
    onSwipeRight: () => {
      if (enabled && onSwipeRight) {
        triggerHaptic('light');
        onSwipeRight();
      }
    },
    threshold: 80,
  });

  // Update visual feedback during swipe
  useEffect(() => {
    if (!enabled) return;
    
    if (swipeState.isSwiping && (swipeState.direction === 'left' || swipeState.direction === 'right')) {
      // Limit the visual translation
      const maxTranslate = 100;
      const dampening = 0.4;
      const rawTranslate = -swipeState.delta * dampening;
      const clampedTranslate = Math.max(-maxTranslate, Math.min(maxTranslate, rawTranslate));
      setTranslateX(clampedTranslate);
    } else {
      setTranslateX(0);
    }
  }, [swipeState, enabled]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      {...swipeHandlers}
      className={cn("touch-pan-y", className)}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default SwipeablePlaylist;
