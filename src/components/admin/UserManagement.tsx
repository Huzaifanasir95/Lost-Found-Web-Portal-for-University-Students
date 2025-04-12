import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  X,
  Shield,
  ShieldAlert,
  Loader2,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define interface for API error responses
interface ApiErrorData {
  message?: string;
  errors?: { msg: string }[]; // For validation errors
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive?: string;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { toast } = useToast();
  const { token } = useAuth();

  // Helper function to extract error message
  const getErrorMessage = (error: unknown): string => {
    let message = "An unexpected error occurred. Please try again.";
    
    if (error instanceof Error) {
      message = error.message;
      // Attempt to parse JSON if it looks like it might contain more detail
      if (message.includes('{') && message.includes('}')) {
        try {
          const errorData: ApiErrorData = JSON.parse(message);
          if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0 && errorData.errors[0].msg) {
            message = errorData.errors[0].msg; // Use express-validator message
          } else if (errorData.message) {
            message = errorData.message; // Use backend's custom message
          }
          // If parsing works but no specific message found, keep the original error.message
        } catch (parseError) {
          // Parsing failed, keep the original error.message
        }
      }
    } else if (typeof error === 'string') {
      message = error;
    }
    return message;
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [retryCount, token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching users with token:", token?.substring(0, 10) + "...");
      
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check server configuration.');
        }
        
        const text = await response.text();
        console.error("Error response text:", text);
        
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || 'Failed to fetch users';
        } catch (e) {
          // Not valid JSON
          errorMessage = 'Invalid response from server';
        }
        
        throw new Error(errorMessage);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON. Check server configuration.');
      }
      
      const data = await response.json();
      console.log("Users data received:", data.length);
      setUsers(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching users:', errorMessage, error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditedUser({...user});
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!editedUser) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
          role: editedUser.role,
          status: editedUser.status
        })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user');
        } else {
          const text = await response.text();
          console.error("Error response text:", text);
          throw new Error('Invalid response from server');
        }
      }
      
      const updatedUser = await response.json();
      
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setIsEditing(false);
      setSelectedUser(null);
      setEditedUser(null);
      
      toast({
        title: "User Updated",
        description: `${updatedUser.name}'s information has been updated.`,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating user:', errorMessage, error);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUser = async () => {
    setIsProcessing(true);
    
    try {
      // Validate student email
      if (newUser.role === 'student' && !newUser.email.toLowerCase().endsWith('@nu.edu.pk')) {
        throw new Error('Student email must end with @nu.edu.pk');
      }
      
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create user');
        } else {
          const text = await response.text();
          console.error("Error response text:", text);
          throw new Error('Invalid response from server');
        }
      }
      
      const createdUser = await response.json();
      
      setUsers([...users, createdUser]);
      setIsAddUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        status: 'active',
      });
      
      toast({
        title: "User Created",
        description: `${createdUser.name} has been successfully added.`,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error creating user:', errorMessage, error);
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        } else {
          const text = await response.text();
          console.error("Error response text:", text);
          throw new Error('Invalid response from server');
        }
      }
      
      setUsers(users.filter(user => user._id !== userId));
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed from the system.",
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting user:', errorMessage, error);
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user status');
        } else {
          const text = await response.text();
          console.error("Error response text:", text);
          throw new Error('Invalid response from server');
        }
      }
      
      const updatedUser = await response.json();
      
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      toast({
        title: "Status Updated",
        description: `User status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating user status:', errorMessage, error);
      toast({
        title: "Status Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryFetch = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'staff':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'student':
        return <UserIcon className="h-4 w-4 text-primary" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts and permissions for the Lost & Found system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={handleRetryFetch} variant="outline">
              <Loader2 className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            {user.status === 'active' ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStatusChange(user._id, 'suspended')}
                                disabled={isProcessing}
                              >
                                <X className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Suspend</span>
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStatusChange(user._id, 'active')}
                                disabled={isProcessing}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="sr-only">Activate</span>
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </div>
          </div>
        )}
        
        {/* Edit User Dialog */}
        <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            {editedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="edit-name" 
                    className="col-span-3" 
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="edit-email" 
                    className="col-span-3" 
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    value={editedUser.role}
                    onValueChange={(value: 'student' | 'staff' | 'admin') => setEditedUser({...editedUser, role: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select 
                    value={editedUser.status}
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => setEditedUser({...editedUser, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedUser) {
                    handleDeleteUser(selectedUser._id);
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the Lost & Found system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  className="col-span-3" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
                {newUser.role === 'student' && (
                  <p className="col-span-3 col-start-2 text-xs text-muted-foreground">
                    Student email must end with @nu.edu.pk
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  className="col-span-3" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
                <p className="col-span-3 col-start-2 text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newUser.role}
                  onValueChange={(value: 'student' | 'staff' | 'admin') => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="flex items-center gap-2 col-span-3">
                  <Switch 
                    id="status" 
                    checked={newUser.status === 'active'}
                    onCheckedChange={(checked) => setNewUser({...newUser, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label htmlFor="status">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddUserOpen(false);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    status: 'active',
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={isProcessing || !newUser.name || !newUser.email || !newUser.password}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
