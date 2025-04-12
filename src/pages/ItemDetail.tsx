import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

interface Item {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  location: string;
  createdAt: string;
  type: 'lost' | 'found';
  status: 'pending' | 'claimed' | 'resolved' | 'rejected';
  isHighValue: boolean;
  contactMethod?: string;
  user?: {
    name: string;
    _id: string;
  };
  identifyingFeatures?: string;
}

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user?: {
    name: string;
    _id: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchItemDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/items/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }
        
        const data = await response.json();
        setItem(data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetail();
  }, [id]);
  
  const handleClaimSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim this item.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    const claimData = {
      description: formData.get('description'),
      contactInfo: formData.get('contactInfo'),
      proofDetails: formData.get('proofDetails')
    };
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(claimData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit claim');
      }
      
      const updatedItem = await response.json();
      setItem(updatedItem);
      
      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted. You will be notified when it's reviewed by an admin.",
      });
      setIsClaimDialogOpen(false);
    } catch (err: any) {
      console.error('Error submitting claim:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleComment = async () => {
    if (!commentText.trim() || !id) return;
    
    if (!isAuthenticated || !token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a comment.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: commentText
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const newComment = await response.json();
      setComments([...comments, newComment]);
      setCommentText("");
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (err) {
      console.error('Error posting comment:', err);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  const isOwner = () => {
    if (!isAuthenticated || !user || !item || !item.user) return false;
    return user.id === item.user._id;
  };

  const canClaim = () => {
    if (!item) return false;
    if (isOwner()) return false;
    return item.status === 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold">Loading item details...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || "The item you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="flex items-center gap-1 px-2">
            <Link to={item.type === 'lost' ? '/lost-items' : '/found-items'}>
              <ChevronLeft className="h-4 w-4" />
              Back to {item.type === 'lost' ? 'Lost' : 'Found'} Items
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-lg overflow-hidden border border-border bg-card h-[300px] sm:h-[400px] mb-4">
              <img 
                src={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '/placeholder.svg'} 
                alt={item.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
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
            
            <div className="p-4 rounded-lg border border-border bg-card mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Item Status</h3>
                <Badge 
                  className={`
                    ${item.type === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'} 
                    ${item.status === 'claimed' ? 'bg-amber-500 text-white' : ''}
                    ${item.status === 'resolved' ? 'bg-green-600 text-white' : ''}
                    ${item.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : ''}
                    uppercase
                  `}
                >
                  {item.status === 'pending' ? item.type : item.status}
                </Badge>
              </div>
              
              {item.status === 'pending' && (
                <p className="text-sm text-muted-foreground">
                  {item.type === 'lost' 
                    ? "This item has been reported as lost and is currently being looked for. If you've found it, please claim below."
                    : "This item has been found and is waiting to be claimed. If it's yours, please claim below."}
                </p>
              )}
              
              {item.status === 'claimed' && (
                <p className="text-sm text-muted-foreground">
                  This item has been claimed and is awaiting admin verification. You'll be notified when the status changes.
                </p>
              )}
              
              {item.status === 'resolved' && (
                <p className="text-sm text-muted-foreground">
                  This item has been successfully returned to its {item.type === 'lost' ? 'owner' : 'finder'}.
                </p>
              )}
              
              {item.status === 'rejected' && (
                <p className="text-sm text-muted-foreground">
                  The claim for this item was rejected. The item is still {item.type === 'lost' ? 'lost' : 'waiting to be claimed'}.
                </p>
              )}
            </div>
            
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Reported By</p>
                    <p className="text-muted-foreground text-sm">
                      {item.user?.name || "Anonymous"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Contact Method</p>
                    <p className="text-muted-foreground text-sm">
                      {item.contactMethod || "Through platform only"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.category}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground mb-6">
                {item.description}
              </p>
              
              {item.identifyingFeatures && (
                <>
                  <h3 className="font-semibold mb-2">Identifying Features</h3>
                  <p className="text-muted-foreground">
                    {item.identifyingFeatures}
                  </p>
                </>
              )}
            </div>
            
            {canClaim() && (
              <div>
                <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full py-6" size="lg">
                      {item.type === 'lost' ? (
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
                        {item.type === 'lost' ? "Report Found Item" : "Claim This Item"}
                      </DialogTitle>
                      <DialogDescription>
                        {item.type === 'lost' 
                          ? "Please provide details about how you found this item." 
                          : "Please provide proof that this item belongs to you."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleClaimSubmit}>
                      <div className="space-y-4 py-4">
                        {item.type === 'found' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Describe a unique feature of this item that only the owner would know
                            </label>
                            <Textarea 
                              name="proofDetails"
                              placeholder="E.g., serial number, distinctive marks, contents..." 
                              className="min-h-[100px]"
                              required
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {item.type === 'lost' 
                              ? "Where and when did you find it?" 
                              : "When and where did you lose it?"}
                          </label>
                          <Textarea 
                            name="description"
                            placeholder="Please be as specific as possible..." 
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Contact Information</label>
                          <Input 
                            name="contactInfo"
                            placeholder="Email or phone number" 
                            required
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsClaimDialogOpen(false)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Submit
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            {!canClaim() && item.status !== 'pending' && (
              <div className={`
                p-4 rounded-lg border 
                ${item.status === 'claimed' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : ''}
                ${item.status === 'resolved' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''}
                ${item.status === 'rejected' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''}
                text-center
              `}>
                {item.status === 'claimed' && (
                  <p className="text-amber-700 dark:text-amber-400">
                    This item has been claimed and is awaiting admin verification.
                  </p>
                )}
                {item.status === 'resolved' && (
                  <p className="text-green-700 dark:text-green-400">
                    This item has been successfully returned to its {item.type === 'lost' ? 'owner' : 'finder'}.
                  </p>
                )}
                {item.status === 'rejected' && (
                  <p className="text-red-700 dark:text-red-400">
                    The claim for this item was rejected. If you have further information, please contact the admin.
                  </p>
                )}
              </div>
            )}
            
            {isAuthenticated && isOwner() && item.status === 'pending' && (
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-muted-foreground">
                  You reported this item, so you cannot claim it. 
                  {item.type === 'lost' 
                    ? " Someone will contact you if they find it." 
                    : " Someone will contact you if they lost it."}
                </p>
              </div>
            )}
            
            {!isAuthenticated && item.status === 'pending' && (
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-muted-foreground mb-3">
                  You need to be logged in to claim this item.
                </p>
                <Button asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            )}
            
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{comment.user?.name || 'Anonymous'}</p>
                          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-muted-foreground">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Add a Comment</h3>
                <Textarea 
                  placeholder="Write your comment here..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleComment} 
                    disabled={!commentText.trim() || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Post Comment
                      </>
                    )}
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
