import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Package, CreditCard, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFromStorage } from '@/lib/storage';
import { InventoryBatch, Product, Sale } from '@/types';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'expiry' | 'lowstock' | 'overdue' | 'purchase';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [isOpen]);

  const loadNotifications = () => {
    const inventory = getFromStorage<InventoryBatch>('inventory');
    const products = getFromStorage<Product>('products');
    const sales = getFromStorage<Sale>('sales');

    const newNotifications: Notification[] = [];

    // Expiry alerts
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringProducts = inventory.filter(inv => {
      const expiryDate = new Date(inv.expiry);
      return expiryDate <= thirtyDaysLater && expiryDate > today;
    });

    if (expiringProducts.length > 0) {
      const totalValue = expiringProducts.reduce((sum, inv) => sum + (inv.qty * inv.rate), 0);
      newNotifications.push({
        id: 'expiry-alert',
        type: 'expiry',
        title: 'Products Expiring Soon',
        message: `${expiringProducts.length} products expiring in 30 days - ₹${totalValue.toLocaleString('en-IN')}`,
        time: 'Today',
        read: false
      });
    }

    // Low stock alerts
    const lowStockProducts = products.filter(p => {
      const totalQty = inventory
        .filter(inv => inv.productId === p.id)
        .reduce((sum, inv) => sum + inv.qty, 0);
      return totalQty < p.minStock;
    });

    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'lowstock-alert',
        type: 'lowstock',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products below minimum stock level`,
        time: 'Today',
        read: false
      });
    }

    // Overdue payments
    const overduePayments = sales.filter(s => s.status !== 'paid');
    if (overduePayments.length > 0) {
      const totalOverdue = overduePayments.reduce((sum, s) => sum + (s.total - (s.paidAmount || 0)), 0);
      newNotifications.push({
        id: 'overdue-alert',
        type: 'overdue',
        title: 'Overdue Payments',
        message: `₹${totalOverdue.toLocaleString('en-IN')} overdue from ${overduePayments.length} customers`,
        time: 'Today',
        read: false
      });
    }

    setNotifications(newNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'expiry': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'lowstock': return <Package className="w-4 h-4 text-warning" />;
      case 'overdue': return <CreditCard className="w-4 h-4 text-danger" />;
      case 'purchase': return <ShoppingCart className="w-4 h-4 text-info" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-card border rounded-lg shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs h-7"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">All caught up! 🎉</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-muted transition-colors",
                        !notification.read && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
