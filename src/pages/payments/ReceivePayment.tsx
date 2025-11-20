import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Customer, Sale } from '@/types';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function ReceivePayment() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const customers = getFromStorage<Customer>('customers').filter(c => c.outstanding > 0);
  const sales = getFromStorage<Sale>('sales');

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer || null);
  };

  const handleSave = () => {
    if (!selectedCustomer || !amount || parseFloat(amount) <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > selectedCustomer.outstanding) {
      toast.error('Payment amount cannot exceed outstanding amount');
      return;
    }

    // Get unpaid invoices for this customer
    const unpaidSales = sales.filter(
      s => s.customerId === selectedCustomer.id && s.status !== 'paid'
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const payments = getFromStorage('payments');
    const newPayment = {
      id: getNextId('payments'),
      customerId: selectedCustomer.id,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      mode,
      reference,
      notes,
      invoices: unpaidSales.slice(0, 1).map(s => s.id), // Simplified: apply to oldest invoice
    };

    saveToStorage('payments', [...payments, newPayment]);

    // Update customer outstanding
    const updatedCustomers = getFromStorage<Customer>('customers').map(c =>
      c.id === selectedCustomer.id
        ? { ...c, outstanding: c.outstanding - paymentAmount }
        : c
    );
    saveToStorage('customers', updatedCustomers);

    // Update sale status
    const updatedSales = sales.map(s => {
      if (s.id === unpaidSales[0]?.id) {
        const newPaidAmount = (s.paidAmount || 0) + paymentAmount;
        return {
          ...s,
          paidAmount: newPaidAmount,
          status: newPaidAmount >= s.total ? 'paid' : 'partial' as const
        };
      }
      return s;
    });
    saveToStorage('sales', updatedSales);

    toast.success('Payment recorded successfully!');
    navigate('/payments/pending');
  };

  return (
    <DashboardLayout title="Receive Payment">
      <div className="flex justify-end mb-4">
        <Link to="/payments/history">
          <Button variant="outline">View Payment History</Button>
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Record Payment</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name} - Outstanding: ₹{customer.outstanding.toLocaleString('en-IN')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && (
            <Card className="p-4 bg-muted">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                  <p className="text-2xl font-bold text-danger">
                    ₹{selectedCustomer.outstanding.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Receiving *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={selectedCustomer?.outstanding}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Payment Mode *</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="Transaction ID / Cheque No"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/payments/pending')} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCustomer || !amount}
              className="flex-1"
            >
              Save Payment
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
