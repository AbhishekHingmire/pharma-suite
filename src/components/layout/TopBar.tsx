import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/GlobalSearch';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { ProfileDropdown } from '@/components/ProfileDropdown';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-border flex items-center px-3 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {title && (
        <h2 className="text-base font-semibold">{title}</h2>
      )}

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <NotificationsPanel />
        <ProfileDropdown />
      </div>
    </header>
  );
}
