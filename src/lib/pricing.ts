import { RateMaster, InventoryBatch, Customer } from '@/types';
import { getFromStorage } from './storage';

/**
 * Calculate selling price from batch cost and margin percentage
 * @param batchCost - Cost per unit from inventory batch
 * @param marginPercent - Margin percentage (e.g., 30 for 30%)
 * @param minPrice - Optional minimum price floor
 * @returns Calculated selling price
 */
export function calculateSellingPrice(
  batchCost: number,
  marginPercent: number,
  minPrice?: number
): number {
  const calculatedPrice = batchCost * (1 + marginPercent / 100);
  
  // If minimum price is set and calculated price is below it, use minimum price
  if (minPrice && calculatedPrice < minPrice) {
    return minPrice;
  }
  
  return parseFloat(calculatedPrice.toFixed(2));
}

/**
 * Get margin percentage for a customer and product
 * @param customerType - Customer type (A, B, or C)
 * @param productId - Product ID
 * @returns Rate master entry with margin percentage, or default 40% if not found
 */
export function getMarginForCustomer(
  customerType: 'A' | 'B' | 'C',
  productId: number
): RateMaster | null {
  const rateMaster = getFromStorage<RateMaster>('rateMaster');
  
  const rate = rateMaster.find(
    r => r.customerType === customerType && r.productId === productId
  );
  
  return rate || null;
}

/**
 * Calculate suggested selling price for a product batch and customer
 * @param batch - Inventory batch with cost information
 * @param customer - Customer with type information
 * @returns Object with calculated price, margin used, and whether min price was applied
 */
export function getSuggestedPrice(
  batch: InventoryBatch,
  customer: Customer
): {
  price: number;
  marginPercent: number;
  minPriceApplied: boolean;
  effectiveCost: number;
} {
  const rateInfo = getMarginForCustomer(customer.type, batch.productId);
  
  // Default margins if not in rate master
  const defaultMargins = { A: 30, B: 40, C: 50 };
  const marginPercent = rateInfo?.marginPercent ?? defaultMargins[customer.type];
  const minPrice = rateInfo?.minPrice;
  
  const calculatedPrice = calculateSellingPrice(batch.rate, marginPercent, minPrice);
  const minPriceApplied = minPrice !== undefined && calculatedPrice === minPrice;
  
  return {
    price: calculatedPrice,
    marginPercent,
    minPriceApplied,
    effectiveCost: batch.rate
  };
}

/**
 * Validate if selling price is below cost (potential loss)
 * @param sellingPrice - Proposed selling price
 * @param batchCost - Cost per unit from batch
 * @returns True if selling below cost
 */
export function isSellingBelowCost(sellingPrice: number, batchCost: number): boolean {
  return sellingPrice < batchCost;
}

/**
 * Calculate effective rate per unit when free quantity is included
 * @param qty - Quantity purchased
 * @param freeQty - Free quantity received
 * @param rate - Rate per unit paid
 * @returns Effective rate including free goods
 */
export function calculateEffectiveRate(qty: number, freeQty: number, rate: number): number {
  if (freeQty === 0) return rate;
  
  const totalQty = qty + freeQty;
  const totalCost = qty * rate;
  const effectiveRate = totalCost / totalQty;
  
  return parseFloat(effectiveRate.toFixed(2));
}

/**
 * Calculate savings from a scheme
 * @param qty - Quantity purchased
 * @param freeQty - Free quantity received
 * @param rate - Rate per unit
 * @returns Savings amount
 */
export function calculateSchemeSavings(qty: number, freeQty: number, rate: number): number {
  return freeQty * rate;
}

/**
 * Get all available batches for a product sorted by expiry (FIFO)
 * @param productId - Product ID
 * @returns Array of inventory batches sorted by expiry date (oldest first)
 */
export function getAvailableBatches(productId: number): InventoryBatch[] {
  const inventory = getFromStorage<InventoryBatch>('inventory');
  
  return inventory
    .filter(batch => batch.productId === productId && batch.qty > 0)
    .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
}

/**
 * Calculate days until expiry
 * @param expiryDate - Expiry date string (YYYY-MM-DD)
 * @returns Number of days until expiry (negative if expired)
 */
export function calculateDaysToExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get expiry status color for UI display
 * @param daysToExpiry - Number of days until expiry
 * @returns Color class for Tailwind CSS
 */
export function getExpiryColorClass(daysToExpiry: number): string {
  if (daysToExpiry < 0) return 'bg-red-100 border-red-300'; // Expired
  if (daysToExpiry < 30) return 'bg-red-50 border-red-200'; // < 30 days
  if (daysToExpiry < 90) return 'bg-orange-50 border-orange-200'; // 30-90 days
  if (daysToExpiry < 180) return 'bg-yellow-50 border-yellow-200'; // 90-180 days
  return 'bg-green-50 border-green-200'; // > 180 days
}

/**
 * Get expiry status badge
 * @param daysToExpiry - Number of days until expiry
 * @returns Object with badge text and color
 */
export function getExpiryBadge(daysToExpiry: number): { text: string; color: string } {
  if (daysToExpiry < 0) return { text: 'EXPIRED', color: 'bg-red-500 text-white' };
  if (daysToExpiry < 30) return { text: `${daysToExpiry} days left`, color: 'bg-red-500 text-white' };
  if (daysToExpiry < 90) return { text: `${daysToExpiry} days left`, color: 'bg-orange-500 text-white' };
  if (daysToExpiry < 180) return { text: `${daysToExpiry} days left`, color: 'bg-yellow-600 text-white' };
  return { text: `${daysToExpiry} days left`, color: 'bg-green-500 text-white' };
}
