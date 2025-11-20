import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import { Product, RateMaster, InventoryBatch } from '@/types';
import { toast } from 'sonner';
import { Percent, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateSellingPrice } from '@/lib/pricing';

type CustomerType = 'A' | 'B' | 'C';

export default function RateMasterPage() {
  const [selectedType, setSelectedType] = useState<CustomerType>('A');
  const [rates, setRates] = useState<RateMaster[]>([]);
  const [bulkMargin, setBulkMargin] = useState('');

  const products = getFromStorage<Product>('products');
  const inventory = getFromStorage<InventoryBatch>('inventory');
  const allRates = getFromStorage<RateMaster>('rateMaster');

  useEffect(() => {
    // Load rates for selected customer type
    const typeRates = allRates.filter(r => r.customerType === selectedType);
    setRates(typeRates);
  }, [selectedType, allRates]);

  const getLatestBatchCost = (productId: number): number => {
    const productBatches = inventory
      .filter(b => b.productId === productId && b.qty > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return productBatches[0]?.rate || 0;
  };

  const handleMarginChange = (productId: number, margin: number) => {
    setRates(prev => {
      const existing = prev.find(r => r.productId === productId && r.customerType === selectedType);
      if (existing) {
        return prev.map(r => 
          r.productId === productId && r.customerType === selectedType 
            ? { ...r, marginPercent: margin } 
            : r
        );
      } else {
        return [...prev, { 
          productId, 
          customerType: selectedType, 
          marginPercent: margin,
          minPrice: undefined 
        }];
      }
    });
  };

  const handleMinPriceChange = (productId: number, minPrice: number | undefined) => {
    setRates(prev => {
      return prev.map(r => 
        r.productId === productId && r.customerType === selectedType 
          ? { ...r, minPrice } 
          : r
      );
    });
  };

  const handleBulkMargin = () => {
    if (!bulkMargin) return;
    
    const margin = parseFloat(bulkMargin);
    if (isNaN(margin) || margin < 0) {
      toast.error('Please enter a valid margin percentage');
      return;
    }

    products.forEach(product => {
      handleMarginChange(product.id, margin);
    });
    
    toast.success(`Applied ${margin}% margin to all products for Type ${selectedType}`);
    setBulkMargin('');
  };

  const handleSave = () => {
    // Update rates in storage
    let updatedRates = allRates.filter(r => r.customerType !== selectedType);
    updatedRates = [...updatedRates, ...rates];
    
    saveToStorage('rateMaster', updatedRates);
    toast.success(`Rates saved for Customer Type ${selectedType}!`);
  };

  const getProductMargin = (productId: number): number => {
    return rates.find(r => r.productId === productId)?.marginPercent || 0;
  };

  const getProductMinPrice = (productId: number): number | undefined => {
    return rates.find(r => r.productId === productId)?.minPrice;
  };

  return (
    <DashboardLayout title="Rate Master">
      <div className="space-y-4">
        {/* Customer Type Selection */}
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Customer Type Based Pricing</h2>
              <p className="text-sm text-muted-foreground">
                Set margin percentages for each customer type. Rates auto-calculate from batch costs.
              </p>
            </div>

            <div className="flex gap-2">
              {(['A', 'B', 'C'] as CustomerType[]).map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type)}
                  className="flex-1"
                >
                  Type {type}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-end gap-2 flex-1">
              <div className="flex-1">
                <Label className="text-sm">Set Margin for All Products</Label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={bulkMargin}
                  onChange={(e) => setBulkMargin(e.target.value)}
                  className="h-9"
                  min="0"
                  step="0.1"
                />
              </div>
              <Button size="sm" onClick={handleBulkMargin} className="h-9">
                <Percent className="w-4 h-4 mr-1" />
                Apply to Type {selectedType}
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table - Desktop */}
        <Card className="p-4 hidden md:block">
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold uppercase">Product</th>
                  <th className="text-right p-3 text-sm font-semibold uppercase">Latest Cost</th>
                  <th className="text-right p-3 text-sm font-semibold uppercase">Margin %</th>
                  <th className="text-right p-3 text-sm font-semibold uppercase">Min Price (Optional)</th>
                  <th className="text-right p-3 text-sm font-semibold uppercase">Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const baseCost = getLatestBatchCost(product.id);
                  const margin = getProductMargin(product.id);
                  const minPrice = getProductMinPrice(product.id);
                  const sellingPrice = baseCost > 0 
                    ? calculateSellingPrice(baseCost, margin, minPrice)
                    : 0;
                  const isBelowMin = minPrice && sellingPrice === minPrice;

                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.generic}</div>
                      </td>
                      <td className="p-3 text-right">
                        {baseCost > 0 ? (
                          <span className="text-sm text-muted-foreground">₹{baseCost.toFixed(2)}</span>
                        ) : (
                          <Badge variant="outline" className="text-xs">No Stock</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Input
                          type="number"
                          placeholder="0"
                          value={margin || ''}
                          onChange={(e) => handleMarginChange(product.id, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-sm text-right"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Input
                          type="number"
                          placeholder="Optional"
                          value={minPrice || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleMinPriceChange(product.id, val ? parseFloat(val) : undefined);
                          }}
                          className="w-24 h-8 text-sm text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {baseCost > 0 ? (
                            <>
                              <span className="text-sm font-semibold">₹{sellingPrice.toFixed(2)}</span>
                              {isBelowMin && (
                                <Badge variant="secondary" className="text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Min
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Live pricing based on latest batch costs</span>
            </div>
            <Button onClick={handleSave}>
              Save Margins
            </Button>
          </div>
        </Card>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {products.map(product => {
            const baseCost = getLatestBatchCost(product.id);
            const margin = getProductMargin(product.id);
            const minPrice = getProductMinPrice(product.id);
            const sellingPrice = baseCost > 0 
              ? calculateSellingPrice(baseCost, margin, minPrice)
              : 0;
            const isBelowMin = minPrice && sellingPrice === minPrice;

            return (
              <Card key={product.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-sm">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.generic}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Latest Cost</Label>
                      {baseCost > 0 ? (
                        <p className="text-md font-semibold">₹{baseCost.toFixed(2)}</p>
                      ) : (
                        <Badge variant="outline" className="text-xs mt-1">No Stock</Badge>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Selling Price</Label>
                      {baseCost > 0 ? (
                        <div className="flex items-center gap-1">
                          <p className="text-md font-bold">₹{sellingPrice.toFixed(2)}</p>
                          {isBelowMin && (
                            <Badge variant="secondary" className="text-[10px] px-1">Min</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm">Margin %</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={margin || ''}
                        onChange={(e) => handleMarginChange(product.id, parseFloat(e.target.value) || 0)}
                        className="h-9 text-sm"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Min Price (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={minPrice || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleMinPriceChange(product.id, val ? parseFloat(val) : undefined);
                        }}
                        className="h-9 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card className="p-4 sticky bottom-0 bg-background border-t-2">
            <Button onClick={handleSave} className="w-full">
              Save Margins for Type {selectedType}
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
