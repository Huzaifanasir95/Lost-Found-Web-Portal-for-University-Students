
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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import UserManagement from '@/components/admin/UserManagement';

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

  // If not authenticated or not an admin, redirect to login
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

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAuthenticated || !isAdmin) return;

      setLoading(true);
      
      try {
        // Fetch claims
        const claimsResponse = await fetch('http://localhost:5000/api/admin/claims', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (claimsResponse.ok) {
          const claimsData = await claimsResponse.json();
          setClaims(claimsData);
        }

        // Fetch high value items
        const highValueResponse = await fetch('http://localhost:5000/api/admin/high-value-items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (highValueResponse.ok) {
          const highValueData = await highValueResponse.json();
          setHighValueItems(highValueData);
        }

        // Fetch stats
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStatsData(statsData);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, isAdmin, toast, token]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleProcessClaim = async (claimId: string, action: 'approve' | 'reject') => {
    setProcessingClaimId(claimId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/claims/${claimId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} claim`);
      }
      
      toast({
        title: action === 'approve' ? "Claim Approved" : "Claim Rejected",
        description: `The claim has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      
      // Remove the claim from the list
      setClaims(claims.filter(claim => claim.id !== claimId));
      
      // Update stats
      setStatsData(prev => ({
        ...prev,
        claimsPending: prev.claimsPending - 1,
        claimsResolved: action === 'approve' ? prev.claimsResolved + 1 : prev.claimsResolved
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
        
        {/* Overview Cards */}
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
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="claims">
          <TabsList className="w-full flex-wrap mb-6">
            <TabsTrigger value="claims" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" />
              Pending Claims
            </TabsTrigger>
            <TabsTrigger value="high-value" className="flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2" />
              High Value Items
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>
          
          {/* Claims Tab */}
          <TabsContent value="claims">
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
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewItem(claim.itemId)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  disabled={processingClaimId === claim.id}
                                  onClick={() => handleProcessClaim(claim.id, 'approve')}
                                >
                                  {processingClaimId === claim.id ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  disabled={processingClaimId === claim.id}
                                  onClick={() => handleProcessClaim(claim.id, 'reject')}
                                >
                                  {processingClaimId === claim.id ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
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
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleProcessClaim(claim.id, 'approve')}
                            >
                              {processingClaimId === claim.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleProcessClaim(claim.id, 'reject')}
                            >
                              {processingClaimId === claim.id ? (
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
          
          {/* High Value Items Tab */}
          <TabsContent value="high-value">
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
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View statistics and trends for the FAST-NUCES Lost and Found system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Items Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Lost Items</p>
                            <p className="text-sm font-medium">{statsData.lostItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.lostItems / statsData.totalItems) * 100 || 0} className="h-2 bg-primary/20" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Found Items</p>
                            <p className="text-sm font-medium">{statsData.foundItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.foundItems / statsData.totalItems) * 100 || 0} className="h-2 bg-primary/20" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Resolved Items</p>
                            <p className="text-sm font-medium">{statsData.resolvedItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.resolvedItems / statsData.totalItems) * 100 || 0} className="h-2 bg-primary/20" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg bg-card/50">
                          <h4 className="text-sm font-medium mb-2">Claim Resolution Rate</h4>
                          <p className="text-3xl font-bold">
                            {statsData.claimsResolved + statsData.claimsPending > 0 
                              ? Math.round((statsData.claimsResolved / (statsData.claimsResolved + statsData.claimsPending)) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statsData.claimsResolved} out of {statsData.claimsResolved + statsData.claimsPending} claims resolved
                          </p>
                        </div>
                        
                        <div className="p-4 border border-border rounded-lg bg-card/50">
                          <h4 className="text-sm font-medium mb-2">Item Recovery Rate</h4>
                          <p className="text-3xl font-bold">
                            {statsData.totalItems > 0 
                              ? Math.round((statsData.resolvedItems / statsData.totalItems) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statsData.resolvedItems} out of {statsData.totalItems} items recovered
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Button size="sm">
                      Generate Detailed Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
