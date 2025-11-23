import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default' | 'warning';
  itemName?: string;
}

/**
 * Reusable confirmation dialog for destructive actions
 * 
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete Sale?"
 *   description="This will permanently delete the sale record."
 *   variant="destructive"
 *   itemName="Sale #INV-001"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  itemName,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 dark:bg-red-950';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950';
      default:
        return 'bg-blue-50 dark:bg-blue-950';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getIconBackground()}`}>
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              {itemName && (
                <div className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                  {itemName}
                </div>
              )}
              <AlertDialogDescription className="text-sm">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-600'
                : ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Specialized delete confirmation dialog
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemType: string;
  itemName?: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Delete ${itemType}?`}
      description={`This action cannot be undone. This will permanently delete the ${itemType.toLowerCase()} from the system.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      itemName={itemName}
    />
  );
}

/**
 * Specialized warning dialog (e.g., low stock, credit limit exceeded)
 */
export function WarningDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Proceed Anyway',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText="Cancel"
      variant="warning"
    />
  );
}

/**
 * Bulk delete confirmation
 */
export function BulkDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  count,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemType: string;
  count: number;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Delete ${count} ${itemType}s?`}
      description={`You are about to delete ${count} ${itemType.toLowerCase()}s. This action cannot be undone.`}
      confirmText={`Delete ${count} Items`}
      cancelText="Cancel"
      variant="destructive"
    />
  );
}
