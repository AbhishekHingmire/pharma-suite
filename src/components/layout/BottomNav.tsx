import { Home, ShoppingCart, Receipt, Package, MoreHorizontal } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const { user } = useAuthStore();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home', roles: ['admin', 'staff'] },
    { to: '/purchase', icon: ShoppingCart, label: 'Purchase', roles: ['admin'] },
    { to: '/sales', icon: Receipt, label: 'Sales', roles: ['admin', 'staff'] },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'staff'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border lg:hidden shadow-lg">
      <div className="flex items-center justify-around h-full px-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={onMoreClick}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
