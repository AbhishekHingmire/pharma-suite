import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, UserCog, Activity, Eye, EyeOff, Copy, Package } from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { User, Sale, Purchase } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Workers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({
    name: '',
    mobile: '',
    role: 'staff',
    password: ''
  });

  const users = getFromStorage<User>('users');
  const sales = getFromStorage<Sale>('sales');
  const purchases = getFromStorage<Purchase>('purchases');

  const workers = users.filter(u => u.role === 'staff');

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.mobile.includes(searchTerm)
  );

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setShowPassword(true);
  };

  const copyPassword = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      toast.success('Password copied to clipboard');
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill required fields');
      return;
    }

    if (!editingWorker && !formData.password) {
      toast.error('Please generate a password');
      return;
    }

    const allUsers = getFromStorage<User>('users');
    
    if (editingWorker) {
      const updated = allUsers.map(u =>
        u.id === editingWorker.id ? { ...u, name: formData.name!, mobile: formData.mobile! } : u
      );
      saveToStorage('users', updated);
      toast.success('Worker updated successfully');
    } else {
      const newWorker: User = {
        id: getNextId('users'),
        name: formData.name!,
        mobile: formData.mobile!,
        role: 'staff',
        token: formData.password || ''
      };
      saveToStorage('users', [...allUsers, newWorker]);
      toast.success('Worker added successfully');
    }

    resetForm();
  };

  const handleEdit = (worker: User) => {
    setEditingWorker(worker);
    setFormData({ name: worker.name, mobile: worker.mobile, role: worker.role });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this worker?')) {
      const updated = users.filter(u => u.id !== id);
      saveToStorage('users', updated);
      toast.success('Worker removed successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      role: 'staff',
      password: ''
    });
    setShowPassword(false);
    setEditingWorker(null);
    setIsDialogOpen(false);
  };

  // Mock activity data (in real app, you'd track this)
  const getWorkerActivities = () => {
    const activities: any[] = [];
    
    sales.forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        workerId: 1, // In real app, you'd track which worker created it
        type: 'sale',
        description: `Created sale invoice ${sale.invoiceNo}`,
        amount: sale.total,
        date: sale.date,
        time: '10:30 AM' // In real app, you'd store timestamps
      });
    });

    purchases.forEach(purchase => {
      activities.push({
        id: `purchase-${purchase.id}`,
        workerId: 1,
        type: 'purchase',
        description: `Added purchase ${purchase.invoiceNo}`,
        amount: purchase.total,
        date: purchase.date,
        time: '2:45 PM'
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const activities = getWorkerActivities();

  return (
    <DashboardLayout title="Workers">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Worker Management</h2>
            <p className="text-sm text-muted-foreground">{workers.length} active workers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rahul Kumar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>

                {!editingWorker && (
                  <div className="space-y-2">
                    <Label>Login Password *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Generate or enter password"
                          readOnly
                        />
                        {formData.password && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-7"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                      {formData.password && (
                        <Button type="button" variant="outline" size="sm" onClick={copyPassword}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Button type="button" variant="secondary" onClick={generatePassword} className="w-full">
                      Generate Password
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Share this password with the worker securely. They'll use it to login.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit}>
                    {editingWorker ? 'Update' : 'Add'} Worker
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="workers" className="w-full">
          <TabsList>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="workers" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredWorkers.length === 0 ? (
              <Card className="p-8 text-center">
                <UserCog className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No workers found</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Worker
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <Card key={worker.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-xs text-muted-foreground">{worker.mobile}</div>
                          </div>
                        </div>
                        <Badge>Active</Badge>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                        <span>Last login: Today 9:30 AM</span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(worker)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(worker.id)}>
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <div className="divide-y">
                {activities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No activity recorded yet</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded ${
                            activity.type === 'sale' ? 'bg-success/10' : 'bg-blue-500/10'
                          }`}>
                            {activity.type === 'sale' ? (
                              <Activity className={`w-4 h-4 ${
                                activity.type === 'sale' ? 'text-success' : 'text-blue-500'
                              }`} />
                            ) : (
                              <Package className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(activity.date), 'dd MMM yyyy')} at {activity.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            ₹{activity.amount.toLocaleString('en-IN')}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
