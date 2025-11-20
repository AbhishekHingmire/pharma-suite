import { Home, ShoppingCart, Receipt, Package, MoreHorizontal } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border lg:hidden shadow-lg">
      <div className="flex items-center justify-around h-full px-2">
        <NavLink
          to="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          activeClassName="text-primary bg-primary/10"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/purchase"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          activeClassName="text-primary bg-primary/10"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Purchase</span>
        </NavLink>

        <NavLink
          to="/sales"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          activeClassName="text-primary bg-primary/10"
        >
          <Receipt className="w-5 h-5" />
          <span className="text-xs font-medium">Sales</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          activeClassName="text-primary bg-primary/10"
        >
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Inventory</span>
        </NavLink>

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
