import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage, saveToStorage, formatAmount, formatCompactAmount } from '@/lib/storage';
import { Purchase, Company } from '@/types';
import { PurchaseDetailModal } from '@/components/PurchaseDetailModal';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function PurchaseList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  
  const purchases = getFromStorage<Purchase>('purchases');
  const companies = getFromStorage<Company>('companies');

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  const handleDeletePurchase = () => {
    if (!purchaseToDelete || !isAdmin) return;
    
    const updatedPurchases = purchases.filter(p => p.id !== purchaseToDelete.id);
    saveToStorage('purchases', updatedPurchases);
    toast.success('Purchase deleted successfully');
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
  };

  const getPaymentStatusBadge = (purchase: Purchase) => {
    if (purchase.paymentStatus === 'paid') {
      return <Badge className="bg-green-500">Paid</Badge>;
    } else if (purchase.paymentStatus === 'partial') {
      return <Badge className="bg-amber-500">Partial</Badge>;
    } else {
      return <Badge variant="destructive">Pending</Badge>;
    }
  };

  const getPendingAmount = (purchase: Purchase) => {
    if (purchase.paymentStatus === 'paid') return 0;
    if (purchase.paymentStatus === 'partial') return purchase.total - (purchase.paidAmount || 0);
    return purchase.total;
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(p.companyId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'paid' && p.paymentStatus === 'paid') ||
      (filterStatus === 'pending' && (p.paymentStatus === 'pending' || p.paymentStatus === 'partial'));
    
    return matchesSearch && matchesFilter;
  });

  const totalPurchases = purchases.length;
  const paidPurchases = purchases.filter(p => p.paymentStatus === 'paid').length;
  const pendingPurchases = purchases.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'partial').length;

  return (
    <DashboardLayout title="Purchase">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({totalPurchases})
          </Button>
          <Button
            variant={filterStatus === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('paid')}
            className={filterStatus === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Paid ({paidPurchases})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
            className={filterStatus === 'pending' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Pending ({pendingPurchases})
          </Button>
        </div>
          <Button onClick={() => navigate('/purchase/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
        </div>

        {filteredPurchases.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-md font-bold mb-2">No purchases yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Create your first purchase to get started.</p>
              <Button onClick={() => navigate('/purchase/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Purchase
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 text-xs font-semibold uppercase">Date</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Company</th>
                        <th className="text-left p-3 text-xs font-semibold uppercase">Invoice No</th>
                        <th className="text-right p-3 text-xs font-semibold uppercase">Products</th>
                        <th className="text-right p-3 text-xs font-semibold uppercase">Total</th>
                        <th className="text-center p-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-right p-3 text-xs font-semibold uppercase">Pending</th>
                        <th className="text-center p-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase) => {
                        const pendingAmount = getPendingAmount(purchase);
                        return (
                        <tr key={purchase.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="p-3 text-sm font-medium">{getCompanyName(purchase.companyId)}</td>
                          <td className="p-3 text-sm">{purchase.invoiceNo}</td>
                          <td className="p-3 text-sm text-right">{purchase.items.length}</td>
                          <td className="p-3 text-sm text-right font-semibold truncate max-w-[150px]" title={formatAmount(purchase.total)}>
                            <span className="md:hidden">{formatCompactAmount(purchase.total)}</span>
                            <span className="hidden md:inline">{formatAmount(purchase.total)}</span>
                          </td>
                          <td className="p-3 text-center">
                            {getPaymentStatusBadge(purchase)}
                          </td>
                          <td className="p-3 text-sm text-right font-semibold">
                            {pendingAmount > 0 ? (
                              <span className="text-red-600">{formatAmount(pendingAmount)}</span>
                            ) : (
                              <span className="text-green-600">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/purchase/edit/${purchase.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {isAdmin && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setPurchaseToDelete(purchase);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredPurchases.map((purchase) => {
                const pendingAmount = getPendingAmount(purchase);
                return (
                <Card key={purchase.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{purchase.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCompanyName(purchase.companyId)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-muted-foreground">
                        {new Date(purchase.date).toLocaleDateString()}
                      </span>
                      {getPaymentStatusBadge(purchase)}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-medium">{purchase.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold" title={formatAmount(purchase.total)}>
                        {formatCompactAmount(purchase.total)}
                      </span>
                    </div>
                    {pendingAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-bold text-red-600">
                          {formatAmount(pendingAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/purchase/edit/${purchase.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          setPurchaseToDelete(purchase);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </Card>
              )})}
            </div>
          </div>
        )}
      </div>
      
      <PurchaseDetailModal purchase={selectedPurchase} open={isModalOpen} onOpenChange={setIsModalOpen} />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase <span className="font-semibold">{purchaseToDelete?.invoiceNo}</span>?
              This action cannot be undone and will remove all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePurchase} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
