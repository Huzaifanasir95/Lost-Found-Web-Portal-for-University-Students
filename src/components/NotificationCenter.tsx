
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Check, Clock, User, MessageSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Types
export interface Notification {
  _id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'claim' | 'comment' | 'alert' | 'system';
  link?: string;
}

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);
  
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // If we're in development, use dummy notification data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dummy notifications
        const dummyNotifications: Notification[] = [
          {
            _id: '1',
            title: 'Your Lost Item Claimed',
            description: 'Someone has claimed your lost laptop',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'claim',
            link: '/items/1'
          },
          {
            _id: '2',
            title: 'Comment on Your Post',
            description: 'Someone commented on your community post',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            type: 'comment',
            link: '/community/1'
          },
          {
            _id: '3',
            title: 'System Notification',
            description: 'Welcome to the FAST-NUCES Lost & Found Portal!',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            type: 'system'
          }
        ];
        
        setNotifications(dummyNotifications);
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/notifications`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    
    try {
      // In development mode, just update local state
      if (process.env.NODE_ENV === 'development') {
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        setNotifications(updatedNotifications);
        
        toast({
          title: "All notifications marked as read",
          description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read.`
        });
        
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/notifications/mark-all-read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        setNotifications(updatedNotifications);
        
        toast({
          title: "All notifications marked as read",
          description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read.`
        });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive"
      });
    }
  };
  
  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    
    try {
      // In development mode, just update local state
      if (process.env.NODE_ENV === 'development') {
        const updatedNotifications = notifications.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        );
        
        setNotifications(updatedNotifications);
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/notifications/${id}/mark-read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        const updatedNotifications = notifications.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        );
        
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const clearAll = async () => {
    if (!user?.id) return;
    
    try {
      // In development mode, just update local state
      if (process.env.NODE_ENV === 'development') {
        setNotifications([]);
        setOpen(false);
        
        toast({
          title: "Notifications cleared",
          description: "All notifications have been removed."
        });
        
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/notifications/clear-all`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications([]);
        setOpen(false);
        
        toast({
          title: "Notifications cleared",
          description: "All notifications have been removed."
        });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear notifications.",
        variant: "destructive"
      });
    }
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'claim':
        return <Package className="h-5 w-5 text-violet-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Format relative time (e.g., "10 minutes ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen(true);
          if (isAuthenticated && user?.id) {
            fetchNotifications();
          }
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="h-8 text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark all as read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  className="h-8 text-xs text-destructive hover:text-destructive"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <Link 
                    key={notification._id}
                    to={notification.link || '#'}
                    onClick={() => {
                      markAsRead(notification._id);
                      setOpen(false);
                    }}
                    className="block"
                  >
                    <div 
                      className={`flex gap-3 p-3 transition-colors rounded-lg hover:bg-accent/50 ${
                        !notification.read ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-1" />
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationCenter;
