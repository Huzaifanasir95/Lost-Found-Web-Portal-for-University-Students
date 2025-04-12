import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios'; // Import axios
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, AlertCircle, Filter, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStatusIcon, getStatusText, getStatusColor, ItemStatus } from '@/utils/itemUtils'; // Import ItemStatus
import { formatDistanceToNow, parseISO } from 'date-fns';
// import api from '@/services/api'; // Removed api service import

// Define interfaces for the data structures
interface Item {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string; 
  category: string;
  isAnonymous: boolean;
  status: ItemStatus; // Use imported ItemStatus
  claimCount?: number; 
  createdAt: string; 
  updatedAt: string; 
  imageUrl?: string;
  type: 'lost' | 'found';
}

// Interface for backend error response
interface ErrorResponse {
  message: string;
}

// Claim interface removed as we fetch claimed ITEMS directly

const MyItems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lost');
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [claimedItems, setClaimedItems] = useState<Item[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your items.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  // Fetch data on component mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const [lostRes, foundRes, claimedRes] = await Promise.all([
          axios.get<Item[]>('/api/users/me/items/lost', config),
          axios.get<Item[]>('/api/users/me/items/found', config),
          axios.get<Item[]>('/api/users/me/items/claimed', config)
        ]);

        // Log the raw response data
        console.log("Raw API Response - Lost:", lostRes.data);
        console.log("Raw API Response - Found:", foundRes.data);
        console.log("Raw API Response - Claimed:", claimedRes.data);

        // Ensure data is an array before setting state
        setLostItems(Array.isArray(lostRes.data) ? lostRes.data : []);
        setFoundItems(Array.isArray(foundRes.data) ? foundRes.data : []);
        setClaimedItems(Array.isArray(claimedRes.data) ? claimedRes.data : []);

      } catch (err) {
        console.error("Error fetching user items:", err);
        let errorMsg = 'Failed to load your items. Please try again later.';

        if (axios.isAxiosError(err)) {
          const serverError = err as AxiosError<ErrorResponse>;
          if (serverError && serverError.response && serverError.response.data && serverError.response.data.message) {
            errorMsg = serverError.response.data.message;
          } else if (err.message) {
             errorMsg = err.message
          }
        } else if (err instanceof Error) {
          errorMsg = err.message; 
        }
        
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, toast]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleWithdrawItem = async (itemId: string, itemType: 'lost' | 'found') => {
     // TODO: Implement backend API call to withdraw/delete item
     // Example: await api.delete(`/api/items/${itemId}`);
     // Then refetch or update local state
    console.log("Withdraw item:", itemId, itemType); 
    toast({
      title: "Action Not Implemented",
      description: `Withdrawing ${itemType} items is not yet fully implemented.`,
      variant: "default"
    });
     // Example state update after successful API call:
    // if (itemType === 'lost') {
    //   setLostItems(prev => prev.filter(item => item._id !== itemId));
    // } else {
    //   setFoundItems(prev => prev.filter(item => item._id !== itemId));
    // }
  };

  const handleCancelClaim = async (itemId: string) => {
    // TODO: Implement backend API call to cancel claim on an item
    // This might involve a new endpoint like POST /api/items/:id/claims/cancel
    console.log("Cancel claim for item:", itemId);
    toast({
      title: "Action Not Implemented",
      description: "Cancelling claims is not yet fully implemented.",
      variant: "default"
    });
    // Example state update after successful API call:
    // setClaimedItems(prev => prev.filter(item => item._id !== itemId));
  };

  // Filtering logic using fetched data
  const filteredLostItems = lostItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFoundItems = foundItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Claims tab shows ITEMS the user has claimed
  const filteredClaims = claimedItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) // Search within the item details
  );
  
  const renderItemList = (items: Item[], itemType: 'lost' | 'found') => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    if (error && items.length === 0) { // Show error only if loading failed AND we have no items of this type
      return <div className="text-center text-destructive p-4">{error}</div>;
    }
    if (items.length === 0) {
      return <div className="text-center text-muted-foreground p-4">You haven't reported any {itemType} items yet.</div>;
    }
    
    return (
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between mb-2">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    {item.title}
                    {item.isAnonymous && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Anonymous</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
                <div className="sm:text-right mt-2 sm:mt-0 flex sm:block items-center gap-2">
                  <Badge className={getStatusColor(item.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {getStatusText(item.status)}
                    </span>
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                   {/* Format date */}
                   {formatDistanceToNow(parseISO(item.date), { addSuffix: true })} (Reported) 
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewItem(item._id)}>
                  <Eye className="h-4 w-4 mr-1" /> View Details
                </Button>
                 {/* Allow withdraw only if item is available/pending/claimed (not resolved) */}
                {(item.status === 'available' || item.status === 'pending' || item.status === 'claimed') && (
                    <Button variant="destructive" size="sm" onClick={() => handleWithdrawItem(item._id, item.type)}>
                      Withdraw Report
                    </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderClaimedItemsList = (items: Item[]) => {
     if (isLoading) {
      return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    if (error && items.length === 0) { // Show error only if loading failed AND we have no items of this type
       return <div className="text-center text-destructive p-4">{error}</div>;
    }
    if (items.length === 0) {
      return <div className="text-center text-muted-foreground p-4">You haven't claimed any items yet.</div>;
    }
    
    return (
       <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id} // Use item ID as key since we're displaying claimed items
              className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between mb-2">
                 <div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
                <div className="sm:text-right mt-2 sm:mt-0">
                   {/* Show item status directly */}
                   <Badge className={getStatusColor(item.status)}>
                     <span className="flex items-center gap-1">
                       {getStatusIcon(item.status)}
                       {getStatusText(item.status)} {/* This will show 'Resolved', 'Claimed', etc. */}
                     </span>
                   </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Found/Lost on: {formatDistanceToNow(parseISO(item.date), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                  </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewItem(item._id)}>
                   <Eye className="h-4 w-4 mr-1" /> View Item
                </Button>
                 {/* Allow cancelling claim only if the item is still in 'claimed' state */}
                 {item.status === 'claimed' && (
                   <Button variant="destructive" size="sm" onClick={() => handleCancelClaim(item._id)}>
                      Cancel Claim
                    </Button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">My Items</h1>
          <p className="text-muted-foreground">
            Manage your lost and found items and claims
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading} // Disable search while loading
            />
          </div>

          {/* Filter button - functionality not implemented in this step */}
          {/* <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button> */}
        </div>

        <Tabs defaultValue="lost" className="mb-8" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="lost" disabled={isLoading}>Lost Items</TabsTrigger>
            <TabsTrigger value="found" disabled={isLoading}>Found Items</TabsTrigger>
            <TabsTrigger value="claims" disabled={isLoading}>My Claims</TabsTrigger>
          </TabsList>

          {/* Lost Items Tab */}
          <TabsContent value="lost">
            <Card>
              <CardHeader>
                <CardTitle>Lost Items</CardTitle>
                <CardDescription>
                  Items you've reported as lost
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderItemList(filteredLostItems, 'lost')}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Found Items Tab */}
          <TabsContent value="found">
            <Card>
              <CardHeader>
                <CardTitle>Found Items</CardTitle>
                <CardDescription>
                  Items you've reported as found
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {renderItemList(filteredFoundItems, 'found')}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>My Claims</CardTitle>
                <CardDescription>
                  Items you've submitted claims for
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {renderClaimedItemsList(filteredClaims)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyItems;
