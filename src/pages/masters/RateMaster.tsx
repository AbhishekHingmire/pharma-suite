import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import { Customer, Product, RateMaster } from '@/types';
import { toast } from 'sonner';
import { Search, Copy, Percent } from 'lucide-react';

export default function RateMasterPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [rates, setRates] = useState<RateMaster[]>([]);
  const [bulkMargin, setBulkMargin] = useState('');

  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');
  const allRates = getFromStorage<RateMaster>('rateMaster');

  const handleCustomerSelect = (customerId: string) => {
    const id = parseInt(customerId);
    setSelectedCustomerId(id);
    
    // Load rates for this customer
    const customerRates = allRates.filter(r => r.customerId === id);
    setRates(customerRates);
  };

  const handleRateChange = (productId: number, rate: number) => {
    setRates(prev => {
      const existing = prev.find(r => r.productId === productId);
      if (existing) {
        return prev.map(r => r.productId === productId ? { ...r, rate } : r);
      } else {
        return [...prev, { customerId: selectedCustomerId!, productId, rate }];
      }
    });
  };

  const handleMarginChange = (productId: number, margin: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Get last purchase rate (mock - in real app, get from inventory)
    const baseCost = 100; // Mock base cost
    const rate = baseCost * (1 + margin / 100);
    handleRateChange(productId, rate);
  };

  const handleBulkMargin = () => {
    if (!bulkMargin || !selectedCustomerId) return;
    
    const margin = parseFloat(bulkMargin);
    products.forEach(product => {
      const baseCost = 100; // Mock
      const rate = baseCost * (1 + margin / 100);
      handleRateChange(product.id, rate);
    });
    
    toast.success(`Applied ${margin}% margin to all products`);
    setBulkMargin('');
  };

  const handleSave = () => {
    if (!selectedCustomerId) return;

    // Update rates in storage
    let updatedRates = allRates.filter(r => r.customerId !== selectedCustomerId);
    updatedRates = [...updatedRates, ...rates];
    
    saveToStorage('rateMaster', updatedRates);
    toast.success('Rates saved successfully!');
  };

  const getProductRate = (productId: number) => {
    return rates.find(r => r.productId === productId)?.rate || 0;
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <DashboardLayout title="Rate Master">
      <div className="space-y-4">
        {!selectedCustomerId ? (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Select Customer</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a customer to manage their product rates
                </p>
              </div>

              <div className="space-y-2">
                <Label>Customer</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{customer.name}</span>
                          <span className="text-xs text-muted-foreground">Type {customer.type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{selectedCustomer?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Type {selectedCustomer?.type} • {products.length} products
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomerId(null)}
                >
                  Change Customer
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-end gap-2 flex-1 min-w-[200px]">
                  <div className="flex-1">
                    <Label className="text-xs">Set Margin for All</Label>
                    <Input
                      type="number"
                      placeholder="Enter margin %"
                      value={bulkMargin}
                      onChange={(e) => setBulkMargin(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Button size="sm" onClick={handleBulkMargin} className="h-9">
                    <Percent className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                </div>

                <Button variant="outline" size="sm" className="h-9">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy from Customer
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Base Cost</TableHead>
                      <TableHead>Margin %</TableHead>
                      <TableHead>Selling Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => {
                      const companies = getFromStorage<{ id: number; name: string }>('companies');
                      const company = companies.find(c => c.id === product.companyId);
                      const rate = getProductRate(product.id);
                      const baseCost = 100; // Mock
                      const margin = rate > 0 ? ((rate - baseCost) / baseCost * 100).toFixed(1) : '0';

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.generic}</div>
                          </TableCell>
                          <TableCell className="text-sm">{company?.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            ₹{baseCost.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={margin}
                              onChange={(e) => handleMarginChange(product.id, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={rate || ''}
                              onChange={(e) => handleRateChange(product.id, parseFloat(e.target.value) || 0)}
                              className="w-24 h-8 text-sm"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={handleSave}>
                  Save All Rates
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
