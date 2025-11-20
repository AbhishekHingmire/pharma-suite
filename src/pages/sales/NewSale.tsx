import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Customer, Product, RateMaster, InventoryBatch, SalesItem, Company } from '@/types';
import { getSuggestedPrice, getAvailableBatches, calculateDaysToExpiry } from '@/lib/pricing';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function NewSale() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SalesItem[]>([]);

  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');
  const companies = getFromStorage<Company>('companies');
  const inventory = getFromStorage<InventoryBatch>('inventory');
  
  const [selectedBatches, setSelectedBatches] = useState<{ [key: number]: InventoryBatch | null }>({});

  const addItem = () => {
    setItems([...items, {
      productId: 0,
      companyId: 0,
      brandName: '',
      qty: 0,
      batch: '',
      rate: 0,
      amount: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    const newSelected = { ...selectedBatches };
    delete newSelected[index];
    setSelectedBatches(newSelected);
  };

  const selectBatch = (index: number, batch: InventoryBatch) => {
    const newItems = [...items];
    const pricing = selectedCustomer ? getSuggestedPrice(batch, selectedCustomer) : null;
    
    newItems[index] = {
      ...newItems[index],
      companyId: batch.companyId,
      brandName: batch.brandName,
      batch: batch.batch,
      rate: pricing?.price || 0,
    };
    
    if (newItems[index].qty > 0) {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }
    
    setItems(newItems);
    setSelectedBatches({ ...selectedBatches, [index]: batch });
  };

  const getAvailableStock = (productId: number) => {
    return inventory
      .filter(inv => inv.productId === productId)
      .reduce((sum, inv) => sum + inv.qty, 0);
  };

  const updateItem = (index: number, field: keyof SalesItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      // Auto-select oldest batch (FIFO) when product changes
      const batches = getAvailableBatches(value);
      if (batches.length > 0 && selectedCustomer) {
        selectBatch(index, batches[0]);
      }
    }

    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const canSave = () => {
    if (!selectedCustomer || items.length === 0) return false;
    
    const { total } = calculateTotals();
    const availableCredit = selectedCustomer.creditLimit - selectedCustomer.outstanding;
    
    if (total > availableCredit) return false;
    
    return items.every(item => 
      item.productId && item.qty > 0 && item.batch && item.rate > 0
    );
  };

  const handleSave = () => {
    if (!selectedCustomer) return;

    const sales = getFromStorage('sales');
    const { subtotal, gst, total } = calculateTotals();
    
    const newSale = {
      id: getNextId('sales'),
      customerId: selectedCustomer.id,
      invoiceNo: `RM/${new Date().getFullYear()}/${String(sales.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      gst,
      total,
      status: 'unpaid' as const,
    };

    saveToStorage('sales', [...sales, newSale]);

    // Update inventory
    const updatedInventory = getFromStorage<InventoryBatch>('inventory');
    items.forEach(item => {
      const batch = updatedInventory.find(
        inv => inv.productId === item.productId && inv.batch === item.batch
      );
      if (batch) {
        batch.qty -= item.qty;
      }
    });
    saveToStorage('inventory', updatedInventory);

    // Update customer outstanding
    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, outstanding: c.outstanding + total }
        : c
    );
    saveToStorage('customers', updatedCustomers);

    toast.success('Sale saved successfully!');
    navigate('/sales');
  };

  if (step === 1) {
    return (
      <DashboardLayout title="New Sale">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-lg font-bold">Step 1: Select Customer</h2>
          
          <div className="space-y-3">
              {customers.map((customer) => {
                const creditUsed = (customer.outstanding / customer.creditLimit) * 100;
                const creditColor = creditUsed > 90 ? 'bg-danger' : creditUsed > 70 ? 'bg-warning' : 'bg-success';
                
                return (
                  <Card
                    key={customer.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:shadow-md",
                      selectedCustomer?.id === customer.id && "border-primary border-2"
                    )}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-md font-bold text-primary">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-md">{customer.name}</p>
                          <Badge variant={customer.type === 'A' ? 'default' : customer.type === 'B' ? 'secondary' : 'outline'}>
                            Type {customer.type}
                          </Badge>
                        </div>
                        <p className="text-md text-muted-foreground mb-2">{customer.phone}</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-md">
                            <span className="text-muted-foreground">Credit Limit:</span>
                            <span className="font-semibold">
                              ₹{customer.outstanding.toLocaleString('en-IN')} / ₹{customer.creditLimit.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${creditColor}`}
                              style={{ width: `${Math.min(creditUsed, 100)}%` }}
                            />
                          </div>
                          {customer.outstanding > 0 && (
                            <p className="text-sm text-danger">
                              Outstanding: ₹{customer.outstanding.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button
              className="w-full mt-6"
              disabled={!selectedCustomer}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { subtotal, gst, total } = calculateTotals();
  const availableCredit = selectedCustomer ? selectedCustomer.creditLimit - selectedCustomer.outstanding : 0;
  const creditExceeded = total > availableCredit;

  return (
    <DashboardLayout title="New Sale">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Customer</p>
              <p className="font-semibold">{selectedCustomer?.name}</p>
              <p className="text-sm">
                Available Credit: ₹{availableCredit.toLocaleString('en-IN')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Change
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Add Products</h2>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => {
              const availableStock = getAvailableStock(item.productId);
              const stockColor = availableStock > 10 ? 'success' : availableStock > 5 ? 'warning' : 'danger';
              const availableBatches = item.productId ? getAvailableBatches(item.productId) : [];
              const selectedBatch = selectedBatches[index];
              
              return (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-md">Product {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Product Selection */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Product</Label>
                      <Select
                        value={item.productId.toString()}
                        onValueChange={(value) => updateItem(index, 'productId', parseInt(value))}
                      >
                        <SelectTrigger className="text-md">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()} className="text-md">
                              {product.name} - Stock: {getAvailableStock(product.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.productId > 0 && (
                        <Badge variant={stockColor === 'success' ? 'default' : 'destructive'} className="text-xs">
                          Total Available: {availableStock}
                        </Badge>
                      )}
                    </div>

                    {/* Batch Selection */}
                    {availableBatches.length > 0 && selectedCustomer && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                        <Label className="text-sm font-semibold">Select Batch (FIFO - Oldest First)</Label>
                        <RadioGroup
                          value={selectedBatch?.batch || ''}
                          onValueChange={(batchNo) => {
                            const batch = availableBatches.find(b => b.batch === batchNo);
                            if (batch) selectBatch(index, batch);
                          }}
                        >
                          {availableBatches.map((batch) => {
                            const company = companies.find(c => c.id === batch.companyId);
                            const pricing = getSuggestedPrice(batch, selectedCustomer);
                            const daysToExpiry = calculateDaysToExpiry(batch.expiry);
                            const isExpiringSoon = daysToExpiry < 90;
                            
                            return (
                              <div key={batch.batch} className="flex items-start space-x-3 p-3 rounded border bg-white hover:bg-slate-50 transition-colors">
                                <RadioGroupItem value={batch.batch} id={`batch-${index}-${batch.batch}`} className="mt-1" />
                                <label htmlFor={`batch-${index}-${batch.batch}`} className="flex-1 cursor-pointer">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <img src={company?.logo} alt={company?.name} className="w-10 h-10 rounded" />
                                      <div>
                                        <div className="font-semibold text-md">{batch.brandName}</div>
                                        <div className="text-xs text-muted-foreground">{company?.name}</div>
                                      </div>
                                    </div>
                                    {isExpiringSoon && (
                                      <Badge variant="destructive" className="text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        {daysToExpiry} days
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                    <div>
                                      <span className="text-xs text-muted-foreground">Batch:</span>
                                      <span className="ml-1 font-mono font-medium text-xs">{batch.batch}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">Stock:</span>
                                      <span className="ml-1 font-bold text-xs">{batch.qty} units</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">Expiry:</span>
                                      <span className="ml-1 text-xs">
                                        {new Date(batch.expiry).toLocaleDateString('en-IN', {
                                          month: 'short',
                                          year: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">Cost:</span>
                                      <span className="ml-1 text-xs">₹{batch.rate.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-green-700">
                                        Suggested Selling Price ({pricing.marginPercent}% margin):
                                      </span>
                                      <span className="text-md font-bold text-green-700">₹{pricing.price.toFixed(2)}/unit</span>
                                    </div>
                                    {pricing.minPriceApplied && (
                                      <p className="text-xs text-orange-600 mt-1">* Minimum price applied</p>
                                    )}
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    )}

                    {/* Quantity and Rate */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedBatch?.qty || availableStock}
                          value={item.qty || ''}
                          onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                          className="text-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Rate per Unit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="text-md"
                        />
                        {selectedBatch && item.rate < selectedBatch.rate && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Selling below cost!
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Amount</Label>
                      <Input
                        value={`₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                        className="bg-muted font-semibold text-md"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-md text-muted-foreground mb-4">No products added yet</p>
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </div>
            )}
          </div>
        </Card>

        {items.length > 0 && (
          <>
            <Card className="p-6 sticky top-4">
              <h3 className="text-md font-bold mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (12%):</span>
                  <span className="font-bold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-md font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Card>

            {creditExceeded && (
              <Card className="p-4 border-danger bg-danger/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                  <div>
                    <p className="font-semibold text-danger">Credit Limit Exceeded</p>
                    <p className="text-sm text-muted-foreground">
                      This sale exceeds available credit by ₹{(total - availableCredit).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/sales')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave()} className="flex-1">
            Generate Invoice
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
