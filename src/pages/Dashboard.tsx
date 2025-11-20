import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Receipt, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFromStorage } from '@/lib/storage';
import { Sale, Purchase, InventoryBatch, Product } from '@/types';

export default function Dashboard() {
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Sales</p>
                <p className="text-2xl font-bold">₹{todaySales.toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success font-medium">+12%</span>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Purchases</p>
                <p className="text-2xl font-bold">₹{totalPurchases.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-danger">₹{totalOutstanding.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-danger/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-danger" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stock Value</p>
                <p className="text-2xl font-bold">₹{stockValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-info/10 rounded-lg">
                <Package className="w-5 h-5 text-info" />
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {expiringProducts.length > 0 && (
            <Card className="p-4 border-l-4 border-l-danger">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                  <div>
                    <p className="font-semibold text-danger">Products Expiring Soon</p>
                    <p className="text-sm text-muted-foreground">
                      {expiringProducts.length} products expiring in 90 days - ₹{expiringValue.toLocaleString('en-IN')} value
                    </p>
                  </div>
                </div>
                <Button variant="link" size="sm">View Details</Button>
              </div>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card className="p-4 border-l-4 border-l-warning">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning">Low Stock Alert</p>
                    <p className="text-sm text-muted-foreground">
                      {lowStockProducts.length} products below minimum stock level
                    </p>
                  </div>
                </div>
                <Button variant="link" size="sm">View Details</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button className="w-full justify-start" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              New Purchase
            </Button>
            <Button className="w-full justify-start" size="lg">
              <Receipt className="w-5 h-5 mr-2" />
              New Sale
            </Button>
            <Button className="w-full justify-start" size="lg">
              <Receipt className="w-5 h-5 mr-2" />
              Receive Payment
            </Button>
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{sale.invoiceNo}</p>
                  <p className="text-sm text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{sale.total.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
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
