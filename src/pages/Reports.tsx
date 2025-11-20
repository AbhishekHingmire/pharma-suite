import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFromStorage } from '@/lib/storage';
import { Sale, Purchase, Customer, Product, Company } from '@/types';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const sales = getFromStorage<Sale>('sales');
  const purchases = getFromStorage<Purchase>('purchases');
  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');
  const companies = getFromStorage<Company>('companies');

  const filterByDate = <T extends { date: string }>(items: T[]) => {
    if (!dateFrom && !dateTo) return items;
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
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.productId === p.id) {
            totalQty += item.qty;
            totalAmount += item.amount;
          }
        });
      });
      return { ...p, totalQty, totalAmount };
    })
    .filter(p => p.totalQty > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Business Reports</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your business performance and generate reports
          </p>
        </div>

        {/* Date Filter */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex items-end gap-2">
              <Button onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear Filters
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <h3 className="text-xl font-bold mt-1">₹{totalSales.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredSales.length} invoices
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <h3 className="text-xl font-bold mt-1">₹{totalPurchases.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredPurchases.length} invoices
                </p>
              </div>
              <div className="p-2 bg-danger/10 rounded">
                <TrendingDown className="w-5 h-5 text-danger" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Gross Profit</p>
                <h3 className="text-xl font-bold mt-1">₹{grossProfit.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}% margin
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <h3 className="text-xl font-bold mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
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

        {/* Top Customers */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Top 10 Customers</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="bg-muted/50">
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
                    <td className="p-3 text-sm font-medium">{customer.name}</td>
                    <td className="p-3 text-sm">Type {customer.type}</td>
                    <td className="p-3 text-sm font-semibold">
                      ₹{customer.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-sm">{customer.salesCount}</td>
                    <td className="p-3 text-sm">₹{customer.outstanding.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Top 10 Products</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-xs font-semibold uppercase">Rank</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Product</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Company</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Quantity Sold</th>
                  <th className="text-left p-3 text-xs font-semibold uppercase">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm font-bold">#{index + 1}</td>
                    <td className="p-3 text-sm font-medium">{product.name}</td>
                    <td className="p-3 text-sm">{getCompanyName(product.companyId)}</td>
                    <td className="p-3 text-sm">{product.totalQty} units</td>
                    <td className="p-3 text-sm font-semibold">
                      ₹{product.totalAmount.toLocaleString('en-IN')}
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
