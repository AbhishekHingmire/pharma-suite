import { Home, ShoppingCart, Receipt, Package, CreditCard, FileText, FolderTree, Settings, LogOut, Users, Calendar } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { isFullHREnabled } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const fullHREnabled = isFullHREnabled();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'staff'], section: 'main' },
    { to: '/purchase', icon: ShoppingCart, label: 'Purchase', roles: ['admin'], section: 'inventory' },
    { to: '/sales', icon: Receipt, label: 'Sales', roles: ['admin', 'staff'], section: 'inventory' },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'staff'], section: 'inventory' },
    { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin'], section: 'inventory' },
    { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin'], section: 'inventory' },
    { to: '/masters', icon: FolderTree, label: 'Masters', roles: ['admin'], section: 'inventory' },
    { to: '/masters/employees', icon: Users, label: 'Employees', roles: ['admin'], section: 'hr', requiresBasicHR: true }, // Always visible
    { to: '/attendance', icon: Calendar, label: 'Attendance', roles: ['admin'], section: 'hr', requiresFullHR: true }, // Only with subscription
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'], section: 'bottom' },
  ];

  const filteredNavItems = navItems.filter(item => {
    const hasRole = item.roles.includes(user?.role || '');
    const meetsHRRequirement = (!item.requiresBasicHR && !item.requiresFullHR) || 
                               (item.requiresBasicHR) || // Basic HR always available
                               (item.requiresFullHR && fullHREnabled); // Full HR needs subscription
    return hasRole && meetsHRRequirement;
  });

  const sections = {
    main: filteredNavItems.filter(i => i.section === 'main'),
    inventory: filteredNavItems.filter(i => i.section === 'inventory'),
    hr: filteredNavItems.filter(i => i.section === 'hr'),
    bottom: filteredNavItems.filter(i => i.section === 'bottom'),
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-56 bg-white border-r border-border transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">Pharma Suite</h1>
          <p className="text-[11px] text-muted-foreground">Smart Management</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-4 pb-24 lg:pb-6">
            {/* Main Section */}
            <div className="space-y-1">
              {sections.main.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-foreground hover:bg-accent transition-colors"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={onClose}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Inventory Section */}
            {sections.inventory.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Inventory
                </p>
                {sections.inventory.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/masters'}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-foreground hover:bg-accent transition-colors"
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                    onClick={onClose}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}

            {/* HR Section */}
            {sections.hr.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    HR Module
                  </p>
                  {fullHREnabled && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-blue-600">Pro</Badge>
                  )}
                </div>
                {sections.hr.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-foreground hover:bg-accent transition-colors"
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                    onClick={onClose}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.to === '/attendance' && fullHREnabled && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 ml-auto">Pro</Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Bottom Section - Now inside scrollable area */}
            <div className="space-y-1 pt-2 border-t border-border">
              {sections.bottom.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-foreground hover:bg-accent transition-colors"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={onClose}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}
