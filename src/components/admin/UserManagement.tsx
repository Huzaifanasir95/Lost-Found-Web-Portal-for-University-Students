
import React, { useState } from 'react';
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
  Filter, 
  Trash2, 
  Edit, 
  Check, 
  X,
  Shield,
  ShieldAlert,
  UserCog,
  Loader2 
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

// Mock users for the admin dashboard
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'i224567@nu.edu.pk',
    role: 'student',
    status: 'active',
    dateRegistered: '12 Sep 2023',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'i225678@nu.edu.pk',
    role: 'student',
    status: 'active',
    dateRegistered: '15 Sep 2023',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'David Wilson',
    email: 'david.wilson@nu.edu.pk',
    role: 'staff',
    status: 'active',
    dateRegistered: '10 Aug 2023',
    lastActive: '5 hours ago'
  },
  {
    id: '4',
    name: 'Sarah Ahmed',
    email: 'k223456@nu.edu.pk',
    role: 'student',
    status: 'inactive',
    dateRegistered: '5 Jun 2023',
    lastActive: '2 months ago'
  },
  {
    id: '5',
    name: 'James Brown',
    email: 'james.brown@nu.edu.pk',
    role: 'admin',
    status: 'active',
    dateRegistered: '2 Jan 2023',
    lastActive: '30 minutes ago'
  },
  {
    id: '6',
    name: 'Maria Garcia',
    email: 'k227890@nu.edu.pk',
    role: 'student',
    status: 'active',
    dateRegistered: '10 Oct 2023',
    lastActive: '3 days ago'
  },
  {
    id: '7',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@nu.edu.pk',
    role: 'staff',
    status: 'active',
    dateRegistered: '8 Apr 2023',
    lastActive: '1 week ago'
  },
  {
    id: '8',
    name: 'Lisa Chen',
    email: 'k229012@nu.edu.pk',
    role: 'student',
    status: 'suspended',
    dateRegistered: '20 Mar 2023',
    lastActive: '2 weeks ago'
  }
];

type User = typeof mockUsers[0];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  const handleSaveUser = () => {
    if (!editedUser) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === editedUser.id ? editedUser : user
      );
      
      setUsers(updatedUsers);
      setIsEditing(false);
      setSelectedUser(null);
      setEditedUser(null);
      setIsProcessing(false);
      
      toast({
        title: "User Updated",
        description: `${editedUser.name}'s information has been updated.`,
      });
    }, 1000);
  };

  const handleDeleteUser = (userId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setIsProcessing(false);
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed from the system.",
      });
    }, 1000);
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUsers = users.map(user => 
      user.id === userId ? {...user, status: newStatus} : user
    );
    
    setUsers(updatedUsers);
    
    toast({
      title: "Status Updated",
      description: `User status has been changed to ${newStatus}.`,
    });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts and permissions for the Lost & Found system
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.dateRegistered}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
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
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                            >
                              <X className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Suspend</span>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleStatusChange(user.id, 'active')}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Activate</span>
                            </Button>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the user "{user.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteUser(user.id)}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserCog className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
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
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select defaultValue="student">
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
                      <Switch id="status" defaultChecked />
                      <Label htmlFor="status">Active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Edit User Dialog */}
        {editedUser && (
          <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
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
                    onValueChange={(value) => setEditedUser({...editedUser, role: value})}
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
                    onValueChange={(value: any) => setEditedUser({...editedUser, status: value})}
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
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
