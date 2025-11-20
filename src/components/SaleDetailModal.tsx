import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFromStorage } from '@/lib/storage';
import { Sale, Customer, Product } from '@/types';
import { format } from 'date-fns';
import { Calendar, User, Package, DollarSign } from 'lucide-react';

interface SaleDetailModalProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailModal({ sale, open, onOpenChange }: SaleDetailModalProps) {
  if (!sale) return null;

  const customers = getFromStorage<Customer>('customers');
  const products = getFromStorage<Product>('products');

  const customer = customers.find(c => c.id === sale.customerId);
  const getProductName = (id: number) => products.find(p => p.id === id)?.name || 'Unknown';

  const getStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-success',
      unpaid: 'bg-danger',
      partial: 'bg-orange-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Invoice Number</p>
              <p className="font-semibold">{sale.invoiceNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{format(new Date(sale.date), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Customer Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{customer?.name || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{customer?.phone || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge>Type {customer?.type || '-'}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="font-medium">₹{customer?.outstanding.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Products */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 text-xs font-semibold uppercase">Product</th>
                    <th className="text-left p-2 text-xs font-semibold uppercase">Batch</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Qty</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Rate</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{getProductName(item.productId)}</td>
                      <td className="p-2 text-muted-foreground">{item.batch}</td>
                      <td className="p-2 text-right">{item.qty}</td>
                      <td className="p-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Payment Summary</h3>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{sale.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (12%):</span>
                <span className="font-medium">₹{sale.gst.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">₹{sale.total.toLocaleString('en-IN')}</span>
              </div>
              {sale.paidAmount !== undefined && sale.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid Amount:</span>
                    <span className="font-medium text-success">₹{sale.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-medium text-danger">
                      ₹{(sale.total - sale.paidAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Payment Status:</span>
                <Badge className={`${getStatusColor(sale.status)} text-white`}>
                  {sale.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
