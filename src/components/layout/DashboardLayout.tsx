import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-60 pb-20 lg:pb-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        
        <main className="p-3 lg:p-6 max-w-full">
          <Breadcrumbs />
          {children}
        </main>
      </div>

      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
