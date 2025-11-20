import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryBatch, Product, Company } from '@/types';
import { getFromStorage, formatAmount } from '@/lib/storage';
import { calculateDaysToExpiry, getExpiryColorClass, getExpiryBadge } from '@/lib/pricing';
import { FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InventoryBatchModalProps {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BatchDisplay extends InventoryBatch {
  company: Company;
  daysToExpiry: number;
}

export function InventoryBatchModal({ productId, open, onOpenChange }: InventoryBatchModalProps) {
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) return;

    const products = getFromStorage<Product>('products');
    const inventory = getFromStorage<InventoryBatch>('inventory');
    const companies = getFromStorage<Company>('companies');

    const prod = products.find(p => p.id === productId);
    setProduct(prod || null);

    const productBatches = inventory
      .filter(batch => batch.productId === productId)
      .map(batch => {
        const company = companies.find(c => c.id === batch.companyId);
        return {
          ...batch,
          company: company || { id: 0, name: 'Unknown', logo: '', contact: '', paymentTerms: '', status: 'active' as const },
          daysToExpiry: calculateDaysToExpiry(batch.expiry)
        };
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry); // Sort by expiry (soonest first)

    setBatches(productBatches);
  }, [productId, open]);

  if (!product) return null;

  const totalQty = batches.reduce((sum, b) => sum + b.qty, 0);
  const totalValue = batches.reduce((sum, b) => sum + (b.qty * b.rate), 0);
  const expiringBatches = batches.filter(b => b.daysToExpiry > 0 && b.daysToExpiry < 90);
  const expiringValue = expiringBatches.reduce((sum, b) => sum + (b.qty * b.rate), 0);

  const handleGenerateReturnNote = (batch: BatchDisplay) => {
    // TODO: Implement return note generation
    console.log('Generate return note for batch:', batch.batch);
  };

  const handleMarkAsWaste = (batch: BatchDisplay) => {
    // TODO: Implement waste marking
    console.log('Mark as waste:', batch.batch);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Total Stock:</span> {totalQty} {product.packing}
              </div>
              <div>
                <span className="font-medium">Total Value:</span> {formatAmount(totalValue)}
              </div>
              <div>
                <span className="font-medium">HSN:</span> {product.hsn}
              </div>
              <div>
                <span className="font-medium">GST:</span> {product.gst}%
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {batches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No batches found for this product
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="text-left py-3 px-2 font-semibold">Batch</th>
                      <th className="text-left py-3 px-2 font-semibold">Company/Brand</th>
                      <th className="text-left py-3 px-2 font-semibold">Purchase Date</th>
                      <th className="text-left py-3 px-2 font-semibold">Expiry</th>
                      <th className="text-right py-3 px-2 font-semibold">Qty</th>
                      <th className="text-right py-3 px-2 font-semibold">Cost/Unit</th>
                      <th className="text-right py-3 px-2 font-semibold">Value</th>
                      <th className="text-center py-3 px-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch, idx) => {
                      const expiryBadge = getExpiryBadge(batch.daysToExpiry);
                      const colorClass = getExpiryColorClass(batch.daysToExpiry);
                      
                      return (
                        <tr key={idx} className={`border-b ${colorClass}`}>
                          <td className="py-3 px-2 font-mono font-medium">{batch.batch}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <img 
                                src={batch.company.logo} 
                                alt={batch.company.name}
                                className="w-8 h-8 rounded"
                              />
                              <div>
                                <div className="font-medium text-md">{batch.brandName}</div>
                                <div className="text-xs text-muted-foreground">{batch.company.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-md">
                            {new Date(batch.purchaseDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <div className="text-md">
                                {new Date(batch.expiry).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <Badge className={`mt-1 ${expiryBadge.color} text-xs`}>
                                {expiryBadge.text}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-md">{batch.qty}</td>
                          <td className="py-3 px-2 text-right text-md">{formatAmount(batch.rate)}</td>
                          <td className="py-3 px-2 text-right font-medium text-md">
                            {formatAmount(batch.qty * batch.rate)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              {batch.daysToExpiry < 0 ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleMarkAsWaste(batch)}
                                  className="h-8 px-2"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Waste</span>
                                </Button>
                              ) : batch.daysToExpiry < 90 ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGenerateReturnNote(batch)}
                                  className="h-8 px-2"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Return</span>
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {batches.map((batch, idx) => {
                  const expiryBadge = getExpiryBadge(batch.daysToExpiry);
                  const colorClass = getExpiryColorClass(batch.daysToExpiry);
                  
                  return (
                    <div key={idx} className={`border rounded-lg p-4 ${colorClass}`}>
                      {/* Company and Brand */}
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={batch.company.logo} 
                          alt={batch.company.name}
                          className="w-12 h-12 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-md">{batch.brandName}</div>
                          <div className="text-sm text-muted-foreground">{batch.company.name}</div>
                        </div>
                        <Badge className={`${expiryBadge.color} text-xs`}>
                          {expiryBadge.text}
                        </Badge>
                      </div>

                      {/* Batch Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Batch</div>
                          <div className="font-mono font-medium text-md">{batch.batch}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Expiry</div>
                          <div className="font-medium text-md">
                            {new Date(batch.expiry).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Quantity</div>
                          <div className="font-bold text-md">{batch.qty} units</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Cost/Unit</div>
                          <div className="font-medium text-md">{formatAmount(batch.rate)}</div>
                        </div>
                      </div>

                      {/* Value and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Value</div>
                          <div className="font-bold text-md">{formatAmount(batch.qty * batch.rate)}</div>
                        </div>
                        <div className="flex gap-2">
                          {batch.daysToExpiry < 0 ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleMarkAsWaste(batch)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Waste
                            </Button>
                          ) : batch.daysToExpiry < 90 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateReturnNote(batch)}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer - Fixed */}
        {expiringBatches.length > 0 && (
          <div className="px-6 py-4 border-t bg-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold text-orange-800">
                  {expiringBatches.length} batch{expiringBatches.length !== 1 ? 'es' : ''} expiring in 90 days
                </span>
                <span className="text-muted-foreground"> - Total value: </span>
                <span className="font-bold text-orange-800">{formatAmount(expiringValue)}</span>
              </div>
              <Button variant="outline" className="border-orange-300 hover:bg-orange-100">
                <FileText className="w-4 h-4 mr-2" />
                Generate Bulk Return Note
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
