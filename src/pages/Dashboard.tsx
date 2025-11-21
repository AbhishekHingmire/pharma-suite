import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Receipt, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFromStorage, formatAmount, formatCompactAmount } from '@/lib/storage';
import { Sale, Purchase, InventoryBatch, Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const sales = getFromStorage<Sale>('sales');
  const purchases = getFromStorage<Purchase>('purchases');
  const inventory = getFromStorage<InventoryBatch>('inventory');
  const products = getFromStorage<Product>('products');

  // Calculate metrics
  const todaySales = sales
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.total, 0);

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalOutstanding = sales
    .filter(s => s.status !== 'paid')
    .reduce((sum, s) => sum + (s.total - (s.paidAmount || 0)), 0);

  const stockValue = inventory.reduce((sum, inv) => {
    return sum + (inv.qty * inv.rate);
  }, 0);

  // Expiring products
  const today = new Date();
  const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringProducts = inventory.filter(inv => {
    const expiryDate = new Date(inv.expiry);
    return expiryDate <= ninetyDaysLater && expiryDate > today;
  });

  const expiringValue = expiringProducts.reduce((sum, inv) => sum + (inv.qty * inv.rate), 0);

  // Low stock products
  const lowStockProducts = products.filter(p => {
    const totalQty = inventory
      .filter(inv => inv.productId === p.id)
      .reduce((sum, inv) => sum + inv.qty, 0);
    return totalQty < p.minStock;
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">Today's Sales</p>
                <p 
                  className="text-lg font-bold truncate" 
                  title={formatAmount(todaySales)}
                >
                  <span className="md:hidden">{formatCompactAmount(todaySales)}</span>
                  <span className="hidden md:inline">{formatAmount(todaySales)}</span>
                </p>
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-success flex-shrink-0" />
                  <span className="text-xs text-success font-medium">+12%</span>
                </div>
              </div>
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Receipt className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">Total Purchases</p>
                <p 
                  className="text-lg font-bold truncate"
                  title={formatAmount(totalPurchases)}
                >
                  <span className="md:hidden">{formatCompactAmount(totalPurchases)}</span>
                  <span className="hidden md:inline">{formatAmount(totalPurchases)}</span>
                </p>
              </div>
              <div className="p-1.5 md:p-2 bg-secondary/10 rounded-lg flex-shrink-0">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">Outstanding</p>
                <p 
                  className="text-lg font-bold text-danger truncate"
                  title={formatAmount(totalOutstanding)}
                >
                  <span className="md:hidden">{formatCompactAmount(totalOutstanding)}</span>
                  <span className="hidden md:inline">{formatAmount(totalOutstanding)}</span>
                </p>
              </div>
              <div className="p-1.5 md:p-2 bg-danger/10 rounded-lg flex-shrink-0">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-danger" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">Stock Value</p>
                <p 
                  className="text-lg font-bold truncate"
                  title={formatAmount(stockValue)}
                >
                  <span className="md:hidden">{formatCompactAmount(stockValue)}</span>
                  <span className="hidden md:inline">{formatAmount(stockValue)}</span>
                </p>
              </div>
              <div className="p-1.5 md:p-2 bg-info/10 rounded-lg flex-shrink-0">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-info" />
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {(expiringProducts.length > 0 || lowStockProducts.length > 0) && (
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Alerts</h3>
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
                  {(expiringProducts.length > 0 ? 1 : 0) + (lowStockProducts.length > 0 ? 1 : 0)} {((expiringProducts.length > 0 ? 1 : 0) + (lowStockProducts.length > 0 ? 1 : 0)) === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>
              <div className="space-y-2">
                {expiringProducts.length > 0 && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-danger/5 border-l-4 border-danger hover:bg-danger/10 transition-colors">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="p-1.5 bg-danger/10 rounded-lg shrink-0">
                        <AlertCircle className="w-4 h-4 text-danger" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-danger text-sm">Products Expiring Soon</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {expiringProducts.length} product{expiringProducts.length > 1 ? 's' : ''} expiring in 90 days · {formatCompactAmount(expiringValue)} value
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-danger hover:text-danger hover:bg-danger/10 h-8 text-xs shrink-0"
                      onClick={() => navigate('/inventory/stock')}
                    >
                      View
                    </Button>
                  </div>
                )}

                {lowStockProducts.length > 0 && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-warning/5 border-l-4 border-warning hover:bg-warning/10 transition-colors">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="p-1.5 bg-warning/10 rounded-lg shrink-0">
                        <Package className="w-4 h-4 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-warning text-sm">Low Stock Alert</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} below minimum stock level
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-warning hover:text-warning hover:bg-warning/10 h-8 text-xs shrink-0"
                      onClick={() => navigate('/inventory/stock')}
                    >
                      View
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {user?.role === 'admin' && (
              <Button className="w-full h-auto py-2.5 px-2 md:px-4 md:py-3 justify-center md:justify-start text-xs md:text-sm" size="lg" onClick={() => navigate('/purchase/new')}>
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden sm:inline ml-1.5">New Purchase</span>
                <span className="sm:hidden ml-1">Purchase</span>
              </Button>
            )}
            <Button className="w-full h-auto py-2.5 px-2 md:px-4 md:py-3 justify-center md:justify-start text-xs md:text-sm" size="lg" onClick={() => navigate('/sales/new')}>
              <Receipt className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
              <span className="hidden sm:inline ml-1.5">New Sale</span>
              <span className="sm:hidden ml-1">Sale</span>
            </Button>
            {user?.role === 'admin' && (
              <Button className="w-full h-auto py-2.5 px-2 md:px-4 md:py-3 justify-center md:justify-start text-xs md:text-sm" size="lg" onClick={() => navigate('/payments/receive')}>
                <Receipt className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden sm:inline ml-1.5">Receive Payment</span>
                <span className="sm:hidden ml-1">Payment</span>
              </Button>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm md:text-base">{sale.invoiceNo}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-semibold truncate text-sm md:text-base" title={formatAmount(sale.total)}>
                      {formatCompactAmount(sale.total)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    sale.status === 'paid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
