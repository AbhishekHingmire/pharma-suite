import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Customer } from '@/types';
import { toast } from 'sonner';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    type: 'B',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    creditLimit: 100000,
    creditDays: 30,
    outstanding: 0,
    status: 'active'
  });

  const customers = getFromStorage<Customer>('customers');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please fill required fields');
      return;
    }

    const allCustomers = getFromStorage<Customer>('customers');
    
    if (editingCustomer) {
      const updated = allCustomers.map(c =>
        c.id === editingCustomer.id ? { ...c, ...formData } : c
      );
      saveToStorage('customers', updated);
      toast.success('Customer updated successfully');
    } else {
      const newCustomer: Customer = {
        id: getNextId('customers'),
        name: formData.name!,
        type: formData.type as 'A' | 'B' | 'C',
        phone: formData.phone!,
        email: formData.email,
        address: formData.address,
        gstin: formData.gstin,
        creditLimit: formData.creditLimit || 100000,
        creditDays: formData.creditDays || 30,
        outstanding: 0,
        status: formData.status as 'active' | 'inactive'
      };
      saveToStorage('customers', [...allCustomers, newCustomer]);
      toast.success('Customer added successfully');
    }

    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const updated = customers.filter(c => c.id !== id);
      saveToStorage('customers', updated);
      toast.success('Customer deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'B',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      creditLimit: 100000,
      creditDays: 30,
      outstanding: 0,
      status: 'active'
    });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      A: 'bg-success',
      B: 'bg-blue-500',
      C: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Customers</h2>
            <p className="text-sm text-muted-foreground">{customers.length} customers</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Medical Store Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Customer Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData({ ...formData, type: value as 'A' | 'B' | 'C' })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Type A (Premium)</SelectItem>
                          <SelectItem value="B">Type B (Regular)</SelectItem>
                          <SelectItem value="C">Type C (Retail)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Complete address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: parseInt(e.target.value) })}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditDays">Credit Days</Label>
                      <Input
                        id="creditDays"
                        type="number"
                        value={formData.creditDays}
                        onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) })}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                      {editingCustomer ? 'Update' : 'Add'} Customer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No customers found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Customer
            </Button>
          </Card>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-xs font-semibold uppercase">Customer</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Type</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Phone</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Credit Limit</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Outstanding</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Credit Days</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-medium text-sm">{customer.name}</td>
                          <td className="p-3">
                            <Badge className={`${getTypeBadgeColor(customer.type)} text-white`}>
                              Type {customer.type}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">{customer.phone}</td>
                          <td className="p-3 text-sm">₹{customer.creditLimit.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-sm font-semibold">
                            ₹{customer.outstanding.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-sm">{customer.creditDays} days</td>
                          <td className="p-3">
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                                <Trash2 className="w-4 h-4 text-danger" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getTypeBadgeColor(customer.type)} text-white`}>
                          {customer.type}
                        </Badge>
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Credit: ₹{customer.creditLimit.toLocaleString('en-IN')}</span>
                      <span className="font-semibold text-foreground">
                        Outstanding: ₹{customer.outstanding.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
