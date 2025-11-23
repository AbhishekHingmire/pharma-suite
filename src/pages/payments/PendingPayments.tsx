import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Share2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage } from '@/lib/storage';
import { Sale, Customer, Payment } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PendingPayments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  
  const sales = getFromStorage<Sale>('sales').filter(s => s.status !== 'paid');
  const customers = getFromStorage<Customer>('customers');
  const payments = getFromStorage<Payment>('payments');

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

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleShareWhatsApp = (type: 'pending' | 'payment', data: Sale | Payment) => {
    let message = '';
    if (type === 'pending') {
      const sale = data as Sale;
      message = `*Payment Reminder*\n\nInvoice: ${sale.invoiceNo}\nCustomer: ${getCustomerName(sale.customerId)}\nAmount: ₹${sale.total.toLocaleString('en-IN')}\nDate: ${new Date(sale.date).toLocaleDateString()}\n\nPlease clear the pending payment.`;
    } else {
      const payment = data as Payment;
      message = `*Payment Receipt*\n\nDate: ${format(new Date(payment.date), 'dd MMM yyyy, hh:mm a')}\nCustomer: ${getCustomerName(payment.customerId)}\nAmount: ₹${payment.amount.toLocaleString('en-IN')}\nMode: ${payment.mode.toUpperCase()}\n${payment.reference ? `Reference: ${payment.reference}\n` : ''}Thank you for your payment!`;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleShareEmail = (type: 'pending' | 'payment', data: Sale | Payment) => {
    let subject = '';
    let body = '';
    
    if (type === 'pending') {
      const sale = data as Sale;
      subject = `Payment Reminder - Invoice ${sale.invoiceNo}`;
      body = `Dear ${getCustomerName(sale.customerId)},\n\nThis is a reminder for the pending payment:\n\nInvoice: ${sale.invoiceNo}\nAmount: ₹${sale.total.toLocaleString('en-IN')}\nDate: ${new Date(sale.date).toLocaleDateString()}\n\nPlease clear the pending payment at your earliest convenience.\n\nThank you!`;
    } else {
      const payment = data as Payment;
      subject = `Payment Receipt - ${format(new Date(payment.date), 'dd MMM yyyy')}`;
      body = `Dear ${getCustomerName(payment.customerId)},\n\nThank you for your payment!\n\nPayment Receipt:\nDate: ${format(new Date(payment.date), 'dd MMM yyyy, hh:mm a')}\nAmount: ₹${payment.amount.toLocaleString('en-IN')}\nMode: ${payment.mode.toUpperCase()}\n${payment.reference ? `Reference: ${payment.reference}\n` : ''}\nThank you for your business!`;
    }
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    toast.success('Opening email client...');
  };

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Payments</h2>
            <p className="text-sm text-muted-foreground">
              Track pending and completed payments
            </p>
          </div>
          <Button onClick={() => navigate('/payments/receive')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pending')}
          >
            Pending ({sales.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            Payment History ({payments.length})
          </Button>
        </div>

        {activeTab === 'pending' && (
          <div className="space-y-3">
            <div className="hidden lg:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Customer</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Invoice No</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase min-w-[140px]">Date & Time</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Amount</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Days Overdue</th>
                        <th className="text-center p-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-center p-3 text-xs font-semibold uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => {
                        const daysOverdue = getDaysOverdue(sale.date);
                        return (
                          <tr key={sale.id} className="border-b hover:bg-muted/30">
                            <td className="p-3 text-sm font-medium">{getCustomerName(sale.customerId)}</td>
                            <td className="p-3 text-sm">{sale.invoiceNo}</td>
                            <td className="p-3 text-sm min-w-[140px]">
                              <div className="whitespace-nowrap">{format(new Date(sale.date), 'dd MMM yyyy')}</div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(sale.date).toLocaleTimeString('en-IN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </td>
                            <td className="p-3 text-sm font-semibold">
                              ₹{sale.total.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-sm">
                              <span className={daysOverdue > 30 ? 'text-danger font-semibold' : ''}>
                                {daysOverdue} days
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={sale.status === 'unpaid' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                                {sale.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button size="sm" onClick={() => navigate('/payments/receive')}>
                                  Record Payment
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleShareWhatsApp('pending', sale)}
                                  title="Share on WhatsApp"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleShareEmail('pending', sale)}
                                  title="Share via Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

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
                      <Badge className={sale.status === 'unpaid' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                        {sale.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date & Time</span>
                        <div className="text-right">
                          <div>{format(new Date(sale.date), 'dd MMM yyyy')}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sale.date).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
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
                    <div className="flex gap-2 pt-3 border-t">
                      <Button className="flex-1" size="sm" onClick={() => navigate('/payments/receive')}>
                        Record Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareWhatsApp('pending', sale)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareEmail('pending', sale)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {sales.length === 0 && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-md font-bold mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground">No pending payments at the moment.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="hidden lg:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold uppercase min-w-[140px]">Date & Time</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Customer</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Amount</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Mode</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Reference</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Notes</th>
                        <th className="text-center p-3 text-xs font-semibold uppercase">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-sm min-w-[140px]">
                            <div className="whitespace-nowrap">{format(new Date(payment.date), 'dd MMM yyyy')}</div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(payment.date).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
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
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleShareWhatsApp('payment', payment)}
                                title="Share on WhatsApp"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleShareEmail('payment', payment)}
                                title="Share via Email"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="lg:hidden space-y-3">
              {sortedPayments.map((payment) => (
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
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShareWhatsApp('payment', payment)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShareEmail('payment', payment)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {payments.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No payment history yet</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
