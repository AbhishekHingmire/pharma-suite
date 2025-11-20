import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { UserCog, Plus, Edit, Trash2, Key, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  mobile: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-01-16 10:30 AM'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      mobile: '9876543211',
      role: 'staff',
      status: 'active',
      lastLogin: '2025-01-16 09:15 AM'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    role: 'staff' as 'admin' | 'staff',
    status: 'active' as 'active' | 'inactive'
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    toast.success('Password generated!');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Password copied to clipboard!');
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      mobile: '',
      role: 'staff',
      status: 'active'
    });
    setGeneratedPassword('');
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    });
    setGeneratedPassword('');
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

  const handleResetPassword = (user: User) => {
    generatePassword();
    toast.success(`Password reset for ${user.name}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Manage team members and their access levels
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        </div>

        <Card className="p-4">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.mobile}</TableCell>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="10 digit mobile number"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
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

            <div className="space-y-2">
              <Label>Status *</Label>
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

            {!editingUser && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedPassword}
                    readOnly
                    placeholder="Click generate to create password"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generatePassword}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  {generatedPassword && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyPassword}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

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
    </DashboardLayout>
  );
}
