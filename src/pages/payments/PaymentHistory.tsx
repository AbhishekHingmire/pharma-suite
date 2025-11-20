import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar } from 'lucide-react';
import { getFromStorage } from '@/lib/storage';
import { Payment, Customer } from '@/types';
import { format } from 'date-fns';

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const payments = getFromStorage<Payment>('payments');
  const customers = getFromStorage<Customer>('customers');
  
  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const getModeColor = (mode: string) => {
    const colors = {
      cash: 'bg-success',
      card: 'bg-blue-500',
      upi: 'bg-purple-500',
      netbanking: 'bg-orange-500',
      cheque: 'bg-gray-500'
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-500';
  };

  const filteredPayments = payments
    .filter(p => 
      getCustomerName(p.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Payment History">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Payment History</h2>
            <p className="text-sm text-muted-foreground">
              Total Collected: ₹{totalCollected.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No payments recorded yet</p>
          </Card>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-xs font-semibold uppercase">Date & Time</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Customer</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Amount</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Mode</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Reference</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div>{format(new Date(payment.date), 'dd MMM yyyy')}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(payment.date).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium">{getCustomerName(payment.customerId)}</td>
                          <td className="p-3 text-sm font-semibold">₹{payment.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <Badge className={`${getModeColor(payment.mode)} text-white`}>
                              {payment.mode.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{payment.reference || '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                            {payment.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{getCustomerName(payment.customerId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(payment.date), 'dd MMM yyyy, hh:mm a')}
                        </div>
                      </div>
                      <Badge className={`${getModeColor(payment.mode)} text-white`}>
                        {payment.mode.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold">₹{payment.amount.toLocaleString('en-IN')}</span>
                      {payment.reference && (
                        <span className="text-xs text-muted-foreground">Ref: {payment.reference}</span>
                      )}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
