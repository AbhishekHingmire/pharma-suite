import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Receipt, AlertCircle, Package, Wallet, Users, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFromStorage, formatAmount, formatCompactAmount } from '@/lib/storage';
import { Sale, Purchase, InventoryBatch, Product, Customer } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type Period = 'today' | 'week' | 'month';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('today');
  
  const sales = getFromStorage<Sale>('sales');
  const purchases = getFromStorage<Purchase>('purchases');
  const inventory = getFromStorage<InventoryBatch>('inventory');
  const products = getFromStorage<Product>('products');
  const customers = getFromStorage<Customer>('customers');

  // Calculate date ranges based on period
  const getDateRange = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'today') {
      return { start: todayStr, end: todayStr };
    } else if (period === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: weekAgo.toISOString().split('T')[0], end: todayStr };
    } else {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: monthAgo.toISOString().split('T')[0], end: todayStr };
    }
  };

  const dateRange = getDateRange();
  
  const filterByPeriod = <T extends { date: string }>(items: T[]) => {
    return items.filter(item => item.date >= dateRange.start && item.date <= dateRange.end);
  };

  // Calculate metrics
  const filteredSales = filterByPeriod(sales);
  const filteredPurchases = filterByPeriod(purchases);
  
  const todaySales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
  const totalOutstanding = sales
    .filter(s => s.status !== 'paid')
    .reduce((sum, s) => sum + (s.total - (s.paidAmount || 0)), 0);

  const stockValue = inventory.reduce((sum, inv) => {
    return sum + (inv.qty * inv.rate);
  }, 0);

  // Sales trend data for chart - synced with period filter
  const getSalesTrendData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'today') {
      // Today: Show today's total
      const todaySales = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.total, 0);
      return [{ date: 'Today', sales: todaySales }];
    } else if (period === 'week') {
      // Week: Show last 7 days using actual sales data
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: daySales,
        });
      }
      return data;
    } else {
      // Month: Get actual sales dates from last 30 days
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Get sales from last 30 days
      const recentSales = sales.filter(s => s.date >= thirtyDaysAgoStr && s.date <= todayStr);
      
      // Get unique dates
      const uniqueDates = [...new Set(recentSales.map(s => s.date))].sort();
      
      // Build chart data
      const data = uniqueDates.map(dateStr => {
        const date = new Date(dateStr);
        const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: daySales,
        };
      });
      
      return data;
    }
  };

  const salesTrendData = getSalesTrendData();

  // Top products
  const getTopProducts = () => {
    const productSales: { [key: number]: number } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.qty;
      });
    });
    
    return products
      .map(product => ({
        ...product,
        totalSales: productSales[product.id] || 0,
      }))
      .filter(p => p.totalSales > 0)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // Recent activities (mixed: sales, purchases, payments)
  const getRecentActivities = () => {
    const activities: Array<{
      type: 'sale' | 'purchase' | 'payment' | 'alert';
      icon: any;
      title: string;
      description: string;
      time: string;
      amount?: string;
    }> = [];

    // Add recent sales
    sales.slice(0, 3).forEach(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      activities.push({
        type: 'sale',
        icon: Receipt,
        title: `Sale to ${customer?.name || 'Customer'}`,
        description: sale.invoiceNo,
        time: formatRelativeTime(sale.date),
        amount: formatCompactAmount(sale.total),
      });
    });

    // Add recent purchases
    purchases.slice(0, 2).forEach(purchase => {
      activities.push({
        type: 'purchase',
        icon: ShoppingCart,
        title: `Stock received from supplier`,
        description: purchase.invoiceNo,
        time: formatRelativeTime(purchase.date),
        amount: formatCompactAmount(purchase.total),
      });
    });

    return activities.slice(0, 5);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const recentActivities = getRecentActivities();

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
        {/* Period Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={period === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('today')}
            className="flex-shrink-0"
          >
            Today
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
            className="flex-shrink-0"
          >
            This Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
            className="flex-shrink-0"
          >
            This Month
          </Button>
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

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
                  {period === 'today' ? "Today's" : period === 'week' ? "Week's" : "Month's"} Sales
                </p>
                <p 
                  className="text-lg font-bold truncate" 
                  title={formatAmount(todaySales)}
                >
                  <span className="md:hidden">{formatCompactAmount(todaySales)}</span>
                  <span className="hidden md:inline">{formatAmount(todaySales)}</span>
                </p>
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-success flex-shrink-0" />
                  <span className="text-xs text-success font-medium">
                    {filteredSales.length} transactions
                  </span>
                </div>
              </div>
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Receipt className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
                  {period === 'today' ? "Today's" : period === 'week' ? "Week's" : "Month's"} Purchases
                </p>
                <p 
                  className="text-lg font-bold truncate"
                  title={formatAmount(totalPurchases)}
                >
                  <span className="md:hidden">{formatCompactAmount(totalPurchases)}</span>
                  <span className="hidden md:inline">{formatAmount(totalPurchases)}</span>
                </p>
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  <Package className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {filteredPurchases.length} orders
                  </span>
                </div>
              </div>
              <div className="p-1.5 md:p-2 bg-secondary/10 rounded-lg flex-shrink-0">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 transition-all hover:shadow-md">
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
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-danger flex-shrink-0" />
                  <span className="text-xs text-danger font-medium">
                    {sales.filter(s => s.status !== 'paid').length} pending
                  </span>
                </div>
              </div>
              <div className="p-1.5 md:p-2 bg-danger/10 rounded-lg flex-shrink-0">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-danger" />
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 transition-all hover:shadow-md">
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
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  <Package className="w-3 h-3 md:w-4 md:h-4 text-info flex-shrink-0" />
                  <span className="text-xs text-info font-medium">
                    {products.length} products
                  </span>
                </div>
              </div>
              <div className="p-1.5 md:p-2 bg-info/10 rounded-lg flex-shrink-0">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-info" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">
            Sales Trend ({period === 'today' ? 'Today' : period === 'week' ? 'Last 7 Days' : 'Last 30 Days'})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrendData}>
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={13}
                angle={-45}
                textAnchor="end"
                height={70}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="text-base md:text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => navigate('/sales/new')}
              >
                <Receipt className="w-5 h-5" />
                <span className="text-xs font-medium">New Sale</span>
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => navigate('/purchase/new')}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-xs font-medium">New Purchase</span>
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => navigate('/payments/receive')}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-medium">Receive Payment</span>
                </Button>
              )}
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => navigate('/inventory')}
              >
                <Package className="w-5 h-5" />
                <span className="text-xs font-medium">Check Stock</span>
              </Button>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-semibold">Top 5 Products</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
              ) : (
                topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.generic}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {product.totalSales} units
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'sale' ? 'bg-primary/10' :
                    activity.type === 'purchase' ? 'bg-secondary/10' :
                    activity.type === 'payment' ? 'bg-success/10' :
                    'bg-warning/10'
                  }`}>
                    <activity.icon className={`w-4 h-4 ${
                      activity.type === 'sale' ? 'text-primary' :
                      activity.type === 'purchase' ? 'text-secondary' :
                      activity.type === 'payment' ? 'text-success' :
                      'text-warning'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                      {activity.amount}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
