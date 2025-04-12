
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Menu, LogOut } from 'lucide-react';
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

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
            <NotificationCenter />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-primary/20"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    {user?.name}
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                    <div className="text-xs text-primary">{isAdmin ? 'Admin' : 'Student'}</div>
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
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleLogin}>FAST Student Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogin}>Staff Login</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
            <Link 
              to="/login"
              className="block px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
