import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Customer, Product, RateMaster, InventoryBatch, SalesItem } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function NewSale() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SalesItem[]>([]);

  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');
  const rateMaster = getFromStorage<RateMaster>('rateMaster');
  const inventory = getFromStorage<InventoryBatch>('inventory');

  const addItem = () => {
    setItems([...items, {
      productId: 0,
      qty: 0,
      batch: '',
      rate: 0,
      amount: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getProductRate = (productId: number) => {
    if (!selectedCustomer) return 0;
    const rate = rateMaster.find(
      r => r.customerId === selectedCustomer.id && r.productId === productId
    );
    return rate?.rate || 0;
  };

  const getAvailableStock = (productId: number) => {
    return inventory
      .filter(inv => inv.productId === productId)
      .reduce((sum, inv) => sum + inv.qty, 0);
  };

  const getOldestBatch = (productId: number) => {
    const batches = inventory
      .filter(inv => inv.productId === productId && inv.qty > 0)
      .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
    return batches[0]?.batch || '';
  };

  const updateItem = (index: number, field: keyof SalesItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      newItems[index].rate = getProductRate(value);
      newItems[index].batch = getOldestBatch(value);
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
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Step 1: Select Customer</h2>
            
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
                        <span className="text-lg font-bold text-primary">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{customer.name}</p>
                          <Badge variant={customer.type === 'A' ? 'default' : customer.type === 'B' ? 'secondary' : 'outline'}>
                            Type {customer.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{customer.phone}</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Credit Limit:</span>
                            <span className="font-medium">
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
          </Card>
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
            <h2 className="text-xl font-semibold">Add Products</h2>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => {
              const availableStock = getAvailableStock(item.productId);
              const stockColor = availableStock > 10 ? 'success' : availableStock > 5 ? 'warning' : 'danger';
              
              return (
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
                              {product.name} - Stock: {getAvailableStock(product.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.productId > 0 && (
                        <Badge variant={stockColor === 'success' ? 'default' : 'destructive'}>
                          Available: {availableStock}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        max={availableStock}
                        value={item.qty || ''}
                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Batch (FIFO)</Label>
                      <Input
                        value={item.batch}
                        className="bg-muted"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rate per Unit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate || ''}
                        className="bg-muted"
                        readOnly
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
                </div>
              );
            })}

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
          <>
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
