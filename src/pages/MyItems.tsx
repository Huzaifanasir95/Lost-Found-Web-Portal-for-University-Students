
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, AlertCircle, Filter, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStatusIcon, getStatusText, getStatusColor } from '@/utils/itemUtils';

// Mock data for the user's items
const mockLostItems = [
  {
    id: "1",
    title: "MacBook Pro 16-inch",
    description: "Space Gray MacBook Pro with stickers on the lid. Lost in the university library.",
    location: "University Library, 2nd Floor",
    date: "Oct 12, 2023",
    category: "Electronics",
    isAnonymous: false,
    status: "pending" as const,
    claimCount: 2
  },
  {
    id: "2",
    title: "Blue Water Bottle",
    description: "Metal blue water bottle with university logo.",
    location: "Gymnasium",
    date: "Oct 15, 2023",
    category: "Personal Items",
    isAnonymous: true,
    status: "resolved" as const,
    claimCount: 1
  },
  {
    id: "3",
    title: "Student ID Card",
    description: "University ID card with name and student number.",
    location: "Cafeteria",
    date: "Oct 18, 2023",
    category: "Documents",
    isAnonymous: false,
    status: "rejected" as const,
    claimCount: 0
  }
];

const mockFoundItems = [
  {
    id: "4",
    title: "Black Leather Wallet",
    description: "Found a black leather wallet near the front entrance of the Business building.",
    location: "Business Building Entrance",
    date: "Oct 20, 2023",
    category: "Personal Items",
    isAnonymous: false,
    status: "claimed" as const,
    claimCount: 3
  },
  {
    id: "5",
    title: "Textbook: Introduction to Computer Science",
    description: "Found a CS textbook in Room 101. Has some highlighting and notes inside.",
    location: "Room 101, Computer Science Building",
    date: "Oct 21, 2023",
    category: "Books",
    isAnonymous: true,
    status: "pending" as const,
    claimCount: 0
  }
];

const mockClaims = [
  {
    id: "claim1",
    itemId: "4",
    itemTitle: "Black Leather Wallet",
    dateSubmitted: "Oct 20, 2023",
    status: "pending" as const,
    description: "I lost my wallet yesterday. It has my student ID and credit cards inside."
  },
  {
    id: "claim2",
    itemId: "2",
    itemTitle: "Blue Water Bottle",
    dateSubmitted: "Oct 16, 2023",
    status: "approved" as const,
    description: "This is my water bottle. It has a dent on the bottom and my initials (JD) scratched on the cap."
  },
  {
    id: "claim3",
    itemId: "3",
    itemTitle: "Student ID Card",
    dateSubmitted: "Oct 19, 2023",
    status: "rejected" as const,
    description: "I believe this is my ID card. I lost it in the cafeteria yesterday."
  }
];

const MyItems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lost');
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your items.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleWithdrawItem = (itemId: string, itemType: 'lost' | 'found') => {
    toast({
      title: "Item Withdrawn",
      description: `Your ${itemType} item report has been successfully withdrawn.`,
    });
    // In a real app, this would call an API to update the item status
  };

  const handleCancelClaim = (claimId: string) => {
    toast({
      title: "Claim Cancelled",
      description: "Your claim has been successfully cancelled.",
    });
    // In a real app, this would call an API to cancel the claim
  };

  const filteredLostItems = mockLostItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFoundItems = mockFoundItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = mockClaims.filter(claim => 
    claim.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            />
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <Tabs defaultValue="lost" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
            <TabsTrigger value="claims">My Claims</TabsTrigger>
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
                <ScrollArea className="h-[500px] pr-4">
                  {filteredLostItems.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLostItems.map((item) => (
                        <div 
                          key={item.id} 
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
                              {item.claimCount > 0 && (
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                  {item.claimCount} {item.claimCount === 1 ? 'Claim' : 'Claims'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {item.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewItem(item.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            
                            {item.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleWithdrawItem(item.id, 'lost')}
                              >
                                Withdraw Report
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No lost items found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? `No results for "${searchTerm}"` : "You haven't reported any lost items yet"}
                      </p>
                      <Button onClick={() => navigate('/report')}>
                        Report Lost Item
                      </Button>
                    </div>
                  )}
                </ScrollArea>
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
                <ScrollArea className="h-[500px] pr-4">
                  {filteredFoundItems.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFoundItems.map((item) => (
                        <div 
                          key={item.id} 
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
                              {item.claimCount > 0 && (
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                  {item.claimCount} {item.claimCount === 1 ? 'Claim' : 'Claims'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {item.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewItem(item.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            
                            {item.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleWithdrawItem(item.id, 'found')}
                              >
                                Withdraw Report
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No found items</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? `No results for "${searchTerm}"` : "You haven't reported any found items yet"}
                      </p>
                      <Button onClick={() => navigate('/report')}>
                        Report Found Item
                      </Button>
                    </div>
                  )}
                </ScrollArea>
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
                <ScrollArea className="h-[500px] pr-4">
                  {filteredClaims.length > 0 ? (
                    <div className="space-y-4">
                      {filteredClaims.map((claim) => (
                        <div 
                          key={claim.id} 
                          className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium">{claim.itemTitle}</h3>
                              <p className="text-sm text-muted-foreground">{claim.description}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <p className="text-sm text-muted-foreground">Submitted: {claim.dateSubmitted}</p>
                              <Badge 
                                className={`
                                  ${claim.status === 'pending' ? 'bg-amber-500 text-white' : ''}
                                  ${claim.status === 'approved' ? 'bg-green-500 text-white' : ''}
                                  ${claim.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : ''}
                                `}
                              >
                                {getStatusText(claim.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => handleViewItem(claim.itemId)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Item
                            </Button>
                            
                            {claim.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleCancelClaim(claim.id)}
                              >
                                Cancel Claim
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No claims found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? `No results for "${searchTerm}"` : "You haven't made any claims yet"}
                      </p>
                      <Button onClick={() => navigate('/lost-items')}>
                        Browse Lost Items
                      </Button>
                    </div>
                  )}
                </ScrollArea>
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
