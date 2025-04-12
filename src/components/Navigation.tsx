import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Menu, LogOut, ShieldCheck, Check, Loader2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Interface for Notification based on backend model
interface Notification {
  _id: string;
  user: string; // User ID
  message: string;
  type: 'item' | 'claim' | 'post' | 'system';
  read: boolean;
  createdAt: string;
  relatedItem?: string; // Item ID
  relatedPost?: string; // Post ID
}

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout, isAdmin, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [processingNotificationId, setProcessingNotificationId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Lost Items', path: '/lost-items' },
    { name: 'Found Items', path: '/found-items' },
    { name: 'Report Item', path: '/report' },
    { name: 'Community', path: '/community' },
  ];

  // Add admin dashboard link for admin users
  if (isAuthenticated && isAdmin) {
    links.push({ name: 'Admin Dashboard', path: '/admin' });
  }

  // Fetch notifications periodically or on demand
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchNotifications = async () => {
      if (!isAuthenticated || !token) {
        setNotifications([]); // Clear notifications if not logged in
        return;
      }
      setLoadingNotifications(true);
      setNotificationError(null);
      try {
        const response = await fetch('http://localhost:5000/api/users/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotificationError(err instanceof Error ? err.message : 'Failed to load');
        // Optionally show a toast, but might be annoying if periodic
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications(); // Fetch on initial load/auth change
    
    // Optional: Fetch periodically (e.g., every 60 seconds)
    intervalId = setInterval(fetchNotifications, 60000); 

    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup interval on unmount
    };
  }, [isAuthenticated, token]);

  const handleMarkRead = async (notificationId: string) => {
    if (!token) return;
    setProcessingNotificationId(notificationId);
    try {
      const response = await fetch(`http://localhost:5000/api/users/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      toast({ description: "Notification marked as read." });

    } catch (err) {
       console.error("Error marking notification read:", err);
       toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Could not update notification',
        variant: "destructive",
      });
    } finally {
       setProcessingNotificationId(null);
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
     // Mark as read optimistically or after navigation
     if (!notification.read) {
         handleMarkRead(notification._id); 
     }
     // Navigate to related item/post if applicable
     if (notification.relatedItem) {
         navigate(`/items/${notification.relatedItem}`);
     } else if (notification.relatedPost) {
         // Assuming you have a route for community post details
         navigate(`/community/${notification.relatedPost}`); 
     }
     setIsPopoverOpen(false); // Close popover after click
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent animate-pulse-slow">
              <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center text-primary font-bold">
                F
              </div>
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">FAST-NUCES L&F</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-accent/10 hover:text-accent'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => toast({
              title: "Search",
              description: "Search functionality coming soon!",
            })}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <ThemeToggle />
          
          {isAuthenticated && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-4 font-medium border-b">Notifications</div>
                <ScrollArea className="h-[300px]">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-muted-foreground">
                       <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </div>
                  ) : notificationError ? (
                    <div className="p-4 text-center text-red-500">{notificationError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No notifications yet.</div>
                  ) : (
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <div 
                           key={notification._id} 
                           className={`flex items-start p-2 rounded-md cursor-pointer hover:bg-accent ${notification.read ? 'opacity-60' : 'font-medium'}`}
                           onClick={() => handleNotificationClick(notification)} 
                        >
                          <div className="flex-grow text-sm pr-2">
                            {notification.message}
                            <div className="text-xs text-muted-foreground pt-1">
                              {new Date(notification.createdAt).toLocaleString()} 
                            </div>
                          </div>
                          {!notification.read && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-7 w-7 shrink-0"
                               onClick={(e) => { e.stopPropagation(); handleMarkRead(notification._id); }}
                               disabled={processingNotificationId === notification._id}
                               title="Mark as read"
                              >
                              {processingNotificationId === notification._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                  <Check className="h-4 w-4" />
                              )}
                             </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                 <div className="p-2 border-t text-center">
                    <Button variant="link" size="sm" onClick={() => { /* TODO: Navigate to all notifications page */ setIsPopoverOpen(false); }}>
                       View All Notifications
                    </Button>
                 </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Auth Section: Dropdown or Login/Register Buttons */}
          {isAuthenticated && user ? (
            // Logged-in: User Dropdown (already correct)
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-items')}>
                  My Items
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Logged-out: Login/Register Buttons
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm"><Link to="/signup">Register</Link></Button> 
            </div>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden p-4 space-y-2 bg-background border-b border-border animate-fade-in">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive(link.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-accent/10 hover:text-accent'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {!isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm"><Link to="/signup">Register</Link></Button> 
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
