import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage } from '@/lib/storage';
import { Sale, Customer } from '@/types';

export default function PendingPayments() {
  const navigate = useNavigate();
  
  const sales = getFromStorage<Sale>('sales').filter(s => s.status !== 'paid');
  const customers = getFromStorage<Customer>('customers');

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const getDaysOverdue = (date: string) => {
    const saleDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - saleDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout title="Pending Payments">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pending Payments</h2>
            <p className="text-muted-foreground">
              {sales.length} invoice(s) pending
            </p>
          </div>
          <Button onClick={() => navigate('/payments/receive')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>

        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Customer</th>
                      <th className="text-left p-4 font-semibold">Invoice No</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-right p-4 font-semibold">Amount</th>
                      <th className="text-right p-4 font-semibold">Days Overdue</th>
                      <th className="text-center p-4 font-semibold">Status</th>
                      <th className="text-center p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => {
                      const daysOverdue = getDaysOverdue(sale.date);
                      return (
                        <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{getCustomerName(sale.customerId)}</td>
                          <td className="p-4">{sale.invoiceNo}</td>
                          <td className="p-4">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="p-4 text-right font-semibold">
                            ₹{sale.total.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-right">
                            <span className={daysOverdue > 30 ? 'text-danger font-semibold' : ''}>
                              {daysOverdue} days
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={sale.status === 'unpaid' ? 'destructive' : 'secondary'}>
                              {sale.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <Button size="sm" onClick={() => navigate('/payments/receive')}>
                              Record Payment
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {sales.map((sale) => {
              const daysOverdue = getDaysOverdue(sale.date);
              return (
                <Card key={sale.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{sale.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCustomerName(sale.customerId)}
                      </p>
                    </div>
                    <Badge variant={sale.status === 'unpaid' ? 'destructive' : 'secondary'}>
                      {sale.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>{new Date(sale.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Days Overdue</span>
                      <span className={daysOverdue > 30 ? 'text-danger font-semibold' : ''}>
                        {daysOverdue} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-lg font-bold">
                        ₹{sale.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm" onClick={() => navigate('/payments/receive')}>
                    Record Payment
                  </Button>
                </Card>
              );
            })}
          </div>

          {sales.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending payments at the moment.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
