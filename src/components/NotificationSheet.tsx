import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationsAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import { cn } from '@/lib/utils';
import NotificationSkeleton from './skeletons/NotificationSkeleton';

interface Notification {
  _id: string;
  type: 'playlist_like' | 'playlist_save';
  actorId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  playlistId: {
    _id: string;
    title: string;
    coverImage?: string;
    coverGradient?: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationSheetProps {
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
  isLoggedIn?: boolean;
  onNotLoggedInClick?: () => void;
}

const NotificationSheet = ({ unreadCount, onUnreadCountChange, isLoggedIn = true, onNotLoggedInClick }: NotificationSheetProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsAPI.getNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
      onUnreadCountChange(data.unreadCount || 0);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      const isAuthError = error?.message?.includes('401') || error?.message?.includes('Invalid token');
      setError(isAuthError ? 'Session expired. Please log in again.' : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      setOpen(false);
      navigate(`/playlist/${notification.playlistId._id}`);
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'playlist_like':
        return 'liked your playlist';
      case 'playlist_save':
        return 'saved your playlist';
      default:
        return 'interacted with your playlist';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          onClick={(e) => {
            if (!isLoggedIn && onNotLoggedInClick) {
              e.preventDefault();
              onNotLoggedInClick();
            }
          }}
          className="relative flex items-center justify-center p-2.5 rounded-full transition-all duration-200 active:scale-90 hover:bg-foreground/5 flex-shrink-0"
        >
          <Bell 
            className={cn(
              "w-6 h-6 transition-colors duration-200",
              unreadCount > 0 ? "text-primary" : "text-muted-foreground"
            )} 
            strokeWidth={unreadCount > 0 ? 2.5 : 2}
            fill={unreadCount > 0 ? "currentColor" : "none"}
          />
          {unreadCount > 0 && isLoggedIn && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary/80 hover:bg-transparent font-semibold"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          {loading ? (
            <NotificationSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-destructive mb-4 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-muted flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">You'll see notifications here when someone interacts with your playlists</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <UserAvatar
                    avatarUrl={notification.actorId.avatarUrl}
                    size={44}
                  />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm leading-5 break-words">
                      <span className="font-semibold">
                        {notification.actorId.username}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {getNotificationText(notification)}
                      </span>{' '}
                      <span className="font-medium">
                        {notification.playlistId.title}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1.5 font-medium">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSheet;
