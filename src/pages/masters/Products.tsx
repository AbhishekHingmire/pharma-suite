import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Product, Company } from '@/types';
import { toast } from 'sonner';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    generic: '',
    hsn: '',
    gst: 12,
    packing: '',
    companyId: 0,
    minStock: 10,
    status: 'active'
  });

  const products = getFromStorage<Product>('products');
  const companies = getFromStorage<Company>('companies');

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(p.companyId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.generic || !formData.companyId) {
      toast.error('Please fill required fields');
      return;
    }

    const allProducts = getFromStorage<Product>('products');
    
    if (editingProduct) {
      const updated = allProducts.map(p =>
        p.id === editingProduct.id ? { ...p, ...formData } : p
      );
      saveToStorage('products', updated);
      toast.success('Product updated successfully');
    } else {
      const newProduct: Product = {
        id: getNextId('products'),
        name: formData.name!,
        generic: formData.generic!,
        hsn: formData.hsn || '',
        gst: formData.gst || 12,
        packing: formData.packing || '',
        companyId: formData.companyId!,
        minStock: formData.minStock || 10,
        status: formData.status as 'active' | 'inactive'
      };
      saveToStorage('products', [...allProducts, newProduct]);
      toast.success('Product added successfully');
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      saveToStorage('products', updated);
      toast.success('Product deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic: '',
      hsn: '',
      gst: 12,
      packing: '',
      companyId: 0,
      minStock: 10,
      status: 'active'
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout title="Products">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Manage Products</h2>
            <p className="text-sm text-muted-foreground">{products.length} products</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dolo 650"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generic">Generic Name *</Label>
                      <Input
                        id="generic"
                        value={formData.generic}
                        onChange={(e) => setFormData({ ...formData, generic: e.target.value })}
                        placeholder="Paracetamol"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Select 
                        value={formData.companyId?.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, companyId: parseInt(value) })}
                      >
                        <SelectTrigger id="company">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.filter(c => c.status === 'active').map(company => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packing">Packing</Label>
                      <Input
                        id="packing"
                        value={formData.packing}
                        onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                        placeholder="10x10 Tablets"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hsn">HSN Code</Label>
                      <Input
                        id="hsn"
                        value={formData.hsn}
                        onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                        placeholder="30049099"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gst">GST %</Label>
                      <Input
                        id="gst"
                        type="number"
                        value={formData.gst}
                        onChange={(e) => setFormData({ ...formData, gst: parseFloat(e.target.value) })}
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                        placeholder="10"
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
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </Card>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Product</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Generic</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Company</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Packing</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">HSN</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">GST %</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Min Stock</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-medium text-sm">{product.name}</td>
                          <td className="p-3 text-sm text-muted-foreground">{product.generic}</td>
                          <td className="p-3 text-sm">{getCompanyName(product.companyId)}</td>
                          <td className="p-3 text-sm text-muted-foreground">{product.packing || '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground">{product.hsn || '-'}</td>
                          <td className="p-3 text-sm">{product.gst}%</td>
                          <td className="p-3 text-sm">{product.minStock}</td>
                          <td className="p-3">
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
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
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.generic}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getCompanyName(product.companyId)}
                        </div>
                      </div>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                      <span>GST: {product.gst}%</span>
                      <span>Min Stock: {product.minStock}</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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
