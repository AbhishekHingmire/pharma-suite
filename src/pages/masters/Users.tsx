import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCog, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Permission {
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface User {
  id: number;
  name: string;
  mobile: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: Permission[];
}

interface Activity {
  id: number;
  type: 'purchase' | 'sale' | 'payment' | 'inventory';
  action: string;
  timestamp: string;
  details: string;
}

const modules = [
  'Dashboard',
  'Sales',
  'Purchase',
  'Inventory',
  'Payments',
  'Customers',
  'Products',
  'Reports'
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      role: 'admin',
      status: 'active',
      lastLogin: '16 Jan, 10:30 AM',
      permissions: modules.map(m => ({ module: m, canView: true, canEdit: true, canDelete: true }))
    },
    {
      id: 2,
      name: 'Priya Sharma',
      mobile: '9876543211',
      role: 'staff',
      status: 'active',
      lastLogin: '16 Jan, 09:15 AM',
      permissions: modules.map(m => ({ module: m, canView: true, canEdit: m !== 'Reports', canDelete: false }))
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activityFilter, setActivityFilter] = useState<'today' | 'week' | 'month'>('today');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    role: 'staff' as 'admin' | 'staff',
    status: 'active' as 'active' | 'inactive',
    permissions: modules.map(m => ({ module: m, canView: true, canEdit: false, canDelete: false }))
  });

  // Mock activity data
  const [activities] = useState<Activity[]>([
    {
      id: 1,
      type: 'sale',
      action: 'Added New Sale',
      timestamp: '2025-01-16 10:30 AM',
      details: 'Invoice #INV-001 - ₹25,000'
    },
    {
      id: 2,
      type: 'payment',
      action: 'Received Payment',
      timestamp: '2025-01-16 09:15 AM',
      details: 'Customer: ABC Pharmacy - ₹15,000'
    },
    {
      id: 3,
      type: 'inventory',
      action: 'Updated Stock',
      timestamp: '2025-01-15 04:30 PM',
      details: 'Product: Paracetamol 500mg - Added 500 units'
    },
    {
      id: 4,
      type: 'purchase',
      action: 'Added Purchase',
      timestamp: '2025-01-15 02:20 PM',
      details: 'Supplier: MediCorp - ₹50,000'
    }
  ]);

  const getFilteredActivities = () => {
    const now = new Date();
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const diffTime = now.getTime() - activityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (activityFilter === 'today') return diffDays === 0;
      if (activityFilter === 'week') return diffDays <= 7;
      if (activityFilter === 'month') return diffDays <= 30;
      return true;
    });
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      mobile: '',
      role: 'staff',
      status: 'active',
      permissions: modules.map(m => ({ module: m, canView: true, canEdit: false, canDelete: false }))
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      permissions: user.permissions
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id
        ? { ...u, ...formData }
        : u
      ));
      toast.success('User updated successfully!');
    } else {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData,
        lastLogin: 'Never'
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('User added successfully!');
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
    }
  };

  const handleViewActivity = (userId: number) => {
    setSelectedUserId(userId);
    setIsActivityOpen(true);
  };

  const updatePermission = (moduleIndex: number, field: 'canView' | 'canEdit' | 'canDelete', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((p, i) => 
        i === moduleIndex ? { ...p, [field]: value } : p
      )
    }));
  };

  const getActivityIcon = (type: string) => {
    const colors = {
      sale: 'bg-success',
      purchase: 'bg-primary',
      payment: 'bg-blue-500',
      inventory: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Users</h2>
            <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Last Login</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewActivity(user.id)}
                          title="View Activity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Enter mobile number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">User will login using OTP on this number</p>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'staff') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b font-semibold text-sm">
                    <div>Module</div>
                    <div className="text-center">View</div>
                    <div className="text-center">Edit</div>
                    <div className="text-center">Delete</div>
                  </div>
                  {formData.permissions.map((permission, index) => (
                    <div key={permission.module} className="grid grid-cols-4 gap-4 items-center">
                      <div className="font-medium">{permission.module}</div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.canView}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'canView', checked as boolean)
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.canEdit}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'canEdit', checked as boolean)
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.canDelete}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'canDelete', checked as boolean)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Timeline Dialog */}
      <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Activity Timeline</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={activityFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivityFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={activityFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivityFilter('week')}
              >
                Week
              </Button>
              <Button
                variant={activityFilter === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivityFilter('month')}
              >
                Month
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {getFilteredActivities().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity found for selected period
                  </div>
                ) : (
                  getFilteredActivities().map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full ${getActivityIcon(activity.type)} flex items-center justify-center flex-shrink-0`}>
                        <UserCog className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.details}</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}