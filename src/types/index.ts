export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  mobile: string;
  role: UserRole;
  token: string;
}

export interface Company {
  id: number;
  name: string;
  logo: string;
  contact: string;
  email?: string;
  address?: string;
  gstin?: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: number;
  name: string; // Generic name e.g., "Paracetamol 500mg"
  generic: string;
  hsn: string;
  gst: number; // Can be 0, 5, 12, 18, or 28
  packing: string;
  minStock: number;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: number;
  name: string;
  type: 'A' | 'B' | 'C';
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  creditLimit: number;
  creditDays: number;
  outstanding: number;
  status: 'active' | 'inactive';
}

export interface PurchaseItem {
  productId: number;
  companyId: number; // Which company supplied this
  brandName: string; // Brand name e.g., "Dolo-650", "Crocin"
  qty: number;
  freeQty: number;
  batch: string;
  expiry: string;
  rate: number; // Cost per unit
  amount: number;
  discountPercent?: number; // Discount percentage applied
  discountAmount?: number; // Discount amount in rupees
  finalAmount?: number; // Amount after discount
}

export interface Purchase {
  id: number;
  companyId: number;
  invoiceNo: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paidAmount?: number;
  transactionId?: string;
  paymentProof?: string[];
  inventoryPhotos: string[];
  createdAt?: string;
  lastEditedAt?: string;
}

export interface SalesItem {
  productId: number;
  companyId: number; // Company/brand sold from
  brandName: string; // Brand name shown on invoice
  qty: number;
  batch: string;
  rate: number; // Selling price
  amount: number;
}

export interface Sale {
  id: number;
  customerId: number;
  invoiceNo: string;
  date: string;
  items: SalesItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial';
  paidAmount?: number;
}

export interface InventoryBatch {
  productId: number;
  companyId: number; // Which company supplied
  brandName: string; // Brand name for this batch
  batch: string;
  qty: number;
  purchaseDate: string;
  expiry: string;
  rate: number; // Cost per unit
}

export interface Scheme {
  id: number;
  companyId: number;
  type: 'freeQty' | 'discount' | 'slab' | 'cash' | 'volume' | 'trade' | 'seasonal' | 'combo';
  
  // For freeQty type (Buy X Get Y Free)
  buyQty?: number;
  freeQty?: number;
  
  // For discount type (Flat percentage discount)
  discountPercent?: number;
  minPurchaseQty?: number; // Minimum quantity to qualify for discount
  
  // For slab type (Tiered discounts based on quantity ranges)
  slabs?: { minQty: number; maxQty: number; discount: number }[];
  
  // For cash type (Discount for early payment)
  cashDiscountPercent?: number;
  paymentDays?: number; // Days within which payment must be made
  
  // For volume type (Discount based on invoice total amount)
  volumeSlabs?: { minAmount: number; maxAmount: number; discount: number }[];
  
  // For trade type (Fixed discount for retailers)
  tradeDiscountPercent?: number;
  
  // For seasonal type (Time-based promotional offers)
  seasonalDiscountPercent?: number;
  promoName?: string;
  
  // For combo type (Buy multiple products together)
  comboProducts?: number[]; // Array of product IDs
  comboDiscountPercent?: number;
  
  validFrom: string;
  validTo: string;
  products: number[] | 'all';
  status: 'active' | 'inactive';
}

export interface RateMaster {
  customerType: 'A' | 'B' | 'C'; // Changed from customerId to customerType
  productId: number;
  marginPercent: number; // Margin percentage (e.g., 30 for 30%)
  minPrice?: number; // Optional minimum selling price floor
}

export interface Payment {
  id: number;
  customerId: number;
  saleId?: number; // Reference to specific sale if applicable
  amount: number;
  date: string;
  mode: 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque';
  reference?: string;
  invoices: number[];
  notes?: string;
}
