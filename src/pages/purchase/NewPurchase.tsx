import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Company, Product, Scheme, PurchaseItem, InventoryBatch } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function NewPurchase() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [schemeVerified, setSchemeVerified] = useState<boolean[]>([]);

  const companies = getFromStorage<Company>('companies');
  const products = getFromStorage<Product>('products');
  const schemes = getFromStorage<Scheme>('schemes');

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

    // Calculate amount
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }

    // Check for schemes
    if (field === 'productId' || field === 'qty') {
      const scheme = schemes.find(s => 
        s.companyId === selectedCompany?.id &&
        s.status === 'active' &&
        (s.products === 'all' || (Array.isArray(s.products) && s.products.includes(newItems[index].productId)))
      );

      if (scheme && scheme.type === 'freeQty' && newItems[index].qty >= (scheme.buyQty || 0)) {
        newItems[index].freeQty = scheme.freeQty || 0;
      }
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const hasActiveScheme = (index: number) => {
    return items[index].freeQty > 0;
  };

  const canSave = () => {
    if (items.length === 0) return false;
    
    return items.every((item, idx) => {
      const basicValid = item.productId && item.qty > 0 && item.batch && item.expiry && item.rate > 0;
      const schemeValid = !hasActiveScheme(idx) || schemeVerified[idx];
      return basicValid && schemeValid;
    });
  };

  const handleSave = () => {
    if (!selectedCompany) return;

    const purchases = getFromStorage('purchases');
    const { subtotal, gst, total } = calculateTotals();
    
    const newPurchase = {
      id: getNextId('purchases'),
      companyId: selectedCompany.id,
      invoiceNo: `SP/${new Date().getFullYear()}/${String(purchases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      gst,
      total,
    };

    saveToStorage('purchases', [...purchases, newPurchase]);

    // Update inventory
    const inventory = getFromStorage<InventoryBatch>('inventory');
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
          purchaseDate: new Date().toISOString().split('T')[0],
          expiry: item.expiry,
          rate: item.rate,
        });
      }
    });
    saveToStorage('inventory', inventory);

    toast.success('Purchase saved successfully!');
    navigate('/purchase');
  };

  if (step === 1) {
    return (
      <DashboardLayout title="New Purchase">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-xl font-semibold mb-6">Step 1: Select Company</h2>
          
          <div className="space-y-4">
            {companies.map((company) => (
              <Card
                key={company.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  selectedCompany?.id === company.id && "border-primary border-2"
                )}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-center gap-4">
                  <img src={company.logo} alt={company.name} className="w-12 h-12 rounded" />
                  <div className="flex-1">
                    <p className="font-semibold">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.contact}</p>
                    <p className="text-sm text-muted-foreground">Payment: {company.paymentTerms}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            className="w-full mt-6"
            disabled={!selectedCompany}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const { subtotal, gst, total } = calculateTotals();

  return (
    <DashboardLayout title="New Purchase">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Company</p>
              <p className="font-semibold">{selectedCompany?.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Change
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add Products</h2>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
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
                      className="bg-muted"
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

                  <div className="space-y-2 md:col-span-2">
                    <Label>Amount</Label>
                    <Input
                      value={`₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      className="bg-muted font-semibold"
                      readOnly
                    />
                  </div>
                </div>

                {hasActiveScheme(index) && (
                  <Card className="p-4 bg-primary/5 border-primary">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-primary">Active Scheme Applied</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Buy {schemes.find(s => s.companyId === selectedCompany?.id)?.buyQty} Get {item.freeQty} Free
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="checkbox"
                            id={`scheme-${index}`}
                            checked={schemeVerified[index]}
                            onChange={(e) => {
                              const newVerified = [...schemeVerified];
                              newVerified[index] = e.target.checked;
                              setSchemeVerified(newVerified);
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`scheme-${index}`} className="text-sm">
                            Free quantity received and verified
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No products added yet</p>
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </div>
            )}
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
            Save Purchase
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
