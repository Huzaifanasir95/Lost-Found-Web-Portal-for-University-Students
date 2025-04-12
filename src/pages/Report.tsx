import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, MapPin, Calendar, Info, FileCheck, Check, EyeOff, Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';

const Report = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'found' ? 'found' : 'lost';
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Report an Item</h1>
            <p className="text-muted-foreground">
              Report a lost or found item at FAST-NUCES Islamabad campus
            </p>
            
            {!isAuthenticated && (
              <div className="mt-4">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="py-4 text-amber-800">
                    <Info className="h-5 w-5 inline-block mr-2" />
                    <span className="text-sm">
                      Consider <a href="/login" className="text-primary underline">logging in</a> to track your reports and receive updates.
                      You can still report anonymously without logging in.
                    </span>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="lost">I Lost an Item</TabsTrigger>
              <TabsTrigger value="found">I Found an Item</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lost">
              <ReportLostItemForm userId={user?.id} />
            </TabsContent>
            
            <TabsContent value="found">
              <ReportFoundItemForm userId={user?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const ReportLostItemForm = ({ userId }: { userId?: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reportAnonymously, setReportAnonymously] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [contact, setContact] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !category || !description || !location || !dateLost) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', itemName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('date', dateLost);
      formData.append('type', 'lost');
      formData.append('status', 'pending');
      
      if (!reportAnonymously && contact) {
        formData.append('contactMethod', contact);
      }
      
      if (userId) {
        formData.append('user', userId);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      console.log("Submitting form data:", Object.fromEntries(formData));
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        body: formData,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
      
      toast({
        title: "Report Submitted",
        description: "Your lost item report has been submitted successfully!",
      });
      
      navigate(`/items/${data._id}`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Lost Item</CardTitle>
        <CardDescription>
          Provide details about the item you lost at FAST-NUCES Islamabad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">Item Name</label>
              <Input 
                id="item-name" 
                placeholder="e.g. Laptop, ID Card, Wallet" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="documents">ID/Documents</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              placeholder="Provide detailed description of the item (color, brand, identifying marks, etc.)" 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="last-seen" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Last Seen Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Block">A-Block</SelectItem>
                  <SelectItem value="B-Block">B-Block</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="Sports Complex">Sports Complex</SelectItem>
                  <SelectItem value="Outside Campus">Outside Campus</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date-lost" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Lost
              </label>
              <Input 
                type="date" 
                id="date-lost" 
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Image
            </label>
            <div 
              className={`border border-dashed rounded-lg p-8 text-center ${
                selectedImage ? 'border-primary' : 'border-border'
              }`}
              onClick={handleFileButtonClick}
            >
              {selectedImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="h-48 mx-auto object-contain"
                  />
                  <p className="text-sm">{selectedImage.name}</p>
                </div>
              ) : (
                <>
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop an image or click to browse
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleFileButtonClick}>
                {selectedImage ? 'Change Image' : 'Browse Files'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="report-anonymously" 
                checked={reportAnonymously} 
                onCheckedChange={(checked) => setReportAnonymously(checked as boolean)}
              />
              <Label htmlFor="report-anonymously" className="flex items-center cursor-pointer">
                <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                Report Anonymously
              </Label>
            </div>
            
            {!reportAnonymously && (
              <>
                <label htmlFor="contact" className="text-sm font-medium">Contact Information</label>
                <Input 
                  id="contact" 
                  placeholder="Your email or phone number" 
                  required={!reportAnonymously}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </>
            )}
            
            {reportAnonymously && (
              <p className="text-xs text-muted-foreground">
                Your personal information will be hidden. Note that anonymous reports may be harder to follow up on.
              </p>
            )}
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {reportAnonymously 
                ? "Your information will be kept private. Staff members will still be able to assist with your report."
                : "Your contact information will only be shared with verified staff members or the person who found your item."}
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Submit Lost Item Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReportFoundItemForm = ({ userId }: { userId?: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reportAnonymously, setReportAnonymously] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [contact, setContact] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !category || !description || !location || !dateFound) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', itemName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('date', dateFound);
      formData.append('type', 'found');
      formData.append('status', 'pending');
      
      if (!reportAnonymously && contact) {
        formData.append('contactMethod', contact);
      }
      
      if (userId) {
        formData.append('user', userId);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      console.log("Submitting found item form data:", Object.fromEntries(formData));
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        body: formData,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
      
      toast({
        title: "Report Submitted",
        description: "Your found item report has been submitted successfully!",
      });
      
      navigate(`/items/${data._id}`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Found Item</CardTitle>
        <CardDescription>
          Provide details about the item you found at FAST-NUCES Islamabad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">Item Name</label>
              <Input 
                id="item-name" 
                placeholder="e.g. Laptop, ID Card, Wallet" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="documents">ID/Documents</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              placeholder="Provide a general description (avoid including unique identifying details that only the owner would know)"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="found-location" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Found Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Block">A-Block</SelectItem>
                  <SelectItem value="B-Block">B-Block</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="Sports Complex">Sports Complex</SelectItem>
                  <SelectItem value="Outside Campus">Outside Campus</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date-found" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Found
              </label>
              <Input 
                type="date" 
                id="date-found" 
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Image
            </label>
            <div 
              className={`border border-dashed rounded-lg p-8 text-center ${
                selectedImage ? 'border-primary' : 'border-border'
              }`}
              onClick={handleFileButtonClick}
            >
              {selectedImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="h-48 mx-auto object-contain"
                  />
                  <p className="text-sm">{selectedImage.name}</p>
                </div>
              ) : (
                <>
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop an image or click to browse
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleFileButtonClick}>
                {selectedImage ? 'Change Image' : 'Browse Files'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="report-anonymously" 
                checked={reportAnonymously} 
                onCheckedChange={(checked) => setReportAnonymously(checked as boolean)}
              />
              <Label htmlFor="report-anonymously" className="flex items-center cursor-pointer">
                <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                Report Anonymously
              </Label>
            </div>
            
            {!reportAnonymously && (
              <>
                <label htmlFor="contact" className="text-sm font-medium">Contact Information</label>
                <Input 
                  id="contact" 
                  placeholder="Your email or phone number" 
                  required={!reportAnonymously}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </>
            )}
            
            {reportAnonymously && (
              <p className="text-xs text-muted-foreground">
                You'll remain anonymous. The item will be directed to the appropriate lost & found office.
              </p>
            )}
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Please turn in valuable items (electronics, wallets, IDs) to the nearest campus office if possible.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Submit Found Item Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Report;
