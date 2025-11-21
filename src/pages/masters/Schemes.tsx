import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Tag, Calendar, X } from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Scheme, Company, Product } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Schemes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'expired'>('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState<Partial<Scheme>>({
    companyId: 0,
    type: 'freeQty',
    buyQty: 0,
    freeQty: 0,
    discountPercent: 0,
    minPurchaseQty: 0,
    slabs: [],
    cashDiscountPercent: 0,
    paymentDays: 0,
    volumeSlabs: [],
    tradeDiscountPercent: 0,
    seasonalDiscountPercent: 0,
    promoName: '',
    comboProducts: [],
    comboDiscountPercent: 0,
    validFrom: '',
    validTo: '',
    products: 'all',
    status: 'active'
  });

  const schemes = getFromStorage<Scheme>('schemes');
  const companies = getFromStorage<Company>('companies');
  const products = getFromStorage<Product>('products');

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  const getSchemeStatus = (scheme: Scheme) => {
    const today = new Date();
    const startDate = new Date(scheme.validFrom);
    const endDate = new Date(scheme.validTo);

    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'expired';
    return scheme.status === 'active' ? 'active' : 'inactive';
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getSchemeDescription = (scheme: Scheme) => {
    if (scheme.type === 'freeQty') {
      return `Buy ${scheme.buyQty}, Get ${scheme.freeQty} Free`;
    } else if (scheme.type === 'discount') {
      return `${scheme.discountPercent}% Flat Discount${scheme.minPurchaseQty ? ` (Min: ${scheme.minPurchaseQty} qty)` : ''}`;
    } else if (scheme.type === 'slab') {
      const slabCount = scheme.slabs?.length || 0;
      return `${slabCount} Slab Tiers (Qty-based)`;
    } else if (scheme.type === 'cash') {
      return `${scheme.cashDiscountPercent}% Cash Discount (${scheme.paymentDays} days)`;
    } else if (scheme.type === 'volume') {
      const slabCount = scheme.volumeSlabs?.length || 0;
      return `${slabCount} Volume Tiers (Amount-based)`;
    } else if (scheme.type === 'trade') {
      return `${scheme.tradeDiscountPercent}% Trade Discount`;
    } else if (scheme.type === 'seasonal') {
      return `${scheme.seasonalDiscountPercent}% ${scheme.promoName || 'Seasonal'} Offer`;
    } else if (scheme.type === 'combo') {
      const productCount = scheme.comboProducts?.length || 0;
      return `${scheme.comboDiscountPercent}% Combo (${productCount} products)`;
    }
    return 'Unknown Scheme';
  };

  const filteredSchemes = schemes
    .filter(s => {
      const matchesSearch = getCompanyName(s.companyId).toLowerCase().includes(searchTerm.toLowerCase());
      const status = getSchemeStatus(s);
      
      return matchesSearch && status === filter;
    })
    .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());

  const handleSubmit = () => {
    if (!formData.companyId || !formData.validFrom || !formData.validTo) {
      toast.error('Please fill required fields');
      return;
    }

    const allSchemes = getFromStorage<Scheme>('schemes');
    
    if (editingScheme) {
      const updated = allSchemes.map(s =>
        s.id === editingScheme.id ? { ...s, ...formData } : s
      );
      saveToStorage('schemes', updated);
      toast.success('Scheme updated successfully');
    } else {
      const newScheme: Scheme = {
        id: getNextId('schemes'),
        companyId: formData.companyId!,
        type: formData.type as 'freeQty' | 'discount' | 'slab',
        buyQty: formData.buyQty,
        freeQty: formData.freeQty,
        discountPercent: formData.discountPercent,
        validFrom: formData.validFrom!,
        validTo: formData.validTo!,
        products: formData.products!,
        status: formData.status as 'active' | 'inactive'
      };
      saveToStorage('schemes', [...allSchemes, newScheme]);
      toast.success('Scheme added successfully');
    }

    resetForm();
  };

  const handleEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormData(scheme);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      const updated = schemes.filter(s => s.id !== id);
      saveToStorage('schemes', updated);
      toast.success('Scheme deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: 0,
      type: 'freeQty',
      buyQty: 0,
      freeQty: 0,
      discountPercent: 0,
      minPurchaseQty: 0,
      slabs: [],
      cashDiscountPercent: 0,
      paymentDays: 0,
      volumeSlabs: [],
      tradeDiscountPercent: 0,
      seasonalDiscountPercent: 0,
      promoName: '',
      comboProducts: [],
      comboDiscountPercent: 0,
      validFrom: '',
      validTo: '',
      products: 'all',
      status: 'active'
    });
    setEditingScheme(null);
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success border-success',
      upcoming: 'bg-blue-500 border-blue-500',
      expired: 'bg-gray-500 border-gray-500',
      inactive: 'bg-orange-500 border-orange-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <DashboardLayout title="Schemes">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Manage Schemes</h2>
            <p className="text-sm text-muted-foreground">{schemes.length} schemes</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingScheme ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
                      <Label htmlFor="type">Scheme Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData({ ...formData, type: value as Scheme['type'] })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freeQty">Free Quantity (Buy X Get Y Free)</SelectItem>
                          <SelectItem value="discount">Flat Discount (%)</SelectItem>
                          <SelectItem value="slab">Slab Discount (Qty-based Tiers)</SelectItem>
                          <SelectItem value="cash">Cash Discount (Early Payment)</SelectItem>
                          <SelectItem value="volume">Volume Discount (Amount-based)</SelectItem>
                          <SelectItem value="trade">Trade Discount (Fixed % for Retailers)</SelectItem>
                          <SelectItem value="seasonal">Seasonal/Promotional</SelectItem>
                          <SelectItem value="combo">Combo Discount (Multi-product)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.type === 'freeQty' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyQty">Buy Quantity *</Label>
                        <Input
                          id="buyQty"
                          type="number"
                          value={formData.buyQty}
                          onChange={(e) => setFormData({ ...formData, buyQty: parseInt(e.target.value) })}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeQty">Free Quantity *</Label>
                        <Input
                          id="freeQty"
                          type="number"
                          value={formData.freeQty}
                          onChange={(e) => setFormData({ ...formData, freeQty: parseInt(e.target.value) })}
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type === 'discount' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discountPercent">Discount Percentage *</Label>
                        <Input
                          id="discountPercent"
                          type="number"
                          step="0.01"
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) })}
                          placeholder="5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minPurchaseQty">Minimum Quantity (Optional)</Label>
                        <Input
                          id="minPurchaseQty"
                          type="number"
                          value={formData.minPurchaseQty || ''}
                          onChange={(e) => setFormData({ ...formData, minPurchaseQty: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type === 'slab' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Quantity Slabs *</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newSlabs = [...(formData.slabs || []), { minQty: 0, maxQty: 0, discount: 0 }];
                            setFormData({ ...formData, slabs: newSlabs });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Slab
                        </Button>
                      </div>
                      {(formData.slabs || []).map((slab, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end p-3 border rounded-md">
                          <div className="space-y-1">
                            <Label className="text-xs">Min Qty</Label>
                            <Input
                              type="number"
                              value={slab.minQty}
                              onChange={(e) => {
                                const newSlabs = [...(formData.slabs || [])];
                                newSlabs[idx].minQty = parseInt(e.target.value);
                                setFormData({ ...formData, slabs: newSlabs });
                              }}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Max Qty</Label>
                            <Input
                              type="number"
                              value={slab.maxQty}
                              onChange={(e) => {
                                const newSlabs = [...(formData.slabs || [])];
                                newSlabs[idx].maxQty = parseInt(e.target.value);
                                setFormData({ ...formData, slabs: newSlabs });
                              }}
                              placeholder="999999"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Discount %</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={slab.discount}
                              onChange={(e) => {
                                const newSlabs = [...(formData.slabs || [])];
                                newSlabs[idx].discount = parseFloat(e.target.value);
                                setFormData({ ...formData, slabs: newSlabs });
                              }}
                              placeholder="5"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSlabs = (formData.slabs || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, slabs: newSlabs });
                            }}
                          >
                            <X className="w-4 h-4 text-danger" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.type === 'cash' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cashDiscountPercent">Cash Discount % *</Label>
                        <Input
                          id="cashDiscountPercent"
                          type="number"
                          step="0.01"
                          value={formData.cashDiscountPercent}
                          onChange={(e) => setFormData({ ...formData, cashDiscountPercent: parseFloat(e.target.value) })}
                          placeholder="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentDays">Payment Days *</Label>
                        <Input
                          id="paymentDays"
                          type="number"
                          value={formData.paymentDays}
                          onChange={(e) => setFormData({ ...formData, paymentDays: parseInt(e.target.value) })}
                          placeholder="7"
                        />
                        <p className="text-xs text-muted-foreground">Days within which payment must be made</p>
                      </div>
                    </div>
                  )}

                  {formData.type === 'volume' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Volume Slabs (Amount-based) *</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newSlabs = [...(formData.volumeSlabs || []), { minAmount: 0, maxAmount: 0, discount: 0 }];
                            setFormData({ ...formData, volumeSlabs: newSlabs });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Slab
                        </Button>
                      </div>
                      {(formData.volumeSlabs || []).map((slab, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end p-3 border rounded-md">
                          <div className="space-y-1">
                            <Label className="text-xs">Min Amount (₹)</Label>
                            <Input
                              type="number"
                              value={slab.minAmount}
                              onChange={(e) => {
                                const newSlabs = [...(formData.volumeSlabs || [])];
                                newSlabs[idx].minAmount = parseFloat(e.target.value);
                                setFormData({ ...formData, volumeSlabs: newSlabs });
                              }}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Max Amount (₹)</Label>
                            <Input
                              type="number"
                              value={slab.maxAmount}
                              onChange={(e) => {
                                const newSlabs = [...(formData.volumeSlabs || [])];
                                newSlabs[idx].maxAmount = parseFloat(e.target.value);
                                setFormData({ ...formData, volumeSlabs: newSlabs });
                              }}
                              placeholder="999999"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Discount %</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={slab.discount}
                              onChange={(e) => {
                                const newSlabs = [...(formData.volumeSlabs || [])];
                                newSlabs[idx].discount = parseFloat(e.target.value);
                                setFormData({ ...formData, volumeSlabs: newSlabs });
                              }}
                              placeholder="5"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSlabs = (formData.volumeSlabs || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, volumeSlabs: newSlabs });
                            }}
                          >
                            <X className="w-4 h-4 text-danger" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.type === 'trade' && (
                    <div className="space-y-2">
                      <Label htmlFor="tradeDiscountPercent">Trade Discount % *</Label>
                      <Input
                        id="tradeDiscountPercent"
                        type="number"
                        step="0.01"
                        value={formData.tradeDiscountPercent}
                        onChange={(e) => setFormData({ ...formData, tradeDiscountPercent: parseFloat(e.target.value) })}
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">Fixed discount for retailers/wholesalers</p>
                    </div>
                  )}

                  {formData.type === 'seasonal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seasonalDiscountPercent">Seasonal Discount % *</Label>
                        <Input
                          id="seasonalDiscountPercent"
                          type="number"
                          step="0.01"
                          value={formData.seasonalDiscountPercent}
                          onChange={(e) => setFormData({ ...formData, seasonalDiscountPercent: parseFloat(e.target.value) })}
                          placeholder="15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="promoName">Promotion Name</Label>
                        <Input
                          id="promoName"
                          type="text"
                          value={formData.promoName}
                          onChange={(e) => setFormData({ ...formData, promoName: e.target.value })}
                          placeholder="Diwali Sale"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type === 'combo' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="comboDiscountPercent">Combo Discount % *</Label>
                          <Input
                            id="comboDiscountPercent"
                            type="number"
                            step="0.01"
                            value={formData.comboDiscountPercent}
                            onChange={(e) => setFormData({ ...formData, comboDiscountPercent: parseFloat(e.target.value) })}
                            placeholder="12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comboProduct">Select Products *</Label>
                          <Select 
                            onValueChange={(value) => {
                              const productId = parseInt(value);
                              const currentProducts = formData.comboProducts || [];
                              if (!currentProducts.includes(productId)) {
                                setFormData({ ...formData, comboProducts: [...currentProducts, productId] });
                              }
                            }}
                          >
                            <SelectTrigger id="comboProduct">
                              <SelectValue placeholder="Add product to combo" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.filter(p => p.status === 'active').map(product => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formData.comboProducts && formData.comboProducts.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Selected Products:</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.comboProducts.map(pid => {
                              const product = products.find(p => p.id === pid);
                              return (
                                <Badge key={pid} variant="secondary" className="text-xs">
                                  {product?.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newProducts = formData.comboProducts?.filter(id => id !== pid);
                                      setFormData({ ...formData, comboProducts: newProducts });
                                    }}
                                    className="ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validTo">Valid To *</Label>
                      <Input
                        id="validTo"
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
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
                      {editingScheme ? 'Update' : 'Add'} Scheme
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'expired' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Expired
          </Button>
        </div>

        {filteredSchemes.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No schemes found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Scheme
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredSchemes.map((scheme) => {
              const status = getSchemeStatus(scheme);
              const daysLeft = getDaysRemaining(scheme.validTo);
              
              return (
                <Card key={scheme.id} className={`p-2.5 border-l-4 ${getStatusColor(status)} hover:shadow-md transition-shadow bg-card`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-md font-semibold text-foreground">{getCompanyName(scheme.companyId)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getSchemeDescription(scheme)}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(status)} text-white text-xs shrink-0`}>
                        {status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-5 h-3 shrink-0" />
                        <span className="truncate">
                          {format(new Date(scheme.validFrom), 'dd MMM')} - {format(new Date(scheme.validTo), 'dd MMM yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {status === 'active' && daysLeft > 0 && (
                          <Badge variant="outline" className="text-success border-success text-xs">
                            {daysLeft}d Remaining
                          </Badge>
                        )}
                        {status !== 'expired' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(scheme)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(scheme.id)}>
                              <Trash2 className="w-4 h-4 text-danger" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
