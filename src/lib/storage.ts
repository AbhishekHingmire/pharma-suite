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
