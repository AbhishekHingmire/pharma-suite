import { Home, ShoppingCart, Receipt, Package, CreditCard, FileText, Settings as SettingsIcon, Cog, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'staff'] },
    { to: '/purchase', icon: ShoppingCart, label: 'Purchase', roles: ['admin'] },
    { to: '/sales', icon: Receipt, label: 'Sales', roles: ['admin', 'staff'] },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'staff'] },
    { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin'] },
    { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin'] },
    { to: '/masters', icon: SettingsIcon, label: 'Masters', roles: ['admin'] },
    { to: '/settings', icon: Cog, label: 'Settings', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-60 bg-white border-r border-border transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">SchemeWise</h1>
          <p className="text-sm text-muted-foreground">Pharma Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary"
              onClick={onClose}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
