import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Enhanced toast notifications with icons and better styling
 * Wraps sonner toast with consistent design patterns
 */
export const toast = {
  /**
   * Success toast - Green with check icon
   * Use for: Successful operations (save, create, update, delete)
   */
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      className: 'border-l-4 border-green-600',
      action: options?.action,
    });
  },

  /**
   * Error toast - Red with X icon
   * Use for: Errors, failed operations, validation errors
   */
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      className: 'border-l-4 border-red-600',
      action: options?.action,
    });
  },

  /**
   * Warning toast - Amber with alert triangle icon
   * Use for: Warnings, cautions, things user should be aware of
   */
  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      className: 'border-l-4 border-amber-600',
      action: options?.action,
    });
  },

  /**
   * Info toast - Blue with info icon
   * Use for: Information, tips, neutral notifications
   */
  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <Info className="h-5 w-5 text-blue-600" />,
      className: 'border-l-4 border-blue-600',
      action: options?.action,
    });
  },

  /**
   * Loading toast - Shows loading spinner
   * Use for: Long-running operations
   * Returns toast ID for updating/dismissing later
   */
  loading: (message: string, options?: Omit<ToastOptions, 'action'>) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: Infinity, // Loading toasts don't auto-dismiss
    });
  },

  /**
   * Promise toast - Automatically shows loading/success/error states
   * Use for: Async operations
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data) => ({
        title: typeof messages.success === 'function' ? messages.success(data) : messages.success,
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        className: 'border-l-4 border-green-600',
      }),
      error: (err) => ({
        title: typeof messages.error === 'function' ? messages.error(err) : messages.error,
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        className: 'border-l-4 border-red-600',
      }),
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Custom toast with full control
   */
  custom: (message: string, options: any) => {
    sonnerToast(message, options);
  },
};

/**
 * Confirmation toast with Undo action
 * Use for: Delete operations, important actions
 */
export const confirmationToast = (
  message: string,
  onUndo: () => void,
  options?: Omit<ToastOptions, 'action'>
) => {
  toast.success(message, {
    ...options,
    duration: 5000, // Longer duration for undo actions
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  });
};

/**
 * Batch operation toast
 * Use for: Operations affecting multiple items
 */
export const batchToast = (
  successCount: number,
  totalCount: number,
  itemName: string
) => {
  if (successCount === totalCount) {
    toast.success(`${successCount} ${itemName}(s) processed successfully`);
  } else if (successCount === 0) {
    toast.error(`Failed to process ${totalCount} ${itemName}(s)`);
  } else {
    toast.warning(
      `${successCount} of ${totalCount} ${itemName}(s) processed`,
      {
        description: `${totalCount - successCount} failed`,
      }
    );
  }
};

/**
 * Network status toast
 * Use for: API calls, network operations
 */
export const networkToast = {
  offline: () => {
    toast.warning('You are offline', {
      description: 'Changes will be saved locally',
      duration: 5000,
    });
  },
  online: () => {
    toast.info('You are back online', {
      description: 'Syncing your data...',
      duration: 3000,
    });
  },
  syncComplete: () => {
    toast.success('Data synced successfully');
  },
  syncFailed: () => {
    toast.error('Sync failed', {
      description: 'Please try again later',
      duration: 4000,
    });
  },
};

/**
 * Validation toast helpers
 */
export const validationToast = {
  required: (fieldName: string) => {
    toast.error(`${fieldName} is required`);
  },
  invalid: (fieldName: string, reason?: string) => {
    toast.error(`Invalid ${fieldName}`, {
      description: reason,
    });
  },
  tooShort: (fieldName: string, minLength: number) => {
    toast.error(`${fieldName} must be at least ${minLength} characters`);
  },
  tooLong: (fieldName: string, maxLength: number) => {
    toast.error(`${fieldName} must be less than ${maxLength} characters`);
  },
};

/**
 * Copy to clipboard toast
 */
export const copyToast = (itemName: string = 'Text') => {
  toast.success(`${itemName} copied to clipboard`, {
    duration: 2000,
  });
};

/**
 * Export toast
 */
export const exportToast = (format: string, fileName: string) => {
  toast.success(`Exported as ${format}`, {
    description: fileName,
    duration: 3000,
  });
};
