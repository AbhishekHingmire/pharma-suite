import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Calendar, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage, formatAmount, formatCompactAmount } from '@/lib/storage';
import { Sale, Customer } from '@/types';
import { SaleDetailModal } from '@/components/SaleDetailModal';

export default function SalesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sales = getFromStorage<Sale>('sales');
  const customers = getFromStorage<Customer>('customers');

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  // Date filtering logic
  const filterByDate = (sale: Sale) => {
    if (dateFilter === 'all') return true;
    
    const saleDate = new Date(sale.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      return saleDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return saleDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return saleDate >= monthAgo;
    }
    return true;
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(s.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || s.customerId.toString() === customerFilter;
    const matchesDate = filterByDate(s);
    return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
  });

  const activeFiltersCount = [
    statusFilter !== 'all',
    dateFilter !== 'all',
    customerFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('all');
    setCustomerFilter('all');
    setSearchTerm('');
  };

  const getStatusBadge = (sale: Sale) => {
    const paidAmount = sale.paidAmount || 0;
    const totalAmount = sale.total;
    
    let status = sale.status;
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    
    if (status === 'paid') {
      variant = 'default';
      label = 'Paid';
    } else if (status === 'partial') {
      variant = 'secondary';
      label = `Partial (₹${formatCompactAmount(paidAmount)})`;
    } else {
      variant = 'destructive';
      label = 'Pending';
    }
    
    return (
      <Badge variant={variant} className="capitalize text-xs whitespace-nowrap">
        {label}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Sales">
      <div className="space-y-4">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
          <Button onClick={() => navigate('/sales/new')} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Filters</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </label>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Payment Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="flex-1"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('paid')}
                    className="flex-1"
                  >
                    Paid
                  </Button>
                  <Button
                    variant={statusFilter === 'unpaid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('unpaid')}
                    className="flex-1"
                  >
                    Pending
                  </Button>
                </div>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} found</span>
          {activeFiltersCount > 0 && (
            <span className="text-xs">{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
          )}
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
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold uppercase">Date</th>
                        <th className="text-left p-3 text-sm font-semibold uppercase">Invoice No</th>
                        <th className="text-left p-3 text-sm font-semibold uppercase">Customer</th>
                        <th className="text-right p-3 text-sm font-semibold uppercase">Products</th>
                        <th className="text-right p-3 text-sm font-semibold uppercase">Amount</th>
                        <th className="text-center p-3 text-sm font-semibold uppercase">Status</th>
                        <th className="text-center p-3 text-sm font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="p-3 text-sm font-medium">{sale.invoiceNo}</td>
                          <td className="p-3 text-sm">{getCustomerName(sale.customerId)}</td>
                          <td className="p-3 text-sm text-right">{sale.items.length}</td>
                          <td className="p-3 text-sm text-right font-semibold truncate max-w-[150px]" title={formatAmount(sale.total)}>
                            <span className="md:hidden">{formatCompactAmount(sale.total)}</span>
                            <span className="hidden md:inline">{formatAmount(sale.total)}</span>
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(sale)}
                          </td>
                          <td className="p-3">
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
                      {getStatusBadge(sale)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{sale.items.length} products</p>
                      <p className="text-lg font-bold truncate" title={formatAmount(sale.total)}>
                        {formatCompactAmount(sale.total)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="flex-shrink-0"
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
