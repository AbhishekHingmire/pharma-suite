import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, AlertCircle, Gift, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Company, Product, Scheme, PurchaseItem, InventoryBatch } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function NewPurchase() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<(number | null)[]>([]);
  const [schemeVerified, setSchemeVerified] = useState<boolean[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('pending');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [transactionId, setTransactionId] = useState<string>('');

  const companies = getFromStorage<Company>('companies');
  const products = getFromStorage<Product>('products');
  const schemes = getFromStorage<Scheme>('schemes');

  const addItem = () => {
    setItems([...items, {
      productId: 0,
      companyId: selectedCompany?.id || 0,
      brandName: '',
      qty: 0,
      freeQty: 0,
      batch: '',
      expiry: '',
      rate: 0,
      amount: 0,
    }]);
    setSelectedSchemes([...selectedSchemes, null]);
    setSchemeVerified([...schemeVerified, false]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setSelectedSchemes(selectedSchemes.filter((_, i) => i !== index));
    setSchemeVerified(schemeVerified.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate amount
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }

    setItems(newItems);
  };

  const getAvailableSchemesForItem = (index: number) => {
    const item = items[index];
    if (!item.productId || !selectedCompany) return [];

    return schemes.filter(s => 
      s.companyId === selectedCompany.id &&
      (s.products === 'all' || (Array.isArray(s.products) && s.products.includes(item.productId)))
    );
  };

  const getSchemeStatus = (scheme: Scheme) => {
    const today = new Date();
    const startDate = new Date(scheme.validFrom);
    const endDate = new Date(scheme.validTo);
    
    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'expired';
    return 'active';
  };

  const applyScheme = (index: number, schemeId: number | null) => {
    const newSelectedSchemes = [...selectedSchemes];
    newSelectedSchemes[index] = schemeId;
    setSelectedSchemes(newSelectedSchemes);

    const newItems = [...items];
    const item = newItems[index];

    if (!schemeId) {
      item.freeQty = 0;
      setItems(newItems);
      return;
    }

    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme) return;

    // Calculate free quantity based on scheme
    if (scheme.type === 'freeQty' && item.qty >= (scheme.buyQty || 0)) {
      const multiplier = Math.floor(item.qty / (scheme.buyQty || 1));
      item.freeQty = multiplier * (scheme.freeQty || 0);
    } else if (scheme.type === 'discount' && item.qty >= (scheme.buyQty || 0)) {
      item.freeQty = 0; // Discount schemes don't give free quantity
    } else {
      // Quantity doesn't meet minimum requirement
      item.freeQty = 0;
    }

    setItems(newItems);
  };

  const isSchemeApplicable = (index: number, scheme: Scheme) => {
    const item = items[index];
    const minQty = scheme.buyQty || 0;
    return item.qty >= minQty;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const hasActiveScheme = (index: number) => {
    return items[index].freeQty > 0;
  };

  const canSave = () => {
    if (items.length === 0) return false;
    
    const itemsValid = items.every((item, idx) => {
      const basicValid = item.productId && item.brandName.trim() && item.qty > 0 && item.batch && item.expiry && item.rate > 0;
      
      // Check scheme verification only for freeQty schemes
      const scheme = selectedSchemes[idx] ? schemes.find(s => s.id === selectedSchemes[idx]) : null;
      const schemeValid = !scheme || scheme.type !== 'freeQty' || schemeVerified[idx];
      
      return basicValid && schemeValid;
    });

    // Validate payment information
    const { total } = calculateTotals();
    const paymentValid = 
      (paymentStatus === 'pending') ||
      (paymentStatus === 'paid' && transactionId.trim() !== '') ||
      (paymentStatus === 'partial' && paidAmount > 0 && paidAmount < total && transactionId.trim() !== '');
    
    return itemsValid && paymentValid;
  };

  const handleSave = () => {
    if (!selectedCompany) return;

    const purchases = getFromStorage('purchases');
    const { subtotal, gst, total } = calculateTotals();
    
    const newPurchase = {
      id: getNextId('purchases'),
      companyId: selectedCompany.id,
      invoiceNo: `SP/${new Date().getFullYear()}/${String(purchases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      gst,
      total,
      paymentStatus,
      paidAmount: paymentStatus === 'paid' ? total : (paymentStatus === 'partial' ? paidAmount : 0),
      transactionId: paymentStatus !== 'pending' ? transactionId : undefined,
      inventoryPhotos: [],
      createdAt: new Date().toISOString(),
    };

    saveToStorage('purchases', [...purchases, newPurchase]);

    // Update inventory
    const inventory = getFromStorage<InventoryBatch>('inventory');
    items.forEach(item => {
      const existingBatch = inventory.find(inv => 
        inv.productId === item.productId && inv.batch === item.batch
      );

      if (existingBatch) {
        existingBatch.qty += item.qty + item.freeQty;
      } else {
        inventory.push({
          productId: item.productId,
          companyId: item.companyId,
          brandName: item.brandName,
          batch: item.batch,
          qty: item.qty + item.freeQty,
          purchaseDate: new Date().toISOString().split('T')[0],
          expiry: item.expiry,
          rate: item.rate,
        });
      }
    });
    saveToStorage('inventory', inventory);

    toast.success('Purchase saved successfully!');
    navigate('/purchase');
  };

  if (step === 1) {
    return (
      <DashboardLayout title="New Purchase">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-lg font-bold mb-6">Step 1: Select Company</h2>
          
          <div className="space-y-4">
            {companies.map((company) => (
              <Card
                key={company.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  selectedCompany?.id === company.id && "border-primary border-2"
                )}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-center gap-4">
                  <img src={company.logo} alt={company.name} className="w-12 h-12 rounded" />
                  <div className="flex-1">
                    <p className="font-semibold">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.contact}</p>
                    <p className="text-sm text-muted-foreground">Payment: {company.paymentTerms}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            className="w-full mt-6"
            disabled={!selectedCompany}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const { subtotal, gst, total } = calculateTotals();

  return (
    <DashboardLayout title="New Purchase">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Company</p>
              <p className="font-semibold">{selectedCompany?.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Change
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Add Products</h2>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Product {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={item.productId.toString()}
                      onValueChange={(value) => updateItem(index, 'productId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.generic})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Brand Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={item.brandName}
                      onChange={(e) => updateItem(index, 'brandName', e.target.value)}
                      placeholder="e.g., Dolo-650, Crocin, Calpol"
                      className="text-md"
                    />
                    {item.productId > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Company: {selectedCompany?.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.qty || ''}
                      onChange={(e) => {
                        updateItem(index, 'qty', parseInt(e.target.value) || 0);
                        // Re-apply scheme if one is selected
                        if (selectedSchemes[index]) {
                          applyScheme(index, selectedSchemes[index]);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Apply Scheme/Discount</Label>
                    <Select
                      value={selectedSchemes[index]?.toString() || 'none'}
                      onValueChange={(value) => {
                        const schemeId = value === 'none' ? null : parseInt(value);
                        applyScheme(index, schemeId);
                      }}
                      disabled={!item.productId || item.qty === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select scheme</SelectItem>
                        {getAvailableSchemesForItem(index).map((scheme) => {
                          const status = getSchemeStatus(scheme);
                          const isExpired = status === 'expired';
                          const isUpcoming = status === 'upcoming';
                          const isApplicable = isSchemeApplicable(index, scheme);
                          const minQty = scheme.buyQty || 0;
                          
                          let label = '';
                          if (scheme.type === 'freeQty') {
                            label = `Buy ${scheme.buyQty}, Get ${scheme.freeQty} Free`;
                          } else if (scheme.type === 'discount') {
                            label = `${scheme.discountPercent}% Discount (Min: ${minQty})`;
                          } else {
                            label = 'Slab Discount';
                          }

                          return (
                            <SelectItem 
                              key={scheme.id} 
                              value={scheme.id.toString()}
                              disabled={isExpired || isUpcoming || !isApplicable}
                            >
                              {label} {isExpired && '(Expired)'} {isUpcoming && '(Upcoming)'} {!isApplicable && `(Min qty: ${minQty})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {getAvailableSchemesForItem(index).length === 0 && item.productId > 0 && (
                      <p className="text-xs text-muted-foreground">No schemes available</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input
                      value={item.batch}
                      onChange={(e) => updateItem(index, 'batch', e.target.value)}
                      placeholder="Enter batch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={item.expiry}
                      onChange={(e) => updateItem(index, 'expiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Amount</Label>
                    <Input
                      value={`₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      className="bg-muted font-semibold"
                      readOnly
                    />
                  </div>
                </div>

                {selectedSchemes[index] && (() => {
                  const scheme = schemes.find(s => s.id === selectedSchemes[index]);
                  if (!scheme) return null;

                  const isApplicable = isSchemeApplicable(index, scheme);
                  const minQty = scheme.buyQty || 0;

                  // Show warning if scheme not applicable
                  if (!isApplicable) {
                    return (
                      <Card className="p-5 bg-red-50 border-2 border-red-300">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="font-bold text-lg text-red-900">Scheme Not Applied</p>
                            <p className="text-sm text-red-800">
                              Minimum quantity required: <span className="font-bold">{minQty} units</span>
                            </p>
                            <p className="text-sm text-red-800">
                              Current quantity: <span className="font-bold">{item.qty} units</span>
                            </p>
                            <p className="text-xs text-red-700 mt-2">
                              Please increase the quantity to {minQty} or more to apply this scheme.
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  }

                  const effectiveRate = item.qty > 0 ? (item.qty * item.rate) / (item.qty + item.freeQty) : 0;
                  const savings = scheme.type === 'freeQty' ? item.freeQty * item.rate : (item.amount * (scheme.discountPercent || 0) / 100);
                  
                  return (
                    <Card className="p-5 bg-amber-50 border-2 border-amber-300">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          {scheme.type === 'freeQty' ? (
                            <Gift className="w-6 h-6 text-amber-600" />
                          ) : (
                            <Percent className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-bold text-lg text-amber-900">
                              {scheme.type === 'freeQty' ? 'Free Quantity Scheme' : 'Discount Scheme'}
                            </p>
                            <p className="text-md text-amber-800 mt-1">
                              {scheme.type === 'freeQty' 
                                ? `Buy ${scheme.buyQty} Get ${scheme.freeQty} Free`
                                : `${scheme.discountPercent}% Discount`
                              }
                            </p>
                          </div>
                          
                          {scheme.type === 'freeQty' && (
                            <div className="space-y-1 text-sm">
                              <p className="text-amber-900">• You ordered: <span className="font-semibold">{item.qty} units</span></p>
                              <p className="text-amber-900">• Free quantity: <span className="font-semibold">{item.freeQty} units</span></p>
                              <p className="text-amber-900">• Total received: <span className="font-semibold">{item.qty + item.freeQty} units</span></p>
                            </div>
                          )}

                          {item.rate > 0 && (
                            <div className="pt-2 border-t border-amber-200 space-y-1 text-sm">
                              {scheme.type === 'freeQty' && (
                                <p className="text-amber-900">
                                  Effective rate: <span className="font-bold">₹{effectiveRate.toFixed(2)}/unit</span>
                                  <span className="text-xs ml-2">(was ₹{item.rate.toFixed(2)}/unit)</span>
                                </p>
                              )}
                              <p className="text-green-700 font-bold text-md">
                                Savings: ₹{savings.toFixed(2)}
                              </p>
                            </div>
                          )}

                          {scheme.type === 'freeQty' && (
                            <>
                              <div className="flex items-start gap-3 pt-3 border-t border-amber-200">
                                <input
                                  type="checkbox"
                                  id={`scheme-${index}`}
                                  checked={schemeVerified[index]}
                                  onChange={(e) => {
                                    const newVerified = [...schemeVerified];
                                    newVerified[index] = e.target.checked;
                                    setSchemeVerified(newVerified);
                                  }}
                                  className="mt-0.5 accent-amber-600"
                                />
                                <label htmlFor={`scheme-${index}`} className="text-sm font-medium text-amber-900 cursor-pointer">
                                  I have verified and received {item.freeQty} free units
                                </label>
                              </div>
                              
                              {!schemeVerified[index] && (
                                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Please verify free quantity before saving
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No products added yet</p>
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </div>
            )}
          </div>
        </Card>

        {items.length > 0 && (
          <>
            <Card className="p-6">
              <h3 className="text-md font-bold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (12%):</span>
                  <span className="font-bold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-md font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-md font-bold mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending (Credit)</SelectItem>
                      {isAdmin && <SelectItem value="paid">Paid Now</SelectItem>}
                      {isAdmin && <SelectItem value="partial">Partial Payment</SelectItem>}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {paymentStatus === 'pending' && `Payment will be due as per company terms: ${selectedCompany?.paymentTerms}`}
                    {paymentStatus === 'paid' && 'Full payment made at the time of purchase'}
                    {paymentStatus === 'partial' && 'Partial payment made, remaining amount pending'}
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Only admin can mark payment as paid. You can receive inventory and mark as pending.
                    </p>
                  )}
                </div>

                {paymentStatus !== 'pending' && (
                  <>
                    {paymentStatus === 'partial' && (
                      <div className="space-y-2">
                        <Label>Paid Amount <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={total}
                          value={paidAmount || ''}
                          onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                          placeholder="Enter amount paid"
                        />
                        <p className="text-xs text-muted-foreground">
                          Pending: ₹{(total - paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Transaction ID / Reference Number <span className="text-red-500">*</span></Label>
                      <Input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder={paymentMethod === 'cash' ? 'Receipt number' : 'Transaction ID / UTR / Cheque number'}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required for record keeping and verification
                      </p>
                    </div>

                    {paymentStatus === 'paid' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Paid: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}

                    {paymentStatus === 'partial' && paidAmount > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                        <p className="text-sm text-amber-900">
                          <span className="font-medium">Paid:</span> ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-amber-900">
                          <span className="font-medium">Pending:</span> ₹{(total - paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {paymentStatus === 'pending' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ℹ Payment can be made later from "Pending Payments" section
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/purchase')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave()} className="flex-1">
            Save Purchase
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
