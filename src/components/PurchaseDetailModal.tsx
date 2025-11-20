import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFromStorage } from '@/lib/storage';
import { Purchase, Company, Product } from '@/types';
import { format } from 'date-fns';
import { Calendar, Building2, Package, DollarSign } from 'lucide-react';

interface PurchaseDetailModalProps {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDetailModal({ purchase, open, onOpenChange }: PurchaseDetailModalProps) {
  if (!purchase) return null;

  const companies = getFromStorage<Company>('companies');
  const products = getFromStorage<Product>('products');

  const company = companies.find(c => c.id === purchase.companyId);
  const getProductName = (id: number) => products.find(p => p.id === id)?.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Invoice Number</p>
              <p className="font-semibold">{purchase.invoiceNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{format(new Date(purchase.date), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Company Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{company?.name || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="font-medium">{company?.contact || '-'}</p>
              </div>
              {company?.gstin && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">GSTIN</p>
                  <p className="font-medium">{company.gstin}</p>
                </div>
              )}
              {company?.paymentTerms && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{company.paymentTerms} days</p>
                </div>
              )}
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
                    <th className="text-left p-2 text-xs font-semibold uppercase">Expiry</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Qty</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Free</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Rate</th>
                    <th className="text-right p-2 text-xs font-semibold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{getProductName(item.productId)}</td>
                      <td className="p-2 text-muted-foreground">{item.batch}</td>
                      <td className="p-2 text-muted-foreground">
                        {format(new Date(item.expiry), 'MMM yyyy')}
                      </td>
                      <td className="p-2 text-right">{item.qty}</td>
                      <td className="p-2 text-right">
                        {item.freeQty > 0 ? (
                          <Badge variant="outline" className="text-success border-success">
                            +{item.freeQty}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
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
                <span className="font-medium">₹{purchase.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (12%):</span>
                <span className="font-medium">₹{purchase.gst.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">₹{purchase.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
