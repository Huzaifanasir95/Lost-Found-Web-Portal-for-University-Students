import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ThumbsUp, Calendar, Filter, PlusCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';

// Define the structure for a single post based on backend model
interface Post {
  _id: string;
  title: string;
  content: string;
  user: { // Assuming user field is populated by backend
    _id: string;
    name: string;
    // Add other user fields if populated/needed (e.g., avatar)
  };
  likes: string[]; // Array of user IDs
  comments: {
    _id: string;
    text: string;
    user: { // Assuming populated
      _id: string;
      name: string;
    };
    createdAt: string;
  }[];
  resolved: boolean;
  createdAt: string;
  // Add category and location if they are part of the backend model/API response
  category?: string; // Optional for now
  location?: string; // Optional for now
}

const Community = () => {
  const { toast } = useToast();
  const { token, user, isAuthenticated } = useAuth(); // Added isAuthenticated
  const [posts, setPosts] = useState<Post[]>([]); // For 'Recent'
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false); // General loading/error for the active tab
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeTab, setActiveTab] = useState('recent'); 
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Fetch posts based on active tab
  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      setError(null);
      let url = 'http://localhost:5000/api/community';
      const headers: HeadersInit = { 'Accept': 'application/json' };
      let requiresAuth = false;

      if (activeTab === 'recent') {
        url += '?sort=createdAt'; // Assuming default sort is recent
      } else if (activeTab === 'popular') {
        url += '?sort=likes&limit=10'; // Add query params for sorting by likes and limiting
      } else if (activeTab === 'my-posts') {
        if (!isAuthenticated || !token) {
            setError("Please log in to view your posts.");
            setLoading(false);
            setMyPosts([]); // Clear my posts if not logged in
            return;
        }
        url += '?user=me'; // Assuming backend understands ?user=me
        headers['Authorization'] = `Bearer ${token}`;
        requiresAuth = true;
      } else {
          setLoading(false);
          return; // Should not happen
      }

      try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
           if (response.status === 401 && requiresAuth) {
                throw new Error("Authentication failed. Please log in again.");
            } 
            throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data: Post[] = await response.json();
        
        // Update the correct state based on the active tab
        if (activeTab === 'recent') setPosts(data);
        else if (activeTab === 'popular') setPopularPosts(data);
        else if (activeTab === 'my-posts') setMyPosts(data);

      } catch (err) {
        console.error(`Error fetching ${activeTab} posts:`, err);
        const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMsg);
        toast({ title: "Error", description: `Could not load ${activeTab} posts.`, variant: "destructive" });
        // Clear state for the failed tab
        if (activeTab === 'recent') setPosts([]);
        else if (activeTab === 'popular') setPopularPosts([]);
        else if (activeTab === 'my-posts') setMyPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, token, isAuthenticated, toast]); // Re-fetch when tab or auth changes

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({ title: "Missing Information", description: "Please enter both title and content.", variant: "destructive" });
      return;
    }
    if (!token) {
        toast({ title: "Authentication Error", description: "You must be logged in to post.", variant: "destructive" });
        return;
    }

    setIsSubmittingPost(true);
    try {
      const response = await fetch('http://localhost:5000/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json',
        },
        body: JSON.stringify({ title: newPostTitle, content: newPostContent }),
      });

      if (!response.ok) {
         let errorMsg = 'Failed to create post';
         try {
           const errorData = await response.json();
           errorMsg = errorData.message || (errorData.errors && errorData.errors[0]?.msg) || errorMsg;
         } catch (_) { /* Ignore parsing */ }
         throw new Error(errorMsg);
      }

      toast({ title: "Post Created", description: "Your post has been added successfully." });
      setIsNewPostDialogOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setActiveTab('recent');

    } catch (err) {
      console.error("Error creating post:", err);
      toast({
        title: "Error Creating Post",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Filter posts based on search term and active tab
  const getPostsForCurrentTab = () => {
      let postsToFilter: Post[] = [];
      if (activeTab === 'recent') postsToFilter = posts;
      else if (activeTab === 'popular') postsToFilter = popularPosts;
      else if (activeTab === 'my-posts') postsToFilter = myPosts;

      return postsToFilter.filter(post => 
         post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };
  const displayedPosts = getPostsForCurrentTab();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Get help from the FAST-NUCES community to find your lost items
              </p>
            </div>
            
            <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!user}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Share something with the community. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input 
                      id="title" 
                      value={newPostTitle} 
                      onChange={(e) => setNewPostTitle(e.target.value)} 
                      className="col-span-3" 
                      placeholder="Post title..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Content
                    </Label>
                    <Textarea 
                      id="content" 
                      value={newPostContent} 
                      onChange={(e) => setNewPostContent(e.target.value)} 
                      className="col-span-3" 
                      placeholder="Share details..."
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreatePost} disabled={isSubmittingPost || !newPostTitle.trim() || !newPostContent.trim()}>
                    {isSubmittingPost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Create Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search community posts..." 
                      className="flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="ghost" size="icon">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Filter className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="space-y-4 mt-2">
                  {loading ? (
                     <div className="text-center py-10">Loading posts...</div>
                  ) : error ? (
                     <div className="text-center py-10 text-red-500">Error: {error}</div>
                  ) : displayedPosts.length > 0 ? (
                    displayedPosts.map((post) => (
                      <CommunityPost key={`${activeTab}-${post._id}`} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        {activeTab === 'my-posts' && !isAuthenticated ? 'Please log in to see your posts.' : 'No posts found.'}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Be Specific</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide clear details about lost items including location, time, and description.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Protect Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      Don't share personal information publicly. Use the platform's messaging system.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Be Helpful</h4>
                    <p className="text-sm text-muted-foreground">
                      If you have information that might help, share it even if you don't have the item.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Lost Item Hotspots</CardTitle>
                  <CardDescription>Common places where items are lost at FAST-NUCES</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { location: "CS Labs (A-Block)", count: 45 },
                    { location: "Cafeteria", count: 38 },
                    { location: "Library", count: 32 },
                    { location: "Sports Complex", count: 24 },
                    { location: "Lecture Halls", count: 22 }
                  ].map((hotspot, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{hotspot.location}</span>
                      </div>
                      <Badge variant="outline">{hotspot.count}</Badge>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Based on reports from the past 30 days
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Update CommunityPostProps to include update functions? For now, manage like state locally.
interface CommunityPostProps {
  post: Post;
  // Add props for updating parent state later if needed
}

const CommunityPost = ({ post }: CommunityPostProps) => {
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id || '') || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Update local state if props change (e.g., parent re-fetches)
  useEffect(() => {
    setIsLiked(post.likes?.includes(user?.id || '') || false);
    setLikeCount(post.likes?.length || 0);
  }, [post.likes, user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Example formatting, adjust as needed
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated || !token || !user) {
      toast({ title: "Login Required", description: "Please log in to like posts.", variant: "destructive" });
      return;
    }
    if (isLiking) return; // Prevent double clicks

    setIsLiking(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;

    // Optimistic update
    setIsLiked(!originalLiked);
    setLikeCount(originalLiked ? originalCount - 1 : originalCount + 1);

    try {
      const method = originalLiked ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:5000/api/community/${post._id}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
          // Revert optimistic update on failure
          setIsLiked(originalLiked);
          setLikeCount(originalCount);
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${originalLiked ? 'unlike' : 'like'} post`);
      }

      // Optional: Fetch updated like count from response if backend sends it
      // const updatedLikes = await response.json(); 
      // setLikeCount(updatedLikes.length); 

    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update on error
      setIsLiked(originalLiked);
      setLikeCount(originalCount);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleViewDetails = () => {
    // Navigate to a dedicated post detail page (implement this page later)
    navigate(`/community/${post._id}`); 
    // toast({ description: "Post detail page coming soon!" });
  };
  
  return (
    <Card className="hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
               {/* Assuming user.name exists. Add fallback/image logic if needed */}
              <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              {/* <AvatarImage src={post.user.avatar} /> */}
            </Avatar>
            <div>
              <div className="font-medium">{post.user?.name || 'Anonymous'}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          
          <Badge variant={post.resolved ? "default" : "outline"}>
            {post.resolved ? "Resolved" : "Open"}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p> {/* Added whitespace-pre-wrap */}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Render category/location if available */}
          {post.category && <Badge variant="secondary">{post.category}</Badge>}
          {post.location && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" />
              {post.location}
            </div>
          )}
        </div>
        
        <div className="flex justify-start items-center pt-4 border-t border-border/50">
          {/* Like Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleLike} 
            disabled={isLiking || !isAuthenticated}
            className={isLiked ? 'text-primary' : 'text-muted-foreground'}
           >
            {isLiking ? (
               <Loader2 className="mr-1 h-4 w-4 animate-spin" /> 
            ) : (
              <ThumbsUp className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            )}
            {likeCount}
          </Button>
          
          {/* Comment Button REMOVED */}
          {/* <Button variant="ghost" size="sm" onClick={handleViewDetails}> ... </Button> */}
          
          {/* View Details Button REMOVED */}
          {/* <Button variant="outline" size="sm" onClick={handleViewDetails}>View Details</Button> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default Community;
