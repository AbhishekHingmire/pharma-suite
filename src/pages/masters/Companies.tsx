import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Company } from '@/types';
import { toast } from 'sonner';

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    logo: '',
    contact: '',
    email: '',
    address: '',
    gstin: '',
    paymentTerms: '30',
    status: 'active'
  });

  const companies = getFromStorage<Company>('companies');

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.includes(searchTerm)
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.contact) {
      toast.error('Please fill required fields');
      return;
    }

    const allCompanies = getFromStorage<Company>('companies');
    
    if (editingCompany) {
      const updated = allCompanies.map(c =>
        c.id === editingCompany.id ? { ...c, ...formData } : c
      );
      saveToStorage('companies', updated);
      toast.success('Company updated successfully');
    } else {
      const newCompany: Company = {
        id: getNextId('companies'),
        name: formData.name!,
        logo: formData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name!)}&background=random`,
        contact: formData.contact!,
        email: formData.email,
        address: formData.address,
        gstin: formData.gstin,
        paymentTerms: formData.paymentTerms || '30',
        status: formData.status as 'active' | 'inactive'
      };
      saveToStorage('companies', [...allCompanies, newCompany]);
      toast.success('Company added successfully');
    }

    resetForm();
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData(company);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this company?')) {
      const updated = companies.filter(c => c.id !== id);
      saveToStorage('companies', updated);
      toast.success('Company deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      contact: '',
      email: '',
      address: '',
      gstin: '',
      paymentTerms: '30',
      status: 'active'
    });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout title="Companies">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Companies</h2>
            <p className="text-sm text-muted-foreground">{companies.length} companies</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Cipla Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number *</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="1800-XXX-XXXX"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@company.com"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-terms">Payment Terms (Days)</Label>
                      <Input
                        id="payment-terms"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        placeholder="30"
                      />
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
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                      {editingCompany ? 'Update' : 'Add'} Company
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No companies found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Company
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
                        <th className="text-left p-3 text-xs font-semibold uppercase">Company</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Contact</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Email</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">GSTIN</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Payment Terms</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={company.logo} 
                                alt={company.name}
                                className="w-8 h-8 rounded"
                              />
                              <span className="font-medium text-sm">{company.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{company.contact}</td>
                          <td className="p-3 text-sm text-muted-foreground">{company.email || '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground">{company.gstin || '-'}</td>
                          <td className="p-3 text-sm">{company.paymentTerms} days</td>
                          <td className="p-3">
                            <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                              {company.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(company)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(company.id)}>
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
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={company.logo} 
                          alt={company.name}
                          className="w-10 h-10 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.contact}</div>
                        </div>
                      </div>
                      <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                        {company.status}
                      </Badge>
                    </div>
                    {company.email && (
                      <div className="text-xs text-muted-foreground">{company.email}</div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Payment: {company.paymentTerms} days
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(company)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(company.id)}>
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
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
