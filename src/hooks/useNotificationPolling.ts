import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '@/lib/api';

const POLLING_INTERVAL = 60000; // 30 seconds

export const useNotificationPolling = (isAuthenticated: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setUnreadCount(0);
      setError(null);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsAPI.getUnreadCount();
        setUnreadCount(data.unreadCount || 0);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch unread count:', err);
        const isAuthError = err?.message?.includes('401') || err?.message?.includes('Invalid token');
        setError(isAuthError ? 'Session expired' : 'Failed to load notifications');
      }
    };

    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return {
    unreadCount,
    setUnreadCount,
    error,
    clearError: () => setError(null),
  };
};
