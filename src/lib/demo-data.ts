import { Company, Product, Customer, Scheme, RateMaster, Purchase, Sale, InventoryBatch, Payment } from '@/types';

export const demoCompanies: Company[] = [
  { id: 1, name: "Sun Pharma", logo: "https://ui-avatars.com/api/?name=Sun+Pharma&background=14B8A6&color=fff&size=80&bold=true", contact: "9876543210", paymentTerms: "30 days", status: 'active' },
  { id: 2, name: "Cipla", logo: "https://ui-avatars.com/api/?name=Cipla&background=3B82F6&color=fff&size=80&bold=true", contact: "9876543211", paymentTerms: "15 days", status: 'active' },
  { id: 3, name: "Dr Reddy's", logo: "https://ui-avatars.com/api/?name=Dr+Reddys&background=10B981&color=fff&size=80&bold=true", contact: "9876543212", paymentTerms: "30 days", status: 'active' },
  { id: 4, name: "Lupin", logo: "https://ui-avatars.com/api/?name=Lupin&background=F59E0B&color=fff&size=80&bold=true", contact: "9876543213", paymentTerms: "COD", status: 'active' },
  { id: 5, name: "Mankind", logo: "https://ui-avatars.com/api/?name=Mankind&background=EF4444&color=fff&size=80&bold=true", contact: "9876543214", paymentTerms: "30 days", status: 'active' }
];

export const demoProducts: Product[] = [
  { id: 1, name: "Dolo-650", generic: "Paracetamol", hsn: "30049099", gst: 12, packing: "10x10", companyId: 1, minStock: 50, status: 'active' },
  { id: 2, name: "Augmentin 625", generic: "Amoxicillin+Clavulanic Acid", hsn: "30042000", gst: 12, packing: "10x10", companyId: 2, minStock: 30, status: 'active' },
  { id: 3, name: "Crocin Advance", generic: "Paracetamol", hsn: "30049099", gst: 12, packing: "15x10", companyId: 3, minStock: 40, status: 'active' },
  { id: 4, name: "Pan-D", generic: "Pantoprazole+Domperidone", hsn: "30049011", gst: 12, packing: "10x15", companyId: 1, minStock: 50, status: 'active' },
  { id: 5, name: "Azithral 500", generic: "Azithromycin", hsn: "30042090", gst: 12, packing: "3x10", companyId: 2, minStock: 20, status: 'active' },
  { id: 6, name: "Sinarest", generic: "Paracetamol+Phenylephrine", hsn: "30049099", gst: 12, packing: "10x10", companyId: 4, minStock: 30, status: 'active' },
  { id: 7, name: "Combiflam", generic: "Ibuprofen+Paracetamol", hsn: "30049099", gst: 12, packing: "20x10", companyId: 3, minStock: 60, status: 'active' },
  { id: 8, name: "Allegra 120", generic: "Fexofenadine", hsn: "30049059", gst: 12, packing: "10x10", companyId: 1, minStock: 25, status: 'active' },
  { id: 9, name: "Avomine", generic: "Promethazine", hsn: "30049039", gst: 12, packing: "10x10", companyId: 5, minStock: 20, status: 'active' },
  { id: 10, name: "Benadryl Cough", generic: "Diphenhydramine", hsn: "30049049", gst: 18, packing: "100ml", companyId: 4, minStock: 15, status: 'active' }
];

export const demoCustomers: Customer[] = [
  { id: 1, name: "Apollo Pharmacy Kothrud", type: "A", phone: "9988776655", creditLimit: 500000, outstanding: 250000, address: "Kothrud, Pune", status: 'active', creditDays: 30 },
  { id: 2, name: "MedPlus Deccan", type: "A", phone: "9988776656", creditLimit: 400000, outstanding: 180000, address: "Deccan, Pune", status: 'active', creditDays: 30 },
  { id: 3, name: "Sahyadri Medicals", type: "B", phone: "9988776657", creditLimit: 200000, outstanding: 85000, address: "Shivajinagar, Pune", status: 'active', creditDays: 15 },
  { id: 4, name: "Care Pharmacy", type: "B", phone: "9988776658", creditLimit: 150000, outstanding: 45000, address: "Wakad, Pune", status: 'active', creditDays: 15 },
  { id: 5, name: "New Life Medicals", type: "C", phone: "9988776659", creditLimit: 100000, outstanding: 32000, address: "Hinjewadi, Pune", status: 'active', creditDays: 7 }
];

export const demoSchemes: Scheme[] = [
  { id: 1, companyId: 1, type: 'freeQty', buyQty: 100, freeQty: 10, validFrom: "2025-01-01", validTo: "2025-01-31", products: [1, 4, 8], status: 'active' },
  { id: 2, companyId: 2, type: 'discount', discountPercent: 5, validFrom: "2025-01-01", validTo: "2025-01-31", products: 'all', status: 'active' }
];

export const demoRateMaster: RateMaster[] = [
  { customerId: 1, productId: 1, rate: 95.90 },
  { customerId: 2, productId: 1, rate: 95.90 },
  { customerId: 3, productId: 1, rate: 105.90 },
  { customerId: 4, productId: 1, rate: 105.90 },
  { customerId: 5, productId: 1, rate: 110.90 },
  { customerId: 1, productId: 2, rate: 185.00 },
  { customerId: 2, productId: 2, rate: 185.00 },
  { customerId: 3, productId: 2, rate: 195.00 },
  { customerId: 4, productId: 2, rate: 195.00 },
  { customerId: 5, productId: 2, rate: 205.00 },
];

export const demoPurchases: Purchase[] = [
  {
    id: 1,
    companyId: 1,
    invoiceNo: "SP/2025/001",
    date: "2025-01-05",
    items: [
      { productId: 1, qty: 100, freeQty: 10, batch: "DL2401", expiry: "2026-12-31", rate: 90.90, amount: 9090 }
    ],
    subtotal: 9090,
    gst: 1090.80,
    total: 10180.80,
    paymentStatus: 'paid',
    paidAmount: 10180.80,
    inventoryPhotos: [],
    createdAt: "2025-01-05T10:30:00.000Z"
  },
  {
    id: 2,
    companyId: 2,
    invoiceNo: "CIP/2025/045",
    date: "2024-12-20",
    items: [
      { productId: 2, qty: 100, freeQty: 0, batch: "AU2402", expiry: "2025-06-30", rate: 165, amount: 16500 }
    ],
    subtotal: 16500,
    gst: 1980,
    total: 18480,
    paymentStatus: 'pending',
    inventoryPhotos: [],
    createdAt: "2024-12-20T14:15:00.000Z"
  }
];

export const demoSales: Sale[] = [
  {
    id: 1,
    customerId: 1,
    invoiceNo: "RM/2025/001",
    date: "2025-01-06",
    items: [
      { productId: 1, qty: 50, batch: "DL2401", rate: 95.90, amount: 4795 }
    ],
    subtotal: 4795,
    gst: 575.40,
    total: 5370.40,
    status: 'unpaid'
  },
  {
    id: 2,
    customerId: 2,
    invoiceNo: "RM/2025/002",
    date: "2025-01-08",
    items: [
      { productId: 2, qty: 30, batch: "AU2402", rate: 185, amount: 5550 }
    ],
    subtotal: 5550,
    gst: 666,
    total: 6216,
    status: 'paid',
    paidAmount: 6216
  }
];

export const demoInventory: InventoryBatch[] = [
  { productId: 1, batch: "DL2401", qty: 60, purchaseDate: "2025-01-05", expiry: "2026-12-31", rate: 90.90 },
  { productId: 2, batch: "AU2402", qty: 70, purchaseDate: "2024-12-20", expiry: "2025-06-30", rate: 165 },
  { productId: 3, batch: "CR2501", qty: 100, purchaseDate: "2025-01-10", expiry: "2026-06-30", rate: 88 },
  { productId: 4, batch: "PD2403", qty: 80, purchaseDate: "2024-11-15", expiry: "2025-05-15", rate: 95 },
  { productId: 5, batch: "AZ2404", qty: 45, purchaseDate: "2024-12-01", expiry: "2025-11-30", rate: 125 },
];

export const demoPayments: Payment[] = [
  {
    id: 1,
    customerId: 2,
    amount: 6216,
    date: "2025-01-10",
    mode: 'upi',
    reference: "UTR123456789",
    invoices: [2],
    notes: "Payment received via UPI"
  }
];

export function initializeDemoData() {
  if (!localStorage.getItem('companies')) {
    localStorage.setItem('companies', JSON.stringify(demoCompanies));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(demoProducts));
  }
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(demoCustomers));
  }
  if (!localStorage.getItem('schemes')) {
    localStorage.setItem('schemes', JSON.stringify(demoSchemes));
  }
  if (!localStorage.getItem('rateMaster')) {
    localStorage.setItem('rateMaster', JSON.stringify(demoRateMaster));
  }
  if (!localStorage.getItem('purchases')) {
    localStorage.setItem('purchases', JSON.stringify(demoPurchases));
  }
  if (!localStorage.getItem('sales')) {
    localStorage.setItem('sales', JSON.stringify(demoSales));
  }
  if (!localStorage.getItem('inventory')) {
    localStorage.setItem('inventory', JSON.stringify(demoInventory));
  }
  if (!localStorage.getItem('payments')) {
    localStorage.setItem('payments', JSON.stringify(demoPayments));
  }
}
