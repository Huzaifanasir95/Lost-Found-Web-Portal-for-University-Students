import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ListChecks, 
  ShieldAlert, 
  Users, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import UserManagement from '@/components/admin/UserManagement';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { getStatusIcon, getStatusText, getStatusColor, ItemStatus } from '@/utils/itemUtils';

interface Claim {
  id: string;
  itemId: string;
  itemName: string;
  claimantName: string;
  claimantEmail: string;
  dateSubmitted: string;
  status: string;
  description: string;
  contactInfo: string;
  proofDetails: string;
  itemType: string;
}

interface HighValueItem {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  isHighValue: boolean;
}

interface StatsData {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  highValueItems: number;
  claimsPending: number;
  claimsResolved: number;
}

// Basic interface for claim summary within an item
interface ClaimSummary {
  _id: string;
  status: string;
  // Add other summary fields if needed (e.g., claimantId)
}

// Define Item interface based on Item model (adjust as needed)
interface Item {
  _id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  location: string;
  date: string; // Date reported/found/lost
  status: string; // Example: 'pending', 'claimed', 'resolved', 'rejected'
  user: { // User who reported it
    _id: string;
    name: string;
  };
  // Add other relevant fields like imageURL if available
  imageUrl?: string;
  createdAt?: string;
  claims?: ClaimSummary[]; // Use defined interface instead of any[]
}

const Admin = () => {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [highValueItems, setHighValueItems] = useState<HighValueItem[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    resolvedItems: 0,
    highValueItems: 0,
    claimsPending: 0,
    claimsResolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending-claims');

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  useEffect(() => {
    const fetchCoreAdminData = async () => {
      if (!isAuthenticated || !isAdmin) return;
      setLoading(true);
      try {
        const [claimsRes, highValueRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/items/claims/pending', { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
          fetch('http://localhost:5000/api/admin/high-value-items', { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
          fetch('http://localhost:5000/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
        ]);

        if (claimsRes.ok) setClaims(await claimsRes.json());
        if (highValueRes.ok) setHighValueItems(await highValueRes.json());
        if (statsRes.ok) setStatsData(await statsRes.json());
      } catch (error) {
        console.error('Error fetching core admin data:', error);
        toast({ title: "Error", description: "Failed to load initial admin data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCoreAdminData();
  }, [isAuthenticated, isAdmin, token, toast]);

  useEffect(() => {
    const fetchAllItems = async () => {
      if (activeTab === 'item-management' && isAuthenticated && isAdmin && token) {
        setLoadingItems(true);
        setItemError(null);
        try {
          const response = await fetch('http://localhost:5000/api/items', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json' 
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch items');
          }
          const data: Item[] = await response.json();
          setAllItems(data);
        } catch (err) {
          console.error("Error fetching items:", err);
          setItemError(err instanceof Error ? err.message : 'Could not load items');
        } finally {
          setLoadingItems(false);
        }
      }
    };
    fetchAllItems();
  }, [activeTab, isAuthenticated, isAdmin, token]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleProcessClaim = async (itemId: string, action: 'resolved' | 'rejected') => {
    setProcessingClaimId(itemId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: action })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} claim`);
      }
      
      toast({
        title: action === 'resolved' ? "Claim Approved" : "Claim Rejected",
        description: `The claim associated with the item has been ${action} successfully.`,
      });
      
      setClaims(prevClaims => prevClaims.filter(claim => claim.itemId !== itemId));
      
      setStatsData(prev => ({
        ...prev,
        claimsPending: prev.claimsPending - 1,
        resolvedItems: action === 'resolved' ? prev.resolvedItems + 1 : prev.resolvedItems
      }));
      
    } catch (err) {
      console.error(`Error ${action}ing claim:`, err);
      toast({
        title: "Error",
        description: `Failed to ${action} the claim. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        }
      });

      if (!response.ok) {
        let errorMsg = 'Failed to delete item';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (_) { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }

      toast({ title: "Item Deleted", description: "The item has been successfully deleted." });
      setAllItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({ 
        title: "Error Deleting Item", 
        description: err instanceof Error ? err.message : 'An unknown error occurred', 
        variant: "destructive" 
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: ItemStatus) => {
    setUpdatingStatusItemId(itemId);
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to update item status';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (_) { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }

      const updatedItem: Item = await response.json();

      toast({ title: "Status Updated", description: `Item status set to ${newStatus}.` });
      setAllItems(prevItems => 
        prevItems.map(item => item._id === itemId ? updatedItem : item)
      );

    } catch (err) {
      console.error("Error updating item status:", err);
      toast({ 
        title: "Error Updating Status", 
        description: err instanceof Error ? err.message : 'An unknown error occurred', 
        variant: "destructive" 
      });
    } finally {
      setUpdatingStatusItemId(null);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Redirecting...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading admin data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage lost and found items at FAST-NUCES Islamabad Campus
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-3xl font-bold">{statsData.totalItems}</h3>
              </div>
              <Package className="h-10 w-10 text-primary/70" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Claims</p>
                <h3 className="text-3xl font-bold">{statsData.claimsPending}</h3>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Value Items</p>
                <h3 className="text-3xl font-bold">{statsData.highValueItems}</h3>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Items</p>
                <h3 className="text-3xl font-bold">{statsData.resolvedItems}</h3>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending-claims"><ListChecks className="mr-2 h-4 w-4"/>Pending Claims</TabsTrigger>
            <TabsTrigger value="high-value"><ShieldAlert className="mr-2 h-4 w-4"/>High Value Items</TabsTrigger>
            <TabsTrigger value="user-management"><Users className="mr-2 h-4 w-4"/>User Management</TabsTrigger>
            <TabsTrigger value="item-management"><Package className="mr-2 h-4 w-4"/>Item Management</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-claims" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Claims</CardTitle>
                <CardDescription>
                  Review and process claims for lost and found items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Claimant</TableHead>
                          <TableHead>Item Type</TableHead>
                          <TableHead>Date Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell className="font-medium">{claim.itemName}</TableCell>
                            <TableCell>{claim.claimantName}<br/><span className="text-xs text-muted-foreground">{claim.claimantEmail}</span></TableCell>
                            <TableCell>
                              <Badge
                                className={`${claim.itemType === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white uppercase`}
                              >
                                {claim.itemType}
                              </Badge>
                            </TableCell>
                            <TableCell>{claim.dateSubmitted}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  disabled={processingClaimId === claim.itemId}
                                  onClick={() => handleProcessClaim(claim.itemId, 'resolved')}
                                >
                                  {processingClaimId === claim.itemId ? (
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                  )}
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  disabled={processingClaimId === claim.itemId}
                                  onClick={() => handleProcessClaim(claim.itemId, 'rejected')}
                                >
                                  {processingClaimId === claim.itemId ? (
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="mr-1 h-4 w-4" />
                                  )}
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleViewItem(claim.itemId)}
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View Item
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4">
                      {claims.map((claim) => (
                        <div 
                          key={claim.id}
                          className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors mb-4"
                        >
                          <div className="flex flex-col md:flex-row justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium">{claim.itemName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Claimed by: {claim.claimantName} ({claim.claimantEmail})
                              </p>
                            </div>
                            <div className="md:text-right mt-2 md:mt-0">
                              <p className="text-sm text-muted-foreground">
                                Submitted: {claim.dateSubmitted}
                              </p>
                              <Badge 
                                className={`${claim.itemType === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white uppercase`}
                              >
                                {claim.itemType}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Claim Description:</h4>
                              <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md min-h-[60px]">
                                {claim.description || "No description provided"}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Proof Details:</h4>
                              <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md min-h-[60px]">
                                {claim.proofDetails || "No proof details provided"}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-1">Contact Information:</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                              {claim.contactInfo || "No contact information provided"}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewItem(claim.itemId)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Item
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={processingClaimId === claim.itemId}
                              onClick={() => handleProcessClaim(claim.itemId, 'resolved')}
                            >
                              {processingClaimId === claim.itemId ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={processingClaimId === claim.itemId}
                              onClick={() => handleProcessClaim(claim.itemId, 'rejected')}
                            >
                              {processingClaimId === claim.itemId ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending claims to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="high-value" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>High Value Items</CardTitle>
                <CardDescription>
                  Monitor high-value items that require special attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {highValueItems.length > 0 ? (
                  <div className="space-y-4">
                    {highValueItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-medium">{item.title}</h3>
                          <Badge 
                            className={`${item.status === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'} uppercase`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Location:</span> {item.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Date:</span> {item.date}
                          </p>
                        </div>
                        
                        <Button size="sm" onClick={() => handleViewItem(item.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No high value items to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user-management" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="item-management" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage All Items</CardTitle>
                <CardDescription>View and delete reported lost and found items.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingItems ? (
                  <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : itemError ? (
                  <div className="text-center py-10 text-red-500">Error loading items: {itemError}</div>
                ) : (
                  <ScrollArea className="h-[60vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date Reported</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reported By</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center h-24">No items found.</TableCell>
                          </TableRow>
                        ) : (
                          allItems.map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>{item.type}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'resolved' || item.status === 'claimed' ? 'default' : 'outline'} 
                                       className={getStatusColor(item.status as ItemStatus)}>
                                    {getStatusText(item.status as ItemStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.user?.name || 'System?'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {item.status !== 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      disabled={updatingStatusItemId === item._id || deletingItemId === item._id}
                                      onClick={() => handleUpdateItemStatus(item._id, 'pending')}
                                    >
                                      {updatingStatusItemId === item._id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-1 h-4 w-4"/>}
                                      Re-open
                                    </Button>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        disabled={deletingItemId === item._id || updatingStatusItemId === item._id}
                                      >
                                        {deletingItemId === item._id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4"/>}
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the item 
                                          <span className="font-semibold">"{item.title}"</span> and all associated data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteItem(item._id)} 
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Yes, delete item
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
