import { useState, useCallback, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  delta: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeConfig): [SwipeHandlers, SwipeState] => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    delta: 0,
  });

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setSwipeState({ isSwiping: false, direction: null, delta: 0 });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    setTouchEnd({ x: currentX, y: currentY });
    
    const deltaX = touchStart.x - currentX;
    const deltaY = touchStart.y - currentY;
    
    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeState({
        isSwiping: Math.abs(deltaX) > 10,
        direction: deltaX > 0 ? 'left' : 'right',
        delta: deltaX,
      });
    } else {
      setSwipeState({
        isSwiping: Math.abs(deltaY) > 10,
        direction: deltaY > 0 ? 'up' : 'down',
        delta: deltaY,
      });
    }
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setSwipeState({ isSwiping: false, direction: null, delta: 0 });
      return;
    }

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontal) {
      if (deltaX > threshold && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX < -threshold && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (deltaY > threshold && onSwipeUp) {
        onSwipeUp();
      } else if (deltaY < -threshold && onSwipeDown) {
        onSwipeDown();
      }
    }

    setSwipeState({ isSwiping: false, direction: null, delta: 0 });
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return [{ onTouchStart, onTouchMove, onTouchEnd }, swipeState];
};
