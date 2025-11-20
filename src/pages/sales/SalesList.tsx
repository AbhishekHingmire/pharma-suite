import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage } from '@/lib/storage';
import { Sale, Customer } from '@/types';
import { SaleDetailModal } from '@/components/SaleDetailModal';

export default function SalesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sales = getFromStorage<Sale>('sales');
  const customers = getFromStorage<Customer>('customers');

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(s.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      unpaid: 'destructive',
      partial: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Sales">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('paid')}
              >
                Paid
              </Button>
              <Button
                variant={statusFilter === 'unpaid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('unpaid')}
              >
                Unpaid
              </Button>
            </div>
          </div>
          <Button onClick={() => navigate('/sales/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
        </div>

        {filteredSales.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-muted-foreground mb-6">Create your first sale to get started.</p>
              <Button onClick={() => navigate('/sales/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Sale
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
                        <th className="text-left p-4 font-semibold">Invoice No</th>
                        <th className="text-left p-4 font-semibold">Customer</th>
                        <th className="text-right p-4 font-semibold">Products</th>
                        <th className="text-right p-4 font-semibold">Amount</th>
                        <th className="text-center p-4 font-semibold">Status</th>
                        <th className="text-center p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-4">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{sale.invoiceNo}</td>
                          <td className="p-4">{getCustomerName(sale.customerId)}</td>
                          <td className="p-4 text-right">{sale.items.length}</td>
                          <td className="p-4 text-right font-semibold">
                            ₹{sale.total.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-center">
                            {getStatusBadge(sale.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
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
              {filteredSales.map((sale) => (
                <Card key={sale.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{sale.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCustomerName(sale.customerId)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString()}
                      </span>
                      {getStatusBadge(sale.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{sale.items.length} products</p>
                      <p className="text-lg font-bold">₹{sale.total.toLocaleString('en-IN')}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedSale(sale);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <SaleDetailModal sale={selectedSale} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  );
}
