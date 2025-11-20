import { Company, Product, Customer, Scheme, RateMaster, Purchase, Sale, InventoryBatch, Payment } from '@/types';

export const demoCompanies: Company[] = [
  { id: 1, name: "Sun Pharma", logo: "https://ui-avatars.com/api/?name=Sun+Pharma&background=14B8A6&color=fff&size=80&bold=true", contact: "9876543210", paymentTerms: "30 days", status: 'active' },
  { id: 2, name: "Cipla", logo: "https://ui-avatars.com/api/?name=Cipla&background=3B82F6&color=fff&size=80&bold=true", contact: "9876543211", paymentTerms: "15 days", status: 'active' },
  { id: 3, name: "Dr Reddy's", logo: "https://ui-avatars.com/api/?name=Dr+Reddys&background=10B981&color=fff&size=80&bold=true", contact: "9876543212", paymentTerms: "30 days", status: 'active' },
  { id: 4, name: "Lupin", logo: "https://ui-avatars.com/api/?name=Lupin&background=F59E0B&color=fff&size=80&bold=true", contact: "9876543213", paymentTerms: "COD", status: 'active' },
  { id: 5, name: "Mankind", logo: "https://ui-avatars.com/api/?name=Mankind&background=EF4444&color=fff&size=80&bold=true", contact: "9876543214", paymentTerms: "30 days", status: 'active' }
];

export const demoProducts: Product[] = [
  { id: 1, name: "Paracetamol 500mg", generic: "Paracetamol", hsn: "30049099", gst: 12, packing: "10x10", minStock: 50, status: 'active' },
  { id: 2, name: "Amoxicillin+Clavulanic Acid 625mg", generic: "Amoxicillin+Clavulanic Acid", hsn: "30042000", gst: 12, packing: "10x10", minStock: 30, status: 'active' },
  { id: 3, name: "Pantoprazole+Domperidone", generic: "Pantoprazole+Domperidone", hsn: "30049011", gst: 12, packing: "10x15", minStock: 50, status: 'active' },
  { id: 4, name: "Azithromycin 500mg", generic: "Azithromycin", hsn: "30042090", gst: 12, packing: "3x10", minStock: 20, status: 'active' },
  { id: 5, name: "Paracetamol+Phenylephrine", generic: "Paracetamol+Phenylephrine", hsn: "30049099", gst: 12, packing: "10x10", minStock: 30, status: 'active' },
  { id: 6, name: "Ibuprofen+Paracetamol", generic: "Ibuprofen+Paracetamol", hsn: "30049099", gst: 5, packing: "20x10", minStock: 60, status: 'active' },
  { id: 7, name: "Fexofenadine 120mg", generic: "Fexofenadine", hsn: "30049059", gst: 12, packing: "10x10", minStock: 25, status: 'active' },
  { id: 8, name: "Promethazine", generic: "Promethazine", hsn: "30049039", gst: 18, packing: "10x10", minStock: 20, status: 'active' },
  { id: 9, name: "Diphenhydramine Syrup", generic: "Diphenhydramine", hsn: "30049049", gst: 18, packing: "100ml", minStock: 15, status: 'active' },
  { id: 10, name: "Cetirizine 10mg", generic: "Cetirizine", hsn: "30049050", gst: 12, packing: "10x10", minStock: 40, status: 'active' }
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
  // Type A customers - 30% margin
  { customerType: 'A', productId: 1, marginPercent: 30 },
  { customerType: 'A', productId: 2, marginPercent: 30 },
  { customerType: 'A', productId: 3, marginPercent: 30 },
  { customerType: 'A', productId: 4, marginPercent: 28 },
  { customerType: 'A', productId: 5, marginPercent: 30 },
  // Type B customers - 40% margin
  { customerType: 'B', productId: 1, marginPercent: 40 },
  { customerType: 'B', productId: 2, marginPercent: 40 },
  { customerType: 'B', productId: 3, marginPercent: 38 },
  { customerType: 'B', productId: 4, marginPercent: 40 },
  { customerType: 'B', productId: 5, marginPercent: 42 },
  // Type C customers - 50% margin
  { customerType: 'C', productId: 1, marginPercent: 50 },
  { customerType: 'C', productId: 2, marginPercent: 50 },
  { customerType: 'C', productId: 3, marginPercent: 48 },
  { customerType: 'C', productId: 4, marginPercent: 50, minPrice: 200 },
  { customerType: 'C', productId: 5, marginPercent: 55 },
];

export const demoPurchases: Purchase[] = [
  {
    id: 1,
    companyId: 1,
    invoiceNo: "SP/2025/001",
    date: "2025-01-05",
    items: [
      { productId: 1, companyId: 1, brandName: "Dolo-650", qty: 100, freeQty: 10, batch: "DL2401", expiry: "2026-12-31", rate: 90.90, amount: 9090 },
      { productId: 3, companyId: 1, brandName: "Pan-D", qty: 80, freeQty: 0, batch: "PD2403", expiry: "2026-11-30", rate: 95, amount: 7600 }
    ],
    subtotal: 16690,
    gst: 2002.80,
    total: 18692.80,
    paymentStatus: 'paid',
    paidAmount: 18692.80,
    inventoryPhotos: [],
    createdAt: "2025-01-05T10:30:00.000Z"
  },
  {
    id: 2,
    companyId: 2,
    invoiceNo: "CIP/2025/045",
    date: "2024-12-20",
    items: [
      { productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 100, freeQty: 0, batch: "AU2402", expiry: "2025-06-30", rate: 165, amount: 16500 },
      { productId: 4, companyId: 2, brandName: "Azithral 500", qty: 50, freeQty: 5, batch: "AZ2404", expiry: "2025-11-30", rate: 125, amount: 6250 }
    ],
    subtotal: 22750,
    gst: 2730,
    total: 25480,
    paymentStatus: 'partial',
    paidAmount: 15000,
    inventoryPhotos: [],
    createdAt: "2024-12-20T14:15:00.000Z"
  },
  {
    id: 3,
    companyId: 3,
    invoiceNo: "DRD/2025/112",
    date: "2025-01-10",
    items: [
      { productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 150, freeQty: 0, batch: "CR2501", expiry: "2026-06-30", rate: 88, amount: 13200 },
      { productId: 6, companyId: 3, brandName: "Combiflam", qty: 100, freeQty: 10, batch: "CF2501", expiry: "2026-08-31", rate: 72, amount: 7200 }
    ],
    subtotal: 20400,
    gst: 2376,
    total: 22776,
    paymentStatus: 'pending',
    inventoryPhotos: [],
    createdAt: "2025-01-10T09:20:00.000Z"
  },
  {
    id: 4,
    companyId: 4,
    invoiceNo: "LUP/2024/789",
    date: "2024-11-15",
    items: [
      { productId: 5, companyId: 4, brandName: "Sinarest", qty: 60, freeQty: 0, batch: "SN2411", expiry: "2025-05-15", rate: 82, amount: 4920 }
    ],
    subtotal: 4920,
    gst: 590.40,
    total: 5510.40,
    paymentStatus: 'paid',
    paidAmount: 5510.40,
    inventoryPhotos: [],
    createdAt: "2024-11-15T11:45:00.000Z"
  }
];

export const demoSales: Sale[] = [
  {
    id: 1,
    customerId: 1,
    invoiceNo: "RM/2025/001",
    date: "2025-01-06",
    items: [
      { productId: 1, companyId: 1, brandName: "Dolo-650", qty: 50, batch: "DL2401", rate: 118.17, amount: 5908.50 }
    ],
    subtotal: 5908.50,
    gst: 709.02,
    total: 6617.52,
    status: 'unpaid'
  },
  {
    id: 2,
    customerId: 2,
    invoiceNo: "RM/2025/002",
    date: "2025-01-08",
    items: [
      { productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 30, batch: "AU2402", rate: 214.50, amount: 6435 }
    ],
    subtotal: 6435,
    gst: 772.20,
    total: 7207.20,
    status: 'paid',
    paidAmount: 7207.20
  },
  {
    id: 3,
    customerId: 3,
    invoiceNo: "RM/2025/003",
    date: "2025-01-12",
    items: [
      { productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 80, batch: "CR2501", rate: 123.20, amount: 9856 },
      { productId: 6, companyId: 3, brandName: "Combiflam", qty: 50, batch: "CF2501", rate: 100.80, amount: 5040 }
    ],
    subtotal: 14896,
    gst: 1637.56,
    total: 16533.56,
    status: 'partial',
    paidAmount: 10000
  },
  {
    id: 4,
    customerId: 5,
    invoiceNo: "RM/2025/004",
    date: "2025-01-15",
    items: [
      { productId: 5, companyId: 4, brandName: "Sinarest", qty: 40, batch: "SN2411", rate: 127.10, amount: 5084 }
    ],
    subtotal: 5084,
    gst: 610.08,
    total: 5694.08,
    status: 'unpaid'
  }
];

export const demoInventory: InventoryBatch[] = [
  // Paracetamol from different brands/companies
  { productId: 1, companyId: 1, brandName: "Dolo-650", batch: "DL2401", qty: 60, purchaseDate: "2025-01-05", expiry: "2026-12-31", rate: 90.90 },
  { productId: 1, companyId: 3, brandName: "Crocin Advance", batch: "CR2501", qty: 70, purchaseDate: "2025-01-10", expiry: "2026-06-30", rate: 88 },
  
  // Other products
  { productId: 2, companyId: 2, brandName: "Augmentin 625", batch: "AU2402", qty: 70, purchaseDate: "2024-12-20", expiry: "2025-06-30", rate: 165 },
  { productId: 3, companyId: 1, brandName: "Pan-D", batch: "PD2403", qty: 80, purchaseDate: "2025-01-05", expiry: "2026-11-30", rate: 95 },
  { productId: 4, companyId: 2, brandName: "Azithral 500", batch: "AZ2404", qty: 55, purchaseDate: "2024-12-20", expiry: "2025-11-30", rate: 125 },
  { productId: 5, companyId: 4, brandName: "Sinarest", batch: "SN2411", qty: 20, purchaseDate: "2024-11-15", expiry: "2025-05-15", rate: 82 },
  { productId: 6, companyId: 3, brandName: "Combiflam", batch: "CF2501", qty: 60, purchaseDate: "2025-01-10", expiry: "2026-08-31", rate: 72 },
  
  // Some expired/expiring soon
  { productId: 7, companyId: 1, brandName: "Allegra 120", batch: "AL2412", qty: 25, purchaseDate: "2024-12-01", expiry: "2025-01-31", rate: 145 },
  { productId: 8, companyId: 5, brandName: "Avomine", batch: "AV2403", qty: 15, purchaseDate: "2024-03-20", expiry: "2024-12-31", rate: 38 },
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
