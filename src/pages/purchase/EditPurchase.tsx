import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import { Company, Product, Scheme, PurchaseItem, Purchase, InventoryBatch } from '@/types';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditPurchase() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [schemeVerified, setSchemeVerified] = useState<boolean[]>([]);
  const [originalPurchase, setOriginalPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  const companies = getFromStorage<Company>('companies');
  const products = getFromStorage<Product>('products');
  const schemes = getFromStorage<Scheme>('schemes');

  useEffect(() => {
    // Load existing purchase data
    const purchases = getFromStorage<Purchase>('purchases');
    const purchase = purchases.find(p => p.id === parseInt(id || '0'));
    
    if (!purchase) {
      toast.error('Purchase not found');
      navigate('/purchase');
      return;
    }

    setOriginalPurchase(purchase);
    const company = companies.find(c => c.id === purchase.companyId);
    setSelectedCompany(company || null);
    setItems(purchase.items);
    setSchemeVerified(purchase.items.map(() => true));
    setLoading(false);
  }, [id]);

  const addItem = () => {
    setItems([...items, {
      productId: 0,
      qty: 0,
      freeQty: 0,
      batch: '',
      expiry: '',
      rate: 0,
      amount: 0,
    }]);
    setSchemeVerified([...schemeVerified, false]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setSchemeVerified(schemeVerified.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'qty' || field === 'rate' || field === 'freeQty') {
      const qty = field === 'qty' ? value : newItems[index].qty;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = qty * rate;
    }

    setItems(newItems);
  };

  const hasActiveScheme = (itemIndex: number) => {
    const item = items[itemIndex];
    if (!item.productId || !selectedCompany) return false;

    const today = new Date().toISOString().split('T')[0];
    const activeSchemes = schemes.filter(s => 
      s.companyId === selectedCompany.id &&
      s.status === 'active' &&
      s.validFrom <= today &&
      s.validTo >= today &&
      (s.products === 'all' || (Array.isArray(s.products) && s.products.includes(item.productId)))
    );

    return activeSchemes.length > 0;
  };

  const verifyScheme = (itemIndex: number) => {
    const item = items[itemIndex];
    const newVerified = [...schemeVerified];
    newVerified[itemIndex] = true;
    setSchemeVerified(newVerified);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const canSave = () => {
    if (!selectedCompany || items.length === 0 || !originalPurchase) return false;
    
    return items.every((item, idx) => {
      const basicValid = item.productId && item.qty > 0 && item.batch && item.expiry && item.rate > 0;
      const schemeValid = !hasActiveScheme(idx) || schemeVerified[idx];
      return basicValid && schemeValid;
    });
  };

  const handleSave = () => {
    if (!selectedCompany || !originalPurchase) return;

    const purchases = getFromStorage<Purchase>('purchases');
    const { subtotal, gst, total } = calculateTotals();
    
    const updatedPurchase: Purchase = {
      ...originalPurchase,
      companyId: selectedCompany.id,
      items,
      subtotal,
      gst,
      total,
      lastEditedAt: new Date().toISOString(),
    };

    // Update inventory - reverse old items and add new items
    const inventory = getFromStorage<InventoryBatch>('inventory');
    
    // Remove old inventory entries
    originalPurchase.items.forEach(oldItem => {
      const existingBatch = inventory.find(inv => 
        inv.productId === oldItem.productId && inv.batch === oldItem.batch
      );
      if (existingBatch) {
        existingBatch.qty -= (oldItem.qty + oldItem.freeQty);
      }
    });

    // Add new inventory entries
    items.forEach(item => {
      const existingBatch = inventory.find(inv => 
        inv.productId === item.productId && inv.batch === item.batch
      );

      if (existingBatch) {
        existingBatch.qty += item.qty + item.freeQty;
      } else {
        inventory.push({
          productId: item.productId,
          batch: item.batch,
          qty: item.qty + item.freeQty,
          purchaseDate: originalPurchase.date,
          expiry: item.expiry,
          rate: item.rate,
        });
      }
    });

    // Filter out zero quantity entries
    const cleanInventory = inventory.filter(inv => inv.qty > 0);
    saveToStorage('inventory', cleanInventory);

    // Update purchase
    const updatedPurchases = purchases.map(p => 
      p.id === originalPurchase.id ? updatedPurchase : p
    );
    saveToStorage('purchases', updatedPurchases);

    toast.success('Purchase updated successfully!');
    navigate('/purchase');
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Purchase">
        <Card className="max-w-4xl mx-auto p-6">
          <p className="text-center">Loading...</p>
        </Card>
      </DashboardLayout>
    );
  }

  const { subtotal, gst, total } = calculateTotals();

  return (
    <DashboardLayout title="Edit Purchase">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Purchase Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={selectedCompany?.id.toString()}
                onValueChange={(value) => {
                  const company = companies.find(c => c.id === parseInt(value));
                  setSelectedCompany(company || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={originalPurchase?.invoiceNo} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input value={originalPurchase?.date} disabled className="bg-muted" />
            </div>

            {originalPurchase?.lastEditedAt && (
              <div className="space-y-2">
                <Label>Last Edited</Label>
                <Input 
                  value={new Date(originalPurchase.lastEditedAt).toLocaleString('en-IN')} 
                  disabled 
                  className="bg-muted text-xs" 
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button onClick={addItem} variant="outline" size="sm">
              Add Product
            </Button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Product {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={item.productId.toString()}
                      onValueChange={(value) => updateItem(index, 'productId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.generic})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.qty || ''}
                      onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Free Quantity</Label>
                    <Input
                      type="number"
                      value={item.freeQty || ''}
                      onChange={(e) => updateItem(index, 'freeQty', parseInt(e.target.value) || 0)}
                      className={hasActiveScheme(index) ? 'bg-muted' : ''}
                      readOnly={hasActiveScheme(index)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={item.batch}
                      onChange={(e) => updateItem(index, 'batch', e.target.value)}
                      placeholder="Enter batch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={item.expiry}
                      onChange={(e) => updateItem(index, 'expiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      value={`₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      disabled
                      className="bg-muted font-semibold"
                    />
                  </div>
                </div>

                {hasActiveScheme(index) && !schemeVerified[index] && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warning">Scheme Available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This product has an active scheme. Please verify the free quantity.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => verifyScheme(index)}
                      >
                        Verify Scheme
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {items.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%):</span>
                <span className="font-semibold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/purchase')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave()} className="flex-1">
            Update Purchase
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
