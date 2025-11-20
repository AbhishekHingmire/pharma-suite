import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage } from '@/lib/storage';
import { Purchase, Company } from '@/types';

export default function PurchaseList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const purchases = getFromStorage<Purchase>('purchases');
  const companies = getFromStorage<Company>('companies');

  const getCompanyName = (id: number) => {
    return companies.find(c => c.id === id)?.name || 'Unknown';
  };

  const filteredPurchases = purchases.filter(p => 
    p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(p.companyId).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-6">Create your first purchase to get started.</p>
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
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Date</th>
                        <th className="text-left p-4 font-semibold">Company</th>
                        <th className="text-left p-4 font-semibold">Invoice No</th>
                        <th className="text-right p-4 font-semibold">Products</th>
                        <th className="text-right p-4 font-semibold">Amount</th>
                        <th className="text-center p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-4">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{getCompanyName(purchase.companyId)}</td>
                          <td className="p-4">{purchase.invoiceNo}</td>
                          <td className="p-4 text-right">{purchase.items.length}</td>
                          <td className="p-4 text-right font-semibold">
                            ₹{purchase.total.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-danger" />
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredPurchases.map((purchase) => (
                <Card key={purchase.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{purchase.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCompanyName(purchase.companyId)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{purchase.items.length} products</p>
                      <p className="text-lg font-bold">₹{purchase.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
