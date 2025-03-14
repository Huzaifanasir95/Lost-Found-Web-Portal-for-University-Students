
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Tag, 
  User, 
  MessageCircle, 
  ChevronLeft,
  Share2,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Combined mock data
const mockItems = [
  {
    id: "1",
    title: "MacBook Pro 16-inch",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    location: "University Library, 2nd Floor",
    date: "Oct 12, 2023",
    status: "lost" as const,
    isHighValue: true,
    description: "Space Gray MacBook Pro with stickers on the lid. Last seen in the study area near the windows. The charger was also left behind.",
    reportedBy: "Anonymous",
    contactMethod: "Through platform only",
    identifyingFeatures: "Has a crack on the bottom right corner of the screen and a distinctive Star Wars sticker on the lid."
  },
  {
    id: "2",
    title: "Silver iPhone 13",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1592286927505-1def25115481?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    location: "Science Building, Room 302",
    date: "Oct 23, 2023",
    status: "found" as const,
    isHighValue: true,
    description: "Silver iPhone 13 in a clear case found under a desk in Science Building Room 302 after the Physics 101 lecture.",
    reportedBy: "Campus Security",
    contactMethod: "Visit Campus Security Office (Building C, Room 110)",
    identifyingFeatures: "Clear case with a small crack in the top right corner. Phone is locked with a passcode."
  }
];

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  
  // Find the item that matches the ID
  const item = mockItems.find(item => item.id === id);
  
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleClaimSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "Your claim has been submitted. You will be notified when it's reviewed.",
    });
    setIsClaimDialogOpen(false);
  };
  
  const handleComment = () => {
    if (commentText.trim()) {
      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully.",
      });
      setCommentText("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="flex items-center gap-1 px-2">
            <Link to={item.status === 'lost' ? '/lost-items' : '/found-items'}>
              <ChevronLeft className="h-4 w-4" />
              Back to {item.status === 'lost' ? 'Lost' : 'Found'} Items
            </Link>
          </Button>
        </div>
        
        {/* Item Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Column */}
          <div className="lg:col-span-1">
            <div className="rounded-lg overflow-hidden border border-border bg-card h-[300px] sm:h-[400px] mb-4">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex justify-between gap-2 mb-6">
              <Button variant="outline" onClick={() => toast({
                title: "Share",
                description: "Sharing functionality coming soon!",
              })} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => toast({
                title: "Report",
                description: "Report functionality coming soon!",
              })} className="flex-1">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
            
            {/* Status Card */}
            <div className="p-4 rounded-lg border border-border bg-card mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Item Status</h3>
                <Badge 
                  className={`${item.status === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'} uppercase`}
                >
                  {item.status}
                </Badge>
              </div>
              
              {item.status === 'lost' ? (
                <p className="text-sm text-muted-foreground">
                  This item has been reported as lost and is currently being looked for. If you've found it, please claim below.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This item has been found and is waiting to be claimed. If it's yours, please claim below.
                </p>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Reported By</p>
                    <p className="text-muted-foreground text-sm">{item.reportedBy}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Contact Method</p>
                    <p className="text-muted-foreground text-sm">{item.contactMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.isHighValue && (
                  <Badge className="bg-amber-500 text-white uppercase">
                    High Value
                  </Badge>
                )}
                <Badge variant="outline">{item.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.location}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.date}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.category}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground mb-6">
                {item.description}
              </p>
              
              <h3 className="font-semibold mb-2">Identifying Features</h3>
              <p className="text-muted-foreground">
                {item.identifyingFeatures}
              </p>
            </div>
            
            {/* Claim Button */}
            <div>
              <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full py-6" size="lg">
                    {item.status === 'lost' ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        I've Found This Item
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        This Item Belongs to Me
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {item.status === 'lost' ? "Report Found Item" : "Claim This Item"}
                    </DialogTitle>
                    <DialogDescription>
                      {item.status === 'lost' 
                        ? "Please provide details about how you found this item." 
                        : "Please provide proof that this item belongs to you."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {item.status === 'found' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Describe a unique feature of this item that only the owner would know
                        </label>
                        <Textarea 
                          placeholder="E.g., serial number, distinctive marks, contents..." 
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {item.status === 'lost' 
                          ? "Where and when did you find it?" 
                          : "When and where did you lose it?"}
                      </label>
                      <Textarea 
                        placeholder="Please be as specific as possible..." 
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Contact Information</label>
                      <Input placeholder="Email or phone number" />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleClaimSubmit}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Comments */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    J
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">John Doe</p>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      I think I saw something similar near the vending machines in the Student Center around 3 PM yesterday.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Sarah Smith</p>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      Was there a distinctive sticker or mark that can help identify it?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Add a Comment</h3>
                <Textarea 
                  placeholder="Write your comment here..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleComment}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ItemDetail;
