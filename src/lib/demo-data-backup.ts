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
    date: "2025-10-25",
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
    createdAt: "2025-10-25T10:30:00.000Z"
  },
  {
    id: 2,
    companyId: 2,
    invoiceNo: "CIP/2025/045",
    date: "2025-11-01",
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
    createdAt: "2025-11-01T14:15:00.000Z"
  },
  {
    id: 3,
    companyId: 3,
    invoiceNo: "DRD/2025/112",
    date: "2025-11-10",
    items: [
      { productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 150, freeQty: 0, batch: "CR2501", expiry: "2026-06-30", rate: 88, amount: 13200 },
      { productId: 6, companyId: 3, brandName: "Combiflam", qty: 100, freeQty: 10, batch: "CF2501", expiry: "2026-08-31", rate: 72, amount: 7200 }
    ],
    subtotal: 20400,
    gst: 2376,
    total: 22776,
    paymentStatus: 'pending',
    inventoryPhotos: [],
    createdAt: "2025-11-10T09:20:00.000Z"
  },
  {
    id: 4,
    companyId: 4,
    invoiceNo: "LUP/2024/789",
    date: "2025-11-15",
    items: [
      { productId: 5, companyId: 4, brandName: "Sinarest", qty: 60, freeQty: 0, batch: "SN2411", expiry: "2025-05-15", rate: 82, amount: 4920 }
    ],
    subtotal: 4920,
    gst: 590.40,
    total: 5510.40,
    paymentStatus: 'paid',
    paidAmount: 5510.40,
    inventoryPhotos: [],
    createdAt: "2025-11-15T11:45:00.000Z"
  },
  {
    id: 5,
    companyId: 1,
    invoiceNo: "SP/2025/002",
    date: "2025-11-20",
    items: [
      { productId: 1, companyId: 1, brandName: "Dolo-650", qty: 120, freeQty: 12, batch: "DL2402", expiry: "2027-01-31", rate: 90.90, amount: 10908 },
      { productId: 3, companyId: 1, brandName: "Pan-D", qty: 100, freeQty: 0, batch: "PD2404", expiry: "2027-02-28", rate: 95, amount: 9500 }
    ],
    subtotal: 20408,
    gst: 2448.96,
    total: 22856.96,
    paymentStatus: 'paid',
    paidAmount: 22856.96,
    inventoryPhotos: [],
    createdAt: "2025-11-20T10:30:00.000Z"
  }
];

export const demoSales: Sale[] = [
  // August 2025 - Starting phase (15 sales)
  { id: 1, customerId: 1, invoiceNo: "RM/2025/001", date: "2025-08-25", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 20, batch: "DL2401", rate: 118.17, amount: 2363.40 }], subtotal: 2363.40, gst: 283.61, total: 2647.01, status: 'paid', paidAmount: 2647.01 },
  { id: 2, customerId: 2, invoiceNo: "RM/2025/002", date: "2025-08-26", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 15, batch: "AU2402", rate: 214.50, amount: 3217.50 }], subtotal: 3217.50, gst: 386.10, total: 3603.60, status: 'paid', paidAmount: 3603.60 },
  { id: 3, customerId: 3, invoiceNo: "RM/2025/003", date: "2025-08-27", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 25, batch: "PD2403", rate: 123.50, amount: 3087.50 }], subtotal: 3087.50, gst: 370.50, total: 3458, status: 'paid', paidAmount: 3458 },
  { id: 4, customerId: 1, invoiceNo: "RM/2025/004", date: "2025-08-28", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 18, batch: "AZ2404", rate: 160, amount: 2880 }], subtotal: 2880, gst: 345.60, total: 3225.60, status: 'paid', paidAmount: 3225.60 },
  { id: 5, customerId: 4, invoiceNo: "RM/2025/005", date: "2025-08-29", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 30, batch: "CR2501", rate: 123.20, amount: 3696 }], subtotal: 3696, gst: 443.52, total: 4139.52, status: 'paid', paidAmount: 4139.52 },
  { id: 6, customerId: 2, invoiceNo: "RM/2025/006", date: "2025-08-30", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 35, batch: "CF2501", rate: 100.80, amount: 3528 }], subtotal: 3528, gst: 388.08, total: 3916.08, status: 'paid', paidAmount: 3916.08 },
  { id: 7, customerId: 5, invoiceNo: "RM/2025/007", date: "2025-08-31", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 22, batch: "SN2411", rate: 127.10, amount: 2796.20 }], subtotal: 2796.20, gst: 335.54, total: 3131.74, status: 'paid', paidAmount: 3131.74 },
  
  // September 2025 - Growth phase (20 sales, every 1-2 days)
  { id: 8, customerId: 1, invoiceNo: "RM/2025/008", date: "2025-09-01", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 25, batch: "DL2401", rate: 118.17, amount: 2954.25 }], subtotal: 2954.25, gst: 354.51, total: 3308.76, status: 'paid', paidAmount: 3308.76 },
  { id: 9, customerId: 3, invoiceNo: "RM/2025/009", date: "2025-09-03", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 20, batch: "AU2402", rate: 214.50, amount: 4290 }], subtotal: 4290, gst: 514.80, total: 4804.80, status: 'paid', paidAmount: 4804.80 },
  { id: 10, customerId: 2, invoiceNo: "RM/2025/010", date: "2025-09-05", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 35, batch: "PD2403", rate: 123.50, amount: 4322.50 }], subtotal: 4322.50, gst: 518.70, total: 4841.20, status: 'paid', paidAmount: 4841.20 },
  { id: 11, customerId: 4, invoiceNo: "RM/2025/011", date: "2025-09-07", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 22, batch: "AZ2404", rate: 160, amount: 3520 }], subtotal: 3520, gst: 422.40, total: 3942.40, status: 'paid', paidAmount: 3942.40 },
  { id: 12, customerId: 1, invoiceNo: "RM/2025/012", date: "2025-09-09", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 40, batch: "CF2501", rate: 100.80, amount: 4032 }], subtotal: 4032, gst: 443.52, total: 4475.52, status: 'paid', paidAmount: 4475.52 },
  { id: 13, customerId: 5, invoiceNo: "RM/2025/013", date: "2025-09-11", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 28, batch: "DL2401", rate: 118.17, amount: 3308.76 }], subtotal: 3308.76, gst: 397.05, total: 3705.81, status: 'paid', paidAmount: 3705.81 },
  { id: 14, customerId: 2, invoiceNo: "RM/2025/014", date: "2025-09-13", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 26, batch: "SN2411", rate: 127.10, amount: 3304.60 }], subtotal: 3304.60, gst: 396.55, total: 3701.15, status: 'paid', paidAmount: 3701.15 },
  { id: 15, customerId: 3, invoiceNo: "RM/2025/015", date: "2025-09-15", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 25, batch: "AU2402", rate: 214.50, amount: 5362.50 }], subtotal: 5362.50, gst: 643.50, total: 6006, status: 'paid', paidAmount: 6006 },
  { id: 16, customerId: 1, invoiceNo: "RM/2025/016", date: "2025-09-17", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 42, batch: "PD2403", rate: 123.50, amount: 5187 }], subtotal: 5187, gst: 622.44, total: 5809.44, status: 'paid', paidAmount: 5809.44 },
  { id: 17, customerId: 4, invoiceNo: "RM/2025/017", date: "2025-09-19", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 38, batch: "CR2501", rate: 123.20, amount: 4681.60 }], subtotal: 4681.60, gst: 561.79, total: 5243.39, status: 'paid', paidAmount: 5243.39 },
  { id: 18, customerId: 2, invoiceNo: "RM/2025/018", date: "2025-09-21", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 48, batch: "CF2501", rate: 100.80, amount: 4838.40 }], subtotal: 4838.40, gst: 532.22, total: 5370.62, status: 'paid', paidAmount: 5370.62 },
  { id: 19, customerId: 5, invoiceNo: "RM/2025/019", date: "2025-09-23", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 28, batch: "AZ2404", rate: 160, amount: 4480 }], subtotal: 4480, gst: 537.60, total: 5017.60, status: 'paid', paidAmount: 5017.60 },
  { id: 20, customerId: 1, invoiceNo: "RM/2025/020", date: "2025-09-25", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 32, batch: "DL2401", rate: 118.17, amount: 3781.44 }], subtotal: 3781.44, gst: 453.77, total: 4235.21, status: 'paid', paidAmount: 4235.21 },
  { id: 21, customerId: 3, invoiceNo: "RM/2025/021", date: "2025-09-27", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 28, batch: "AU2402", rate: 214.50, amount: 6006 }], subtotal: 6006, gst: 720.72, total: 6726.72, status: 'paid', paidAmount: 6726.72 },
  { id: 22, customerId: 2, invoiceNo: "RM/2025/022", date: "2025-09-29", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 48, batch: "PD2403", rate: 123.50, amount: 5928 }], subtotal: 5928, gst: 711.36, total: 6639.36, status: 'paid', paidAmount: 6639.36 },
  
  // October 2025 - Accelerated growth (25 sales, daily)
  { id: 23, customerId: 1, invoiceNo: "RM/2025/023", date: "2025-10-01", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 30, batch: "AZ2404", rate: 160, amount: 4800 }], subtotal: 4800, gst: 576, total: 5376, status: 'paid', paidAmount: 5376 },
  { id: 24, customerId: 4, invoiceNo: "RM/2025/024", date: "2025-10-03", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 42, batch: "CR2501", rate: 123.20, amount: 5174.40 }], subtotal: 5174.40, gst: 620.93, total: 5795.33, status: 'paid', paidAmount: 5795.33 },
  { id: 25, customerId: 2, invoiceNo: "RM/2025/025", date: "2025-10-05", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 52, batch: "CF2501", rate: 100.80, amount: 5241.60 }], subtotal: 5241.60, gst: 576.58, total: 5818.18, status: 'paid', paidAmount: 5818.18 },
  { id: 26, customerId: 5, invoiceNo: "RM/2025/026", date: "2025-10-07", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 30, batch: "SN2411", rate: 127.10, amount: 3813 }], subtotal: 3813, gst: 457.56, total: 4270.56, status: 'paid', paidAmount: 4270.56 },
  { id: 27, customerId: 1, invoiceNo: "RM/2025/027", date: "2025-10-09", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 35, batch: "DL2401", rate: 118.17, amount: 4135.95 }], subtotal: 4135.95, gst: 496.31, total: 4632.26, status: 'paid', paidAmount: 4632.26 },
  { id: 28, customerId: 3, invoiceNo: "RM/2025/028", date: "2025-10-11", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 32, batch: "AU2402", rate: 214.50, amount: 6864 }], subtotal: 6864, gst: 823.68, total: 7687.68, status: 'paid', paidAmount: 7687.68 },
  { id: 29, customerId: 2, invoiceNo: "RM/2025/029", date: "2025-10-13", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 52, batch: "PD2403", rate: 123.50, amount: 6422 }], subtotal: 6422, gst: 770.64, total: 7192.64, status: 'paid', paidAmount: 7192.64 },
  { id: 30, customerId: 4, invoiceNo: "RM/2025/030", date: "2025-10-15", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 35, batch: "AZ2404", rate: 160, amount: 5600 }], subtotal: 5600, gst: 672, total: 6272, status: 'paid', paidAmount: 6272 },
  { id: 31, customerId: 1, invoiceNo: "RM/2025/031", date: "2025-10-17", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 58, batch: "CF2501", rate: 100.80, amount: 5846.40 }], subtotal: 5846.40, gst: 643.10, total: 6489.50, status: 'paid', paidAmount: 6489.50 },
  { id: 32, customerId: 5, invoiceNo: "RM/2025/032", date: "2025-10-19", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 38, batch: "DL2401", rate: 118.17, amount: 4490.46 }], subtotal: 4490.46, gst: 538.86, total: 5029.32, status: 'paid', paidAmount: 5029.32 },
  { id: 33, customerId: 2, invoiceNo: "RM/2025/033", date: "2025-10-21", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 32, batch: "SN2411", rate: 127.10, amount: 4067.20 }], subtotal: 4067.20, gst: 488.06, total: 4555.26, status: 'paid', paidAmount: 4555.26 },
  { id: 34, customerId: 3, invoiceNo: "RM/2025/034", date: "2025-10-23", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 35, batch: "AU2402", rate: 214.50, amount: 7507.50 }], subtotal: 7507.50, gst: 900.90, total: 8408.40, status: 'paid', paidAmount: 8408.40 },
  { id: 35, customerId: 1, invoiceNo: "RM/2025/035", date: "2025-10-25", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 30, batch: "DL2401", rate: 118.17, amount: 3545.10 }], subtotal: 3545.10, gst: 425.41, total: 3970.51, status: 'paid', paidAmount: 3970.51 },
  { id: 2, customerId: 2, invoiceNo: "RM/2025/002", date: "2025-10-26", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 20, batch: "AU2402", rate: 214.50, amount: 4290 }], subtotal: 4290, gst: 514.80, total: 4804.80, status: 'paid', paidAmount: 4804.80 },
  { id: 3, customerId: 3, invoiceNo: "RM/2025/003", date: "2025-10-27", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 40, batch: "PD2403", rate: 123.50, amount: 4940 }], subtotal: 4940, gst: 592.80, total: 5532.80, status: 'unpaid' },
  { id: 4, customerId: 1, invoiceNo: "RM/2025/004", date: "2025-10-28", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 25, batch: "AZ2404", rate: 160, amount: 4000 }], subtotal: 4000, gst: 480, total: 4480, status: 'paid', paidAmount: 4480 },
  { id: 5, customerId: 4, invoiceNo: "RM/2025/005", date: "2025-10-29", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 50, batch: "CR2501", rate: 123.20, amount: 6160 }], subtotal: 6160, gst: 739.20, total: 6899.20, status: 'partial', paidAmount: 4000 },
  { id: 6, customerId: 2, invoiceNo: "RM/2025/006", date: "2025-10-30", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 60, batch: "CF2501", rate: 100.80, amount: 6048 }], subtotal: 6048, gst: 665.28, total: 6713.28, status: 'paid', paidAmount: 6713.28 },
  { id: 7, customerId: 5, invoiceNo: "RM/2025/007", date: "2025-10-31", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 35, batch: "SN2411", rate: 127.10, amount: 4448.50 }], subtotal: 4448.50, gst: 533.82, total: 4982.32, status: 'unpaid' },
  
  // November - showing growth
  { id: 8, customerId: 1, invoiceNo: "RM/2025/008", date: "2025-11-01", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 45, batch: "DL2401", rate: 118.17, amount: 5317.65 }], subtotal: 5317.65, gst: 638.12, total: 5955.77, status: 'paid', paidAmount: 5955.77 },
  { id: 9, customerId: 3, invoiceNo: "RM/2025/009", date: "2025-11-02", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 30, batch: "AU2402", rate: 214.50, amount: 6435 }], subtotal: 6435, gst: 772.20, total: 7207.20, status: 'paid', paidAmount: 7207.20 },
  { id: 10, customerId: 2, invoiceNo: "RM/2025/010", date: "2025-11-03", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 55, batch: "PD2403", rate: 123.50, amount: 6792.50 }], subtotal: 6792.50, gst: 815.10, total: 7607.60, status: 'paid', paidAmount: 7607.60 },
  { id: 11, customerId: 4, invoiceNo: "RM/2025/011", date: "2025-11-04", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 35, batch: "AZ2404", rate: 160, amount: 5600 }], subtotal: 5600, gst: 672, total: 6272, status: 'unpaid' },
  { id: 12, customerId: 1, invoiceNo: "RM/2025/012", date: "2025-11-05", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 70, batch: "CF2501", rate: 100.80, amount: 7056 }], subtotal: 7056, gst: 776.16, total: 7832.16, status: 'paid', paidAmount: 7832.16 },
  { id: 13, customerId: 5, invoiceNo: "RM/2025/013", date: "2025-11-06", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 50, batch: "DL2401", rate: 118.17, amount: 5908.50 }], subtotal: 5908.50, gst: 709.02, total: 6617.52, status: 'unpaid' },
  { id: 14, customerId: 2, invoiceNo: "RM/2025/014", date: "2025-11-07", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 40, batch: "SN2411", rate: 127.10, amount: 5084 }], subtotal: 5084, gst: 610.08, total: 5694.08, status: 'paid', paidAmount: 5694.08 },
  { id: 15, customerId: 3, invoiceNo: "RM/2025/015", date: "2025-11-08", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 40, batch: "AU2402", rate: 214.50, amount: 8580 }], subtotal: 8580, gst: 1029.60, total: 9609.60, status: 'partial', paidAmount: 6000 },
  { id: 16, customerId: 1, invoiceNo: "RM/2025/016", date: "2025-11-09", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 65, batch: "PD2403", rate: 123.50, amount: 8027.50 }], subtotal: 8027.50, gst: 963.30, total: 8990.80, status: 'paid', paidAmount: 8990.80 },
  { id: 17, customerId: 4, invoiceNo: "RM/2025/017", date: "2025-11-10", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 60, batch: "CR2501", rate: 123.20, amount: 7392 }], subtotal: 7392, gst: 887.04, total: 8279.04, status: 'paid', paidAmount: 8279.04 },
  { id: 18, customerId: 2, invoiceNo: "RM/2025/018", date: "2025-11-11", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 80, batch: "CF2501", rate: 100.80, amount: 8064 }], subtotal: 8064, gst: 887.04, total: 8951.04, status: 'paid', paidAmount: 8951.04 },
  { id: 19, customerId: 5, invoiceNo: "RM/2025/019", date: "2025-11-12", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 45, batch: "AZ2404", rate: 160, amount: 7200 }], subtotal: 7200, gst: 864, total: 8064, status: 'unpaid' },
  { id: 20, customerId: 1, invoiceNo: "RM/2025/020", date: "2025-11-13", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 55, batch: "DL2401", rate: 118.17, amount: 6499.35 }], subtotal: 6499.35, gst: 779.92, total: 7279.27, status: 'paid', paidAmount: 7279.27 },
  { id: 21, customerId: 3, invoiceNo: "RM/2025/021", date: "2025-11-14", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 45, batch: "AU2402", rate: 214.50, amount: 9652.50 }], subtotal: 9652.50, gst: 1158.30, total: 10810.80, status: 'paid', paidAmount: 10810.80 },
  { id: 22, customerId: 2, invoiceNo: "RM/2025/022", date: "2025-11-15", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 70, batch: "PD2403", rate: 123.50, amount: 8645 }], subtotal: 8645, gst: 1037.40, total: 9682.40, status: 'partial', paidAmount: 5000 },
  { id: 23, customerId: 4, invoiceNo: "RM/2025/023", date: "2025-11-16", items: [{ productId: 5, companyId: 4, brandName: "Sinarest", qty: 50, batch: "SN2411", rate: 127.10, amount: 6355 }], subtotal: 6355, gst: 762.60, total: 7117.60, status: 'unpaid' },
  { id: 24, customerId: 1, invoiceNo: "RM/2025/024", date: "2025-11-17", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 90, batch: "CF2501", rate: 100.80, amount: 9072 }], subtotal: 9072, gst: 997.92, total: 10069.92, status: 'paid', paidAmount: 10069.92 },
  { id: 25, customerId: 5, invoiceNo: "RM/2025/025", date: "2025-11-18", items: [{ productId: 1, companyId: 3, brandName: "Crocin Advance", qty: 65, batch: "CR2501", rate: 123.20, amount: 8008 }], subtotal: 8008, gst: 960.96, total: 8968.96, status: 'paid', paidAmount: 8968.96 },
  { id: 26, customerId: 2, invoiceNo: "RM/2025/026", date: "2025-11-19", items: [{ productId: 4, companyId: 2, brandName: "Azithral 500", qty: 50, batch: "AZ2404", rate: 160, amount: 8000 }], subtotal: 8000, gst: 960, total: 8960, status: 'paid', paidAmount: 8960 },
  { id: 27, customerId: 3, invoiceNo: "RM/2025/027", date: "2025-11-20", items: [{ productId: 2, companyId: 2, brandName: "Augmentin 625", qty: 50, batch: "AU2402", rate: 214.50, amount: 10725 }], subtotal: 10725, gst: 1287, total: 12012, status: 'paid', paidAmount: 12012 },
  { id: 28, customerId: 1, invoiceNo: "RM/2025/028", date: "2025-11-21", items: [{ productId: 3, companyId: 1, brandName: "Pan-D", qty: 75, batch: "PD2403", rate: 123.50, amount: 9262.50 }], subtotal: 9262.50, gst: 1111.50, total: 10374, status: 'unpaid' },
  { id: 29, customerId: 4, invoiceNo: "RM/2025/029", date: "2025-11-22", items: [{ productId: 1, companyId: 1, brandName: "Dolo-650", qty: 60, batch: "DL2401", rate: 118.17, amount: 7090.20 }], subtotal: 7090.20, gst: 850.82, total: 7941.02, status: 'paid', paidAmount: 7941.02 },
  { id: 30, customerId: 2, invoiceNo: "RM/2025/030", date: "2025-11-23", items: [{ productId: 6, companyId: 3, brandName: "Combiflam", qty: 95, batch: "CF2501", rate: 100.80, amount: 9576 }], subtotal: 9576, gst: 1053.36, total: 10629.36, status: 'paid', paidAmount: 10629.36 },
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
