
import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, PackageX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Item {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  location: string;
  createdAt: string;
  type: 'lost' | 'found';
  isHighValue: boolean;
}

const FoundItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/items?type=found');
        
        if (!response.ok) {
          throw new Error('Failed to fetch found items');
        }
        
        const data = await response.json();
        console.log('Found items data:', data);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching found items:', err);
        setError('Failed to load items. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load found items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [toast]);
  
  // Filter logic
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (category === "all" || item.category === category)
  );
  
  const categories = ["all", ...Array.from(new Set(items.map(item => item.category)))];

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Found Items</h1>
            <p className="text-muted-foreground">Browse items that have been found and reported by the community.</p>
          </div>
          
          <Button asChild>
            <a href="/report?type=found">Report a Found Item</a>
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="p-4 border border-border rounded-lg bg-card space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="gym">Gymnasium</SelectItem>
                      <SelectItem value="academic">Academic Buildings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Date Range</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm">Reset</Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {loading ? 'Loading items...' : `Showing ${filteredItems.length} results`}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <Card key={index} className="h-[350px] animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardHeader className="p-4">
                    <div className="h-5 w-2/3 bg-muted rounded"></div>
                    <div className="h-4 w-1/3 bg-muted rounded mt-2"></div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-destructive">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard 
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  category={item.category}
                  image={`http://localhost:5000${item.imageUrl}`}
                  location={item.location}
                  date={formatDate(item.createdAt)}
                  status="found"
                  isHighValue={item.isHighValue || false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-muted-foreground mb-4">There are no found items matching your criteria</p>
              <Button asChild>
                <a href="/report?type=found">Report a Found Item</a>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoundItems;
