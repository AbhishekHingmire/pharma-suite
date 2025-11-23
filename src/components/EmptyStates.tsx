import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Receipt, ShoppingCart, Users, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  secondaryLabel?: string;
  secondaryAction?: () => void;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionPath,
  secondaryLabel,
  secondaryAction 
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3 justify-center">
          {actionLabel && actionPath && (
            <Button onClick={() => navigate(actionPath)} size="lg">
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && secondaryAction && (
            <Button variant="outline" onClick={secondaryAction} size="lg">
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function NoSalesEmpty() {
  return (
    <EmptyState
      icon={<Receipt className="w-10 h-10 text-muted-foreground" />}
      title="No sales yet"
      description="Create your first sale to start tracking your business transactions and revenue."
      actionLabel="Create First Sale"
      actionPath="/sales/new"
    />
  );
}

export function NoPurchasesEmpty() {
  return (
    <EmptyState
      icon={<ShoppingCart className="w-10 h-10 text-muted-foreground" />}
      title="No purchases recorded"
      description="Add your first purchase to manage your inventory and track supplier transactions."
      actionLabel="Add First Purchase"
      actionPath="/purchase/new"
    />
  );
}

export function NoInventoryEmpty() {
  return (
    <EmptyState
      icon={<Package className="w-10 h-10 text-muted-foreground" />}
      title="No inventory available"
      description="Your inventory is empty. Start by adding purchases to build your stock."
      actionLabel="Add Purchase"
      actionPath="/purchase/new"
    />
  );
}

export function NoCustomersEmpty() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<Users className="w-10 h-10 text-muted-foreground" />}
      title="No customers added"
      description="Add your first customer to start making sales and managing relationships."
      actionLabel="Add Customer"
      actionPath="/masters/customers"
    />
  );
}

export function NoReportsDataEmpty() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10 text-muted-foreground" />}
      title="No data for reports"
      description="Start by adding sales and purchases to generate meaningful business insights."
      actionLabel="Create Sale"
      actionPath="/sales/new"
      secondaryLabel="Add Purchase"
      secondaryAction={() => window.location.href = '/purchase/new'}
    />
  );
}

export function NoSearchResultsEmpty({ searchTerm }: { searchTerm?: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          {searchTerm 
            ? `No items found matching "${searchTerm}". Try adjusting your search or filters.`
            : "No items match your current filters. Try adjusting your criteria."
          }
        </p>
      </div>
    </Card>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Card className="p-12 text-center border-danger">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-danger">Something went wrong</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {retry && (
          <Button onClick={retry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}
