export function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

export function getNextId(key: string): number {
  const items = getFromStorage<any>(key);
  return items.length > 0 ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;
}

export function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatCompactAmount(amount: number): string {
  if (amount >= 10000000) { // 1 crore or more
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) { // 1 lakh or more
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ===== SYSTEM SETTINGS =====

export function getSystemSettings(): any {
  try {
    const settings = localStorage.getItem('systemSettings');
    if (settings) return JSON.parse(settings);
    
    // Default settings
    const defaultSettings = {
      modules: {
        inventory: {
          enabled: true,
          features: {
            sales: true,
            purchase: true,
            payments: true,
            reports: true,
          },
        },
        hr: {
          enabled: true, // Enable by default for demo
          features: {
            attendance: true,
            leave: true,
            activities: true,
            performance: true,
          },
        },
      },
      subscription: {
        plan: 'professional',
        hrModuleActive: true,
        expiryDate: '2026-12-31',
      },
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch (error) {
    console.error('Error reading system settings:', error);
    return null;
  }
}

export function saveSystemSettings(settings: any): void {
  try {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving system settings:', error);
  }
}

export function isHRModuleEnabled(): boolean {
  const settings = getSystemSettings();
  return settings?.modules?.hr?.enabled ?? false;
}

// Basic HR features (always available for inventory tracking)
export function isBasicHREnabled(): boolean {
  return true; // Always enabled for timeline/activity tracking
}

// Full HR features (subscription-based: attendance, leave, full workforce management)
export function isFullHREnabled(): boolean {
  const settings = getSystemSettings();
  return settings?.subscription?.hrModuleActive ?? false;
}
