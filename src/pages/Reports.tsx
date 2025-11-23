import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getFromStorage, formatAmount, formatCompactAmount } from '@/lib/storage';
import { Sale, Purchase, Customer, Product, Company } from '@/types';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Reports() {
  // Initialize with last 30 days
  const getDefaultDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);

  const sales = getFromStorage<Sale>('sales');
  const purchases = getFromStorage<Purchase>('purchases');
  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');
  const companies = getFromStorage<Company>('companies');

  const filterByDate = <T extends { date: string }>(items: T[]) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      if (dateFrom && new Date(dateFrom) > itemDate) return false;
      if (dateTo && new Date(dateTo) < itemDate) return false;
      return true;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredPurchases = filterByDate(purchases);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
  const grossProfit = totalSales - totalPurchases;
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);

  const topCustomers = customers
    .map(c => {
      const customerSales = filteredSales.filter(s => s.customerId === c.id);
      const totalAmount = customerSales.reduce((sum, s) => sum + s.total, 0);
      return { ...c, totalAmount, salesCount: customerSales.length };
    })
    .filter(c => c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  const topProducts = products
    .map(p => {
      let totalQty = 0;
      let totalAmount = 0;
      let totalCost = 0;
      const brands = new Set<string>();
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.productId === p.id) {
            totalQty += item.qty;
            totalAmount += item.amount;
            if (item.brandName) {
              brands.add(item.brandName);
            }
          }
        });
      });
      // Calculate cost from purchases
      filteredPurchases.forEach(purchase => {
        purchase.items.forEach(item => {
          if (item.productId === p.id) {
            totalCost += item.amount;
          }
        });
      });
      const profit = totalAmount - totalCost;
      const marginPercent = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;
      return { ...p, totalQty, totalAmount, totalCost, profit, marginPercent, brandName: Array.from(brands).join(', ') || '-' };
    })
    .filter(p => p.totalQty > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
  
  // Sales trend data - dynamic based on date filter
  const getSalesTrendData = () => {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    // Get all unique dates from filtered sales and purchases
    const allDates = new Set<string>();
    filteredSales.forEach(s => allDates.add(s.date));
    filteredPurchases.forEach(p => allDates.add(p.date));
    
    // Convert to array and sort
    const sortedDates = Array.from(allDates).sort();
    
    // Build chart data using actual transaction dates
    const data = sortedDates.map(dateStr => {
      const date = new Date(dateStr);
      const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
      const dayPurchases = purchases.filter(p => p.date === dateStr).reduce((sum, p) => sum + p.total, 0);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales,
        purchases: dayPurchases,
        profit: daySales - dayPurchases,
      };
    });
    
    return data;
  };
  
  const salesTrendData = getSalesTrendData();
  
  // Top products chart data
  const topProductsChartData = topProducts.slice(0, 5).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    revenue: p.totalAmount,
    profit: p.profit,
  }));
  
  // Customer type distribution
  const customerTypeData = [
    { name: 'Type A', value: customers.filter(c => c.type === 'A').length, color: '#10b981' },
    { name: 'Type B', value: customers.filter(c => c.type === 'B').length, color: '#3b82f6' },
    { name: 'Type C', value: customers.filter(c => c.type === 'C').length, color: '#f59e0b' },
  ];
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">Business Reports</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your business performance and generate reports
          </p>
        </div>

        {/* Date Filter */}
        <Card className="p-4">
          <div className="space-y-3">
            {/* Date Inputs - 2 columns on mobile/tablet, 3 columns on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              {/* Buttons on desktop - aligned with inputs */}
              <div className="hidden lg:flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                <Button 
                  onClick={() => { 
                    const defaults = getDefaultDates();
                    setDateFrom(defaults.from); 
                    setDateTo(defaults.to); 
                  }} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Reset (30 Days)
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            {/* Buttons on mobile/tablet - separate row */}
            <div className="flex lg:hidden flex-row gap-2">
              <Button 
                onClick={() => { 
                  const defaults = getDefaultDates();
                  setDateFrom(defaults.from); 
                  setDateTo(defaults.to); 
                }} 
                variant="outline"
                className="flex-1"
              >
                Reset (30 Days)
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <h3 className="text-lg font-bold mt-1 truncate" title={formatAmount(totalSales)}>
                  <span className="md:hidden">{formatCompactAmount(totalSales)}</span>
                  <span className="hidden md:inline">{formatAmount(totalSales)}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredSales.length} invoices
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <h3 className="text-lg font-bold mt-1 truncate" title={formatAmount(totalPurchases)}>
                  <span className="md:hidden">{formatCompactAmount(totalPurchases)}</span>
                  <span className="hidden md:inline">{formatAmount(totalPurchases)}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredPurchases.length} invoices
                </p>
              </div>
              <div className="p-2 bg-danger/10 rounded flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-danger" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Gross Profit</p>
                <h3 className="text-lg font-bold mt-1 truncate" title={formatAmount(grossProfit)}>
                  <span className="md:hidden">{formatCompactAmount(grossProfit)}</span>
                  <span className="hidden md:inline">{formatAmount(grossProfit)}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Margin: {((grossProfit / totalSales) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <h3 className="text-lg font-bold mt-1 truncate" title={formatAmount(totalOutstanding)}>
                  <span className="md:hidden">{formatCompactAmount(totalOutstanding)}</span>
                  <span className="hidden md:inline">{formatAmount(totalOutstanding)}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  From {customers.filter(c => c.outstanding > 0).length} customers
                </p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded">
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Sales & Purchase Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
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
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                name="Sales"
              />
              <Line 
                type="monotone" 
                dataKey="purchases" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
                name="Purchases"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Product Revenue & Customer Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top 5 Products Revenue */}
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Top 5 Products - Revenue & Profit</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProductsChartData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Customer Type Distribution */}
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Customer Distribution by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Customers']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Customers */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold">Top 10 Customers</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Rank</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Customer</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Type</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Total Sales</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Invoices</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm font-bold">#{index + 1}</td>
                    <td className="p-3 text-sm font-medium truncate max-w-[200px]">{customer.name}</td>
                    <td className="p-3 text-sm">Type {customer.type}</td>
                    <td className="p-3 text-sm font-semibold truncate max-w-[150px]" title={formatAmount(customer.totalAmount)}>
                      {formatCompactAmount(customer.totalAmount)}
                    </td>
                    <td className="p-3 text-sm">{customer.salesCount}</td>
                    <td className="p-3 text-sm truncate max-w-[120px]" title={formatAmount(customer.outstanding)}>
                      {formatCompactAmount(customer.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold">Top 10 Products</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Rank</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Product</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Brand</th>
                  <th className="text-right p-3 text-xs font-semibold uppercase">Quantity Sold</th>
                  <th className="text-right p-3 text-xs font-semibold uppercase">Revenue</th>
                  <th className="text-right p-3 text-xs font-semibold uppercase">Profit</th>
                  <th className="text-right p-3 text-xs font-semibold uppercase">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm font-bold">#{index + 1}</td>
                    <td className="p-3 text-sm font-medium truncate max-w-[200px]">{product.name}</td>
                    <td className="p-3 text-sm truncate max-w-[150px]">{product.brandName}</td>
                    <td className="p-3 text-sm text-right">{product.totalQty} units</td>
                    <td className="p-3 text-sm font-semibold truncate max-w-[120px] text-right" title={formatAmount(product.totalAmount)}>
                      {formatCompactAmount(product.totalAmount)}
                    </td>
                    <td className="p-3 text-sm font-semibold truncate max-w-[120px] text-right text-success" title={formatAmount(product.profit)}>
                      {formatCompactAmount(product.profit)}
                    </td>
                    <td className="p-3 text-sm text-right">
                      <Badge variant={product.marginPercent > 20 ? 'default' : product.marginPercent > 10 ? 'secondary' : 'destructive'}>
                        {product.marginPercent.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
