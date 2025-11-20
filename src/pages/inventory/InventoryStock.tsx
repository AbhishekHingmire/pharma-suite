import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, Package, Eye } from 'lucide-react';
import { getFromStorage } from '@/lib/storage';
import { InventoryBatch, Product } from '@/types';
import { InventoryBatchModal } from '@/components/InventoryBatchModal';
import { cn } from '@/lib/utils';

export default function InventoryStock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring' | 'out'>('all');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const inventory = getFromStorage<InventoryBatch>('inventory');
  const products = getFromStorage<Product>('products');

  // Group inventory by product
  const groupedInventory = products.map(product => {
    const batches = inventory.filter(inv => inv.productId === product.id);
    const totalQty = batches.reduce((sum, b) => sum + b.qty, 0);
    const stockValue = batches.reduce((sum, b) => sum + (b.qty * b.rate), 0);
    const oldestExpiry = batches.length > 0 
      ? batches.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())[0].expiry
      : null;

    // Status determination
    const today = new Date();
    const expiryDate = oldestExpiry ? new Date(oldestExpiry) : null;
    const daysUntilExpiry = expiryDate ? Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    let status: 'good' | 'warning' | 'danger' = 'good';
    if (totalQty === 0) status = 'danger';
    else if (totalQty < product.minStock || daysUntilExpiry < 90) status = 'danger';
    else if (totalQty < product.minStock * 1.5 || daysUntilExpiry < 180) status = 'warning';

    return {
      product,
      totalQty,
      batches: batches.length,
      oldestExpiry,
      stockValue,
      status,
      batchDetails: batches
    };
  });

  const filteredInventory = groupedInventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.generic.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'low') matchesFilter = item.totalQty < item.product.minStock;
    else if (filter === 'expiring') {
      const today = new Date();
      const expiryDate = item.oldestExpiry ? new Date(item.oldestExpiry) : null;
      const days = expiryDate ? Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      matchesFilter = days < 90 && days > 0;
    }
    else if (filter === 'out') matchesFilter = item.totalQty === 0;

    return matchesSearch && matchesFilter;
  });

  const getStatusDot = (status: string) => {
    const colors = {
      good: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger'
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors]}`} />;
  };

  return (
    <DashboardLayout title="Inventory">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('low')}
            >
              Low Stock
            </Button>
            <Button
              variant={filter === 'expiring' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expiring')}
            >
              Expiring Soon
            </Button>
            <Button
              variant={filter === 'out' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('out')}
            >
              Out of Stock
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="p-2 md:p-3">
            <h3 className="text-xs font-semibold mb-1 truncate">Total Batches</h3>
            <p className="text-lg font-bold">{inventory.length}</p>
          </Card>
          <Card className="p-2 md:p-3">
            <h3 className="text-xs font-semibold mb-1 truncate">Total Value</h3>
            <p className="text-lg font-bold truncate">
              ₹{inventory.reduce((sum, inv) => sum + (inv.qty * inv.rate), 0).toLocaleString('en-IN')}
            </p>
          </Card>
          <Card className="p-2 md:p-3">
            <h3 className="text-xs font-semibold mb-1 truncate">Oldest Expiry</h3>
            <p className="text-sm md:text-md text-danger truncate">
              {inventory.length > 0 && (() => {
                const sortedByExpiry = [...inventory].sort((a, b) => 
                  new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
                );
                return new Date(sortedByExpiry[0].expiry).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  year: 'numeric' 
                });
              })()}
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold uppercase">Product</th>
                      <th className="text-right p-3 text-sm font-semibold uppercase">Total Qty</th>
                      <th className="text-right p-3 text-sm font-semibold uppercase">Batches</th>
                      <th className="text-left p-3 text-sm font-semibold uppercase">Oldest Expiry</th>
                      <th className="text-right p-3 text-sm font-semibold uppercase">Stock Value</th>
                      <th className="text-center p-3 text-sm font-semibold uppercase">Status</th>
                      <th className="text-center p-3 text-sm font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr 
                        key={item.product.id} 
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-3">
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              item.totalQty === 0 && "text-danger"
                            )}>{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">{item.product.generic}</p>
                          </div>
                        </td>
                        {item.totalQty > 0 ? (
                          <>
                            <td className="p-3 text-sm text-right font-semibold">{item.totalQty}</td>
                            <td className="p-3 text-sm text-right">{item.batches}</td>
                            <td className="p-3 text-sm">
                              {item.oldestExpiry ? new Date(item.oldestExpiry).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-3 text-sm text-right font-semibold">
                              ₹{item.stockValue.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusDot(item.status)}
                                <span className="text-sm capitalize">{item.status}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProductId(item.product.id);
                                    setModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <td colSpan={6} className="p-3 text-center text-sm text-muted-foreground">
                            Out of Stock
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredInventory.map((item) => (
              <Card 
                key={item.product.id} 
                className="p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className={cn(
                      "font-semibold",
                      item.totalQty === 0 && "text-danger"
                    )}>{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.product.generic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.totalQty > 0 && (
                      <>
                        {getStatusDot(item.status)}
                        <Badge variant={item.totalQty > item.product.minStock ? 'default' : 'destructive'}>
                          {item.totalQty}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedProductId(item.product.id);
                            setModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {item.totalQty > 0 ? (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground truncate">Batches</p>
                      <p className="font-medium text-sm">{item.batches}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground truncate">Value</p>
                      <p className="font-medium text-sm truncate">₹{item.stockValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground truncate">Oldest Expiry</p>
                      <p className="font-medium text-sm truncate">
                        {item.oldestExpiry ? new Date(item.oldestExpiry).toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">Out of Stock</p>
                )}
              </Card>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </Card>
          )}
        </div>
      </div>

      {/* Batch Details Modal */}
      <InventoryBatchModal 
        productId={selectedProductId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </DashboardLayout>
  );
}
