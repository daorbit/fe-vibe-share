/**
 * Haptic feedback hook using the Vibration API
 * Provides tactile feedback on supported mobile devices
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const vibrationPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 30, 50],
};

export const useHaptic = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = (type: HapticType = 'light') => {
    if (!isSupported) return;
    
    try {
      navigator.vibrate(vibrationPatterns[type]);
    } catch (e) {
      // Silently fail if vibration is not allowed
    }
  };

  return { trigger, isSupported };
};

// Standalone function for use outside React components
export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(vibrationPatterns[type]);
    } catch (e) {
      // Silently fail
    }
  }
};
