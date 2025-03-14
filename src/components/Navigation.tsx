
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Menu } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = () => {
    toast({
      title: "Authentication",
      description: "Login functionality will be implemented soon!",
    });
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Lost Items', path: '/lost-items' },
    { name: 'Found Items', path: '/found-items' },
    { name: 'Report Item', path: '/report' },
    { name: 'Community', path: '/community' },
  ];

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
            <span className="hidden font-bold sm:inline-block text-xl">FindersNexus</span>
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
          
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => toast({
              title: "Notifications",
              description: "Notification system coming soon!",
            })}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

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
              <DropdownMenuItem onClick={handleLogin}>Login</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogin}>Register</DropdownMenuItem>
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
        </div>
      )}
    </nav>
  );
};

export default Navigation;
