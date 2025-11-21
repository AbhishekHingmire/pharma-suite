// ===== MODULE SYSTEM =====
export interface SystemSettings {
  modules: {
    inventory: {
      enabled: boolean;
      features: {
        sales: boolean;
        purchase: boolean;
        payments: boolean;
        reports: boolean;
      };
    };
    hr: {
      enabled: boolean;
      features: {
        attendance: boolean;
        leave: boolean;
        activities: boolean;
        performance: boolean;
      };
    };
  };
  subscription: {
    plan: 'free' | 'professional' | 'enterprise';
    hrModuleActive: boolean;
    expiryDate?: string;
  };
}

// ===== USER & EMPLOYEE MANAGEMENT =====
export type UserRole = 'admin' | 'staff';

export type EmployeeRole = 
  | 'admin'                    // Owner/Director
  | 'sales-rep'                // Medical Representative
  | 'sales-manager'            // Area Sales Manager
  | 'sales-coordinator'        // Sales Coordinator
  | 'warehouse-manager'        // Warehouse Manager
  | 'warehouse-worker'         // Picker/Packer
  | 'delivery-executive'       // Driver/Delivery
  | 'dispatch-coordinator'     // Dispatch Coordinator
  | 'purchase-manager'         // Purchase Manager
  | 'accounts-executive'       // Accounts
  | 'data-entry'               // Data Entry Operator
  | 'qc-officer';              // Quality Control

export type Department = 'sales' | 'warehouse' | 'operations' | 'accounts' | 'quality';

export type EmployeeStatus = 'active' | 'inactive' | 'on-leave';

export interface Permission {
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface EmployeeTargets {
  type: 'sales' | 'visits' | 'deliveries';
  monthly: number;
  achieved: number;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  token: string;
  
  // HR Module Fields (optional, shown if HR module enabled)
  employeeRole?: EmployeeRole;
  employeeCode?: string;
  department?: Department;
  status?: EmployeeStatus;
  joiningDate?: string;
  reportingTo?: number;
  address?: string;
  emergencyContact?: string;
  workingHours?: {
    start: string;
    end: string;
  };
  weeklyOff?: number[];
  targets?: EmployeeTargets;
  permissions?: Permission[];
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
  createdBy?: number; // Employee ID who created this purchase
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
  createdBy?: number; // Employee ID who created this sale
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

// ===== HR MODULE TYPES =====

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave' | 'holiday' | 'week-off';
export type LeaveType = 'sick' | 'casual' | 'earned' | 'unpaid';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';
export type ActivityType = 'sale' | 'purchase' | 'delivery' | 'visit' | 'task' | 'meeting' | 'call' | 'payment';
export type ActivityStatus = 'completed' | 'pending' | 'in-progress';
export type ActivityPriority = 'low' | 'medium' | 'high';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  leaveType?: LeaveType;
  leaveReason?: string;
  workHours?: number;
  overtime?: number;
  checkInLocation?: Location;
  checkOutLocation?: Location;
  markedBy: 'self' | 'admin' | 'system';
  approvedBy?: number;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveRequestStatus;
  appliedOn: string;
  approvedBy?: number;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: number;
  year: number;
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  earned: { total: number; used: number; remaining: number };
}

export interface VisitDetails {
  customerName: string;
  customerType: 'doctor' | 'pharmacy' | 'hospital';
  location: Location;
  orderValue?: number;
  feedback?: string;
  nextFollowUp?: string;
}

export interface DeliveryDetails {
  orderId: number;
  customerName: string;
  deliveryStatus: 'delivered' | 'partial' | 'returned' | 'rescheduled';
  paymentCollected?: number;
  signature?: string;
}

export interface EmployeeActivity {
  id: number;
  employeeId: number;
  employeeName?: string; // For display
  date: string;
  timestamp: string;
  type: ActivityType;
  title: string;
  description?: string;
  saleId?: number;
  purchaseId?: number;
  customerId?: number;
  visitDetails?: VisitDetails;
  deliveryDetails?: DeliveryDetails;
  status: ActivityStatus;
  priority?: ActivityPriority;
  location?: Location;
  startTime?: string;
  endTime?: string;
  duration?: number;
  attachments?: string[];
  createdAt: string;
}

export interface SalesMetrics {
  visitsCompleted: number;
  ordersGenerated: number;
  orderValue: number;
  newCustomers: number;
}

export interface DeliveryMetrics {
  deliveriesCompleted: number;
  cashCollected: number;
  returns: number;
}

export interface WarehouseMetrics {
  ordersProcessed: number;
  stockAdjustments: number;
  itemsPicked: number;
}

export interface DailyReport {
  id: number;
  employeeId: number;
  date: string;
  totalActivities: number;
  completedTasks: number;
  pendingTasks: number;
  salesMetrics?: SalesMetrics;
  deliveryMetrics?: DeliveryMetrics;
  warehouseMetrics?: WarehouseMetrics;
  remarks?: string;
  submittedAt: string;
}
