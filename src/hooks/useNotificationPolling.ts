import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { notificationsAPI } from '@/lib/api';
import { playNotificationSound } from '@/utils/notificationSound';

const POLLING_INTERVAL = 500000; // 90 seconds

export const useNotificationPolling = (isAuthenticated: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousCountRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setUnreadCount(0);
      previousCountRef.current = 0;
      setError(null);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsAPI.getUnreadCount();
        const newCount = data.unreadCount || 0;
        
        // Check if we have new notifications
        if (newCount > previousCountRef.current && previousCountRef.current > 0) {
          const newNotifications = newCount - previousCountRef.current;
          const notificationText = newNotifications === 1 
            ? 'New notification' 
            : `${newNotifications} new notifications`;
          
          message.success({
            content: `🔔 ${notificationText}`,
            duration: 2.5,
            style: {
              marginTop: '70px',
            },
            className: 'custom-notification-message',
          });
          
          playNotificationSound();
        }
        
        previousCountRef.current = newCount;
        setUnreadCount(newCount);
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
