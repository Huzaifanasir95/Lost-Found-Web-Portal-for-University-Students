import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Lock, Bell, Bookmark, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, token, updateUserContext } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for editable name
  const [editableName, setEditableName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [claimNotifications, setClaimNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [matchedItemNotifications, setMatchedItemNotifications] = useState(true);

  // Update editableName if user context changes
  useEffect(() => {
     if (user) {
        setEditableName(user.name);
     }
  }, [user]);

  const handleUpdateNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update notification preferences
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification preferences have been saved."
    });
  };

  // Handler for updating profile (name)
  const handleUpdateProfile = async () => {
    if (!token || !user || editableName === user.name) return;
    
    setIsUpdatingProfile(true);
    try {
        const response = await fetch('http://localhost:5000/api/users/me/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ name: editableName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const updatedUser = await response.json();
        updateUserContext(updatedUser); // Use context function to update user state
        toast({ title: "Profile Updated", description: "Your name has been updated." });

    } catch (err) {
        console.error("Error updating profile:", err);
        toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update profile.", variant: "destructive" });
    } finally {
        setIsUpdatingProfile(false);
    }
  };

  // Handler for changing password
  const handleChangePassword = async () => {
    if (!token) return;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({ description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
        const response = await fetch('http://localhost:5000/api/users/me/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to change password');
        }

        toast({ title: "Password Changed", description: "Your password has been updated successfully." });
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');

    } catch (err) {
        console.error("Error changing password:", err);
        toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to change password.", variant: "destructive" });
    } finally {
        setIsChangingPassword(false);
    }
  };

  if (!user) {
    // navigate('/login'); // Redirect handled by AuthContext/protected route? Re-evaluate if needed.
    return <div className="container py-10 text-center">Loading user data or redirecting...</div>; // Placeholder
  }

  return (
    <div className="container max-w-4xl py-10"> {/* Adjusted max-width */} 
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and notification preferences.
          </p>
        </div>
        <Separator />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 md:grid-cols-none h-auto">
            <TabsTrigger value="account" className="data-[state=active]:bg-primary/10 py-2">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 py-2">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="account" className="space-y-6"> {/* Increased spacing */} 
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View your account details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="name" 
                        value={editableName} 
                        onChange={(e) => setEditableName(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile || editableName === user.name || !editableName.trim()}
                        size="sm"
                      >
                        {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save Name
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed. Contact an administrator if you need to update it.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex items-center space-x-2 rounded-md border p-2">
                      <ShieldCheck className={`h-5 w-5 ${user.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">
                        {user.role === 'admin' 
                          ? 'Administrator' 
                          : user.role === 'staff' 
                            ? 'Staff' 
                            : 'Student'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* --- Change Password Card --- */}
              <Card>
                  <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min. 6 characters)"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmNewPassword"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm your new password"
                          />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button 
                        onClick={handleChangePassword} 
                        disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6}
                        >
                          {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                          Change Password
                      </Button>
                  </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Customize when and how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateNotifications}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="claimNotifications">Item Claim Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications when your claim status changes
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="claimNotifications"
                          checked={claimNotifications}
                          onChange={() => setClaimNotifications(!claimNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="commentNotifications">Community Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications when someone comments on your posts
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="commentNotifications"
                          checked={commentNotifications}
                          onChange={() => setCommentNotifications(!commentNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="matchedItemNotifications">Item Match Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Alerts when an item matching your description is found
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="matchedItemNotifications"
                          checked={matchedItemNotifications}
                          onChange={() => setMatchedItemNotifications(!matchedItemNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Preferences</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
