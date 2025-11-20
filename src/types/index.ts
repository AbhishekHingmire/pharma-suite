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
  name: string;
  generic: string;
  hsn: string;
  gst: number;
  packing: string;
  companyId: number;
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
  qty: number;
  freeQty: number;
  batch: string;
  expiry: string;
  rate: number;
  amount: number;
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
}

export interface SalesItem {
  productId: number;
  qty: number;
  batch: string;
  rate: number;
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
  batch: string;
  qty: number;
  purchaseDate: string;
  expiry: string;
  rate: number;
}

export interface Scheme {
  id: number;
  companyId: number;
  type: 'freeQty' | 'discount' | 'slab';
  buyQty?: number;
  freeQty?: number;
  discountPercent?: number;
  discountAmount?: number;
  slabs?: { minQty: number; maxQty: number; discount: number }[];
  validFrom: string;
  validTo: string;
  products: number[] | 'all';
  status: 'active' | 'inactive';
}

export interface RateMaster {
  customerId: number;
  productId: number;
  rate: number;
}

export interface Payment {
  id: number;
  customerId: number;
  amount: number;
  date: string;
  mode: 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque';
  reference?: string;
  invoices: number[];
  notes?: string;
}
