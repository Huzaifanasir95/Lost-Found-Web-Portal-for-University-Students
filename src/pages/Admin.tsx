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
  RefreshCcw,
  FileText,
  History
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
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Import Recharts components
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Bar 
} from 'recharts';

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

// Placeholder interface for Claim History Log (needs backend implementation)
interface ClaimLogEntry {
  _id: string;
  itemId: string;
  itemTitle: string;
  claimantName: string; // Or User ID/Object
  adminName: string; // Or Admin User ID/Object
  action: 'approved' | 'rejected'; // Or more specific status
  timestamp: string;
}

// Interface for Generated Report Metadata
interface GeneratedReport {
  _id: string;
  filename: string;
  type: 'daily' | 'weekly' | 'custom'; // Example types
  generatedAt: string;
  downloadUrl: string; // URL provided by backend to download the file
}

// Define colors for charts
const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE']; // Example: Orange, Teal, Yellow, Blue
const CLAIM_COLORS = ['#FFBB28', '#00C49F']; // Example: Yellow (Pending), Teal (Resolved)

const Admin = () => {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [highValueItems, setHighValueItems] = useState<HighValueItem[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    totalItems: 7, // Example initial data
    lostItems: 3,
    foundItems: 4,
    resolvedItems: 0,
    highValueItems: 0,
    claimsPending: 2,
    claimsResolved: 0 // Assuming backend provides this
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending-claims');
  const [reportFrequency, setReportFrequency] = useState<'daily' | 'weekly' | 'never'>('never');
  const [claimHistory, setClaimHistory] = useState<ClaimLogEntry[]>([]);
  const [loadingClaimHistory, setLoadingClaimHistory] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

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

  useEffect(() => {
    const fetchClaimHistory = async () => {
      if (activeTab === 'claim-history' && isAuthenticated && isAdmin && token) {
        setLoadingClaimHistory(true);
        console.log("Fetching claim history... (placeholder)");
        // Replace with actual API call:
        // const response = await fetch('/api/admin/claim-history', { headers: { 'Authorization': `Bearer ${token}` } });
        // if (response.ok) {
        //   const data = await response.json();
        //   setClaimHistory(data);
        // } else {
        //   toast({ title: "Error", description: "Failed to load claim history.", variant: "destructive" });
        // }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        // Mock data for now:
        setClaimHistory([
          { _id: 'log1', itemId: 'item123', itemTitle: 'Lost Laptop', claimantName: 'John Doe', adminName: 'Admin User', action: 'approved', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { _id: 'log2', itemId: 'item456', itemTitle: 'Found Wallet', claimantName: 'Jane Smith', adminName: 'Admin User', action: 'approved', timestamp: new Date(Date.now() - 172800000).toISOString() },
        ]);
        setLoadingClaimHistory(false);
      }
    };
    fetchClaimHistory();
  }, [activeTab, isAuthenticated, isAdmin, token, toast]);

  useEffect(() => {
    const fetchGeneratedReports = async () => {
      if (activeTab === 'reports' && isAuthenticated && isAdmin && token) {
        setLoadingReports(true);
        console.log("Fetching generated reports... (placeholder)");
        // Replace with actual API call:
        // const response = await fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } });
        // if (response.ok) {
        //   const data = await response.json();
        //   setGeneratedReports(data);
        // } else {
        //   toast({ title: "Error", description: "Failed to load generated reports.", variant: "destructive" });
        // }
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        // Mock data for now:
        setGeneratedReports([
          {
            _id: 'report1',
            filename: 'daily_summary_2025-04-12.pdf',
            type: 'daily',
            generatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            downloadUrl: '/api/admin/reports/download/report1' // Placeholder URL
          },
          {
            _id: 'report2',
            filename: 'weekly_detailed_2025-04-11.csv',
            type: 'weekly',
            generatedAt: new Date(Date.now() - 90000000).toISOString(), // ~25 hours ago
            downloadUrl: '/api/admin/reports/download/report2' // Placeholder URL
          }
        ]);
        setLoadingReports(false);
      }
    };
    fetchGeneratedReports();
  }, [activeTab, isAuthenticated, isAdmin, token, toast]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleProcessClaim = async (itemId: string, newStatus: 'resolved' | 'rejected') => {
    setProcessingClaimId(itemId);
    console.log(`Processing claim for item ${itemId} to status ${newStatus}. Backend should log this.`);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${newStatus} claim`);
      }
      
      toast({
        title: newStatus === 'resolved' ? "Claim Approved" : "Claim Rejected",
        description: `The claim associated with the item has been ${newStatus} successfully.`,
      });
      
      setClaims(prevClaims => prevClaims.filter(claim => claim.itemId !== itemId));
      
      setStatsData(prev => ({
        ...prev,
        claimsPending: prev.claimsPending - 1,
        resolvedItems: newStatus === 'resolved' ? prev.resolvedItems + 1 : prev.resolvedItems
      }));
      
    } catch (err) {
      console.error(`Error ${newStatus}ing claim:`, err);
      toast({
        title: "Error",
        description: `Failed to ${newStatus} the claim. Please try again.`,
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

  // Prepare data for charts
  const itemTypeData = [
    { name: 'Lost Items', value: statsData.lostItems },
    { name: 'Found Items', value: statsData.foundItems },
  ];

  const claimStatusData = [
    { name: 'Pending Claims', count: statsData.claimsPending },
    { name: 'Resolved Claims', count: statsData.claimsResolved + statsData.resolvedItems }, // Combine resolved claims and items for simplicity here
  ];

  // Function to handle report download (simulated)
  const handleDownloadReport = (report: GeneratedReport) => {
    toast({ 
      title: "Download Started (Simulated)",
      description: `Downloading ${report.filename}...`
    });
    console.log(`Attempting to download report from: ${report.downloadUrl}`);
    // In a real implementation, you might use:
    // window.open(report.downloadUrl, '_blank'); 
    // Or fetch the file blob and trigger download via JavaScript
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
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
            <TabsTrigger value="pending-claims"><ListChecks className="mr-2 h-4 w-4"/>Claims</TabsTrigger>
            <TabsTrigger value="item-management"><Package className="mr-2 h-4 w-4"/>Items</TabsTrigger>
            <TabsTrigger value="high-value"><ShieldAlert className="mr-2 h-4 w-4"/>High Value</TabsTrigger>
            <TabsTrigger value="user-management"><Users className="mr-2 h-4 w-4"/>Users</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="mr-2 h-4 w-4"/>Analytics</TabsTrigger>
            <TabsTrigger value="reports"><FileText className="mr-2 h-4 w-4"/>Reports</TabsTrigger>
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
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5"/>Claim & Resolution History</CardTitle>
                <CardDescription>Log of item claims processed by admins.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingClaimHistory ? (
                  <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : claimHistory.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Claimant</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claimHistory.map(log => (
                          <TableRow key={log._id}>
                            <TableCell className="font-medium hover:underline cursor-pointer" onClick={() => handleViewItem(log.itemId)}>{log.itemTitle}</TableCell>
                            <TableCell>{log.claimantName}</TableCell>
                            <TableCell>{log.adminName}</TableCell>
                            <TableCell>
                              <Badge variant={log.action === 'approved' ? 'default' : 'destructive'} className={log.action === 'approved' ? 'bg-green-500' : ''}>
                                {log.action === 'approved' ? 'Approved/Returned' : 'Rejected'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No claim history available.</p>
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

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5"/>System Analytics</CardTitle>
                <CardDescription>Overview of item statistics and trends.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Items Reported</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.totalItems}</div></CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Items Reported Lost</CardTitle>
                       <Package className="h-4 w-4 text-red-500" />
                     </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.lostItems}</div></CardContent>
                  </Card>
                   <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Items Reported Found</CardTitle>
                       <Package className="h-4 w-4 text-green-500" />
                     </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.foundItems}</div></CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Items Resolved/Returned</CardTitle>
                       <CheckCircle className="h-4 w-4 text-blue-500" />
                     </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.resolvedItems}</div></CardContent>
                  </Card>
                   <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                       <Clock className="h-4 w-4 text-amber-500" />
                     </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.claimsPending}</div></CardContent>
                  </Card>
                   <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">High Value Items (Active)</CardTitle>
                       <AlertTriangle className="h-4 w-4 text-orange-500" />
                     </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{statsData.highValueItems}</div></CardContent>
                  </Card>
                </div>

                {/* --- Charts Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Item Type Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Item Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={itemTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {itemTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Claim Status Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Claim Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={claimStatusData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8">
                             {claimStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CLAIM_COLORS[index % CLAIM_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                 
                {/* Placeholder for more complex charts requiring backend data */}
                <div className="mt-6 p-6 border rounded-lg text-center bg-muted/40">
                  <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                  <p className="text-sm text-muted-foreground">More charts (e.g., items over time, category breakdown) require additional backend data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/>Automated Reports</CardTitle>
                <CardDescription>Configure and view automated system status reports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="report-frequency" className="text-sm font-medium">Report Frequency</Label>
                  <Select 
                     value={reportFrequency} 
                     onValueChange={(value: 'daily' | 'weekly' | 'never') => setReportFrequency(value)}
                   >
                    <SelectTrigger id="report-frequency" className="w-[180px] mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Select how often you want to receive status reports.</p>
                </div>
                
                <Button onClick={() => toast({ title: "Configuration Saved", description: `Report frequency set to ${reportFrequency}.` })}>
                  Save Configuration
                </Button>

                <Separator />

                <div>
                  <h4 className="text-md font-medium mb-2">Generated Reports</h4>
                  {loadingReports ? (
                     <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                  ) : generatedReports.length > 0 ? (
                     <div className="border rounded-lg">
                       <Table>
                         <TableHeader>
                           <TableRow>
                             <TableHead>Filename</TableHead>
                             <TableHead>Type</TableHead>
                             <TableHead>Generated At</TableHead>
                             <TableHead className="text-right">Action</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {generatedReports.map((report) => (
                             <TableRow key={report._id}>
                               <TableCell className="font-medium">{report.filename}</TableCell>
                               <TableCell><Badge variant="outline" className="capitalize">{report.type}</Badge></TableCell>
                               <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                               <TableCell className="text-right">
                                 <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)}>
                                   <FileText className="mr-2 h-4 w-4"/>
                                   Download
                                 </Button>
                               </TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                     </div>
                  ) : (
                    <div className="p-6 border rounded-lg text-center bg-muted/40">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2"/>
                      <p className="text-muted-foreground">No generated reports found.</p>
                      <p className="text-xs text-muted-foreground">(Reports will appear here once generated by the backend)</p>
                    </div>
                  )}
                </div>
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
