
import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ThumbsUp, Calendar, Filter, PlusCircle, MapPin, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { toast } = useToast();
  
  const handleNewPost = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available soon!",
    });
  };
  
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
            
            <Button onClick={handleNewPost}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search community posts..." 
                      className="flex-1"
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
              
              <Tabs defaultValue="recent">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="recent" className="space-y-4 mt-2">
                  {communityPosts.map((post) => (
                    <CommunityPost key={post.id} post={post} />
                  ))}
                </TabsContent>
                
                <TabsContent value="popular" className="space-y-4 mt-2">
                  <div className="p-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Login to view popular posts</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="my-posts" className="space-y-4 mt-2">
                  <div className="p-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Login to view your posts</p>
                  </div>
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

interface CommunityPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    author: {
      name: string;
      avatar: string;
    };
    category: string;
    location: string;
    timestamp: string;
    comments: number;
    likes: number;
    isResolved: boolean;
  };
}

const CommunityPost = ({ post }: CommunityPostProps) => {
  const { toast } = useToast();
  
  const handleLike = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available soon!",
    });
  };
  
  const handleComment = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available soon!",
    });
  };
  
  return (
    <Card className="hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              <AvatarImage src={post.author.avatar} />
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.timestamp}
              </div>
            </div>
          </div>
          
          <Badge variant={post.isResolved ? "default" : "outline"}>
            {post.isResolved ? "Resolved" : "Open"}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.content}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <MapPin className="h-3 w-3" />
            {post.location}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={handleLike}>
            <ThumbsUp className="mr-1 h-4 w-4" />
            {post.likes}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleComment}>
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments}
          </Button>
          
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock community posts
const communityPosts = [
  {
    id: 1,
    title: "Lost my Casio FX-991ES calculator in CS-5 Lab",
    content: "I was in the CS-5 Lab in A-Block yesterday between 1-3 PM for my Programming Fundamentals lab. I think I left my Casio scientific calculator there. It has my name (Usman) written on the back. If anyone found it, please let me know!",
    author: {
      name: "Usman Ali",
      avatar: ""
    },
    category: "Electronics",
    location: "A-Block, CS-5 Lab",
    timestamp: "Yesterday at 6:45 PM",
    comments: 3,
    likes: 5,
    isResolved: false
  },
  {
    id: 2,
    title: "Found a black backpack in the cafeteria",
    content: "I found a black Adidas backpack in the cafeteria near the drink counter around 1:30 PM today. It has some books and a pencil case inside. I've handed it to the cafeteria staff. The owner can collect it from there.",
    author: {
      name: "Sara Khan",
      avatar: ""
    },
    category: "Bags",
    location: "Cafeteria",
    timestamp: "Today at 2:15 PM",
    comments: 1,
    likes: 8,
    isResolved: true
  },
  {
    id: 3,
    title: "Lost my student ID card near library",
    content: "I lost my FAST-NUCES student ID card (FA-21-BCS-123) somewhere near the library entrance. I need it urgently for tomorrow's exam. Please contact me if you find it!",
    author: {
      name: "Ahmed Raza",
      avatar: ""
    },
    category: "Documents",
    location: "Library",
    timestamp: "Today at 11:20 AM",
    comments: 5,
    likes: 12,
    isResolved: false
  },
  {
    id: 4,
    title: "Left my notes in the B-Block",
    content: "I left my Database Systems notes (green spiral notebook) in Room B-4 after the lecture today. If anyone found it, please let me know. I need it for the upcoming quiz!",
    author: {
      name: "Zainab Fatima",
      avatar: ""
    },
    category: "Books/Notes",
    location: "B-Block, Room B-4",
    timestamp: "Yesterday at 3:30 PM",
    comments: 0,
    likes: 2,
    isResolved: false
  }
];

export default Community;
