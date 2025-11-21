# Pharma-Suite AI Development Context

## Project Overview
**Pharma-Suite** is a comprehensive pharmaceutical distribution management system built with React + TypeScript + Vite. It manages inventory, sales, purchases, payments, and HR operations for pharma distribution businesses.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Shadcn/UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: Zustand (auth), LocalStorage (data persistence)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **Date**: date-fns

## Architecture

### Modular Monolith Design
```
pharma-suite/
├── Inventory Module (Core - Always Active)
│   ├── Sales Management
│   ├── Purchase Management
│   ├── Inventory Tracking
│   ├── Payment Management
│   └── Reports & Analytics
│
└── HR Module (Two-Tier System)
    ├── Basic HR (FREE - Always Active)
    │   ├── Employee Timeline
    │   ├── Activity Tracking
    │   └── Performance Metrics
    │
    └── Full HR (PRO - Subscription)
        ├── Attendance Management
        ├── Leave Management
        ├── Shift Scheduling
        └── Full Workforce Management
```

### Data Architecture
- **Storage**: LocalStorage (JSON)
- **Collections**: users, sales, purchases, products, customers, companies, attendance, activities, leaveBalance
- **User Entity**: Dual-purpose (System User + Employee)
  - System fields: id, name, mobile, email, role (admin/staff), token
  - HR fields: employeeRole, employeeCode, department, status, joiningDate, workingHours, weeklyOff

### Two-Tier HR System
1. **Basic HR** (Always Enabled)
   - Purpose: Track inventory worker productivity
   - Features: Timeline, Activity logging, Performance tracking
   - Auto-logs: Sales, Purchases, Deliveries, Payments
   - Available: All users

2. **Full HR** (Subscription-based)
   - Purpose: Complete workforce management
   - Features: Attendance, Leave, Shifts, Reports
   - Gated by: `isFullHREnabled()` check
   - Available: Pro plan subscribers

## Key Files & Responsibilities

### Core Infrastructure
- `src/App.tsx` - Main routing, protected routes
- `src/main.tsx` - App entry point
- `src/lib/storage.ts` - LocalStorage helpers, HR tier checks
- `src/lib/utils.ts` - Utility functions (cn, formatters)
- `src/lib/demo-data.ts` - Inventory demo data
- `src/lib/hr-demo-data.ts` - HR demo data (200+ activities)

### Authentication
- `src/store/authStore.ts` - Zustand auth store
- `src/components/ProtectedRoute.tsx` - Route guards
- `src/pages/Login.tsx` - Login page

### Layout Components
- `src/components/layout/DashboardLayout.tsx` - Page wrapper with breadcrumbs
- `src/components/layout/Sidebar.tsx` - Main navigation (two-tier HR logic)
- `src/components/layout/TopBar.tsx` - Header with search, notifications, profile
- `src/components/layout/BottomNav.tsx` - Mobile navigation

### Navigation Logic (Sidebar)
```typescript
// Basic HR: Always visible
{ to: '/masters/employees', requiresBasicHR: true }

// Full HR: Only with subscription
{ to: '/attendance', requiresFullHR: true }

// Filtering
const filteredNavItems = navItems.filter(item => {
  const meetsHRRequirement = (!item.requiresBasicHR && !item.requiresFullHR) || 
                             (item.requiresBasicHR) || // Always available
                             (item.requiresFullHR && fullHREnabled); // Subscription check
  return hasRole && meetsHRRequirement;
});
```

### Inventory Pages
- **Sales**: `src/pages/sales/` - NewSale, SalesList, SaleDetailModal
- **Purchase**: `src/pages/purchase/` - NewPurchase, PurchaseList, EditPurchase, PurchaseDetailModal
- **Inventory**: `src/pages/inventory/InventoryStock.tsx` - Stock tracking
- **Payments**: `src/pages/payments/` - ReceivePayment, PendingPayments, PaymentHistory
- **Reports**: `src/pages/Reports.tsx` - Analytics dashboard
- **Masters**: `src/pages/masters/` - Companies, Products, Customers, Schemes, RateMaster

### HR Pages
- **Employees** (Basic HR): `src/pages/masters/Employees.tsx`
  - Purpose: Manage workforce, view timeline
  - Features: Cards grid, search, filters (2-col mobile), add/edit dialogs
  - UI: Compact cards (p-2, w-8 avatars), visible border-t separators
  - Breadcrumb: Shows "Home > Employees" (not Masters > Employees)
  - Navigation: Only Employees nav item highlights (Masters doesn't with `end` prop)
  - Always accessible for activity tracking

- **Attendance** (Full HR): `src/pages/hr/Attendance.tsx`
  - Purpose: Daily attendance tracking
  - Features: Mark attendance, list view, calendar view
  - Stats: Total, Present, Absent, Leave (Late badge in cards)
  - Calendar: Scaled 90%, clickable dates show daily attendance
  - Gated by: `isFullHREnabled()`

- **Timeline**: `src/pages/hr/EmployeeTimeline.tsx`
  - Purpose: Employee activity history
  - Features: Daily/Weekly/Monthly views, 1,800+ demo activities (6 months)
  - Activity types: Visit, Call, Meeting, Task, Delivery
  - Scrolling: max-h-[600px] overflow-y-auto for long lists
  - Data: Realistic variations (high/medium/low activity employees)

### Activity Logging (Auto-capture)
```typescript
// src/pages/sales/NewSale.tsx
const hrEnabled = isBasicHREnabled(); // Always true

if (hrEnabled && user) {
  const activity: EmployeeActivity = {
    id: getNextId('activities'),
    employeeId: user.id,
    employeeName: user.name,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'sale',
    title: `Sale Created - ${newSale.invoiceNumber}`,
    description: `Invoice for ${customer?.name} - ₹${newSale.total}`,
    saleId: newSale.id,
    customerId: newSale.customerId,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  // Save activity
}
```

### Settings Page
- `src/pages/Settings.tsx` - Module toggles, subscription info
- Shows: Basic HR (always active), Full HR (toggle switch)
- Load Demo Data button triggers `initializeHRDemoData()`

## Type System (`src/types/index.ts`)

### Core Types
```typescript
export type UserRole = 'admin' | 'staff';

export type EmployeeRole = 
  | 'admin' | 'sales-rep' | 'sales-manager' | 'sales-coordinator'
  | 'warehouse-manager' | 'warehouse-worker' | 'delivery-executive'
  | 'dispatch-coordinator' | 'purchase-manager' | 'accounts-executive'
  | 'data-entry' | 'qc-officer';

export type Department = 'sales' | 'warehouse' | 'operations' | 'accounts' | 'quality';

export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  token: string;
  
  // HR Module Fields (optional)
  employeeRole?: EmployeeRole;
  employeeCode?: string;
  department?: Department;
  status?: 'active' | 'inactive' | 'on-leave';
  joiningDate?: string;
  workingHours?: { start: string; end: string };
  weeklyOff?: number[]; // [0] = Sunday
}

export interface EmployeeActivity {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  type: 'sale' | 'purchase' | 'payment' | 'delivery' | 'visit' | 'call' | 'task' | 'meeting';
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  // Type-specific fields
  saleId?: number;
  purchaseId?: number;
  customerId?: number;
  visitDetails?: object;
  deliveryDetails?: object;
  duration?: number; // minutes
  location?: { lat: number; lng: number; address: string };
  createdAt: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'half-day' | 'leave' | 'holiday' | 'week-off';
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  workHours?: number;
  markedBy: string; // 'admin' | 'system' | userId
  notes?: string;
  createdAt: string;
}
```

## Design System

### Responsive Breakpoints
```css
/* Mobile First */
base: < 640px   (default, no prefix)
sm:  >= 640px   (tablet)
md:  >= 768px   (tablet landscape)
lg:  >= 1024px  (desktop)
xl:  >= 1280px  (large desktop)
```

### Grid Patterns
```tsx
// Stats Cards
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">

// Employee Cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

// Filters (Always 2 columns)
<div className="grid grid-cols-2 gap-3">
```

### Premium UI Principles
1. **Compact Sizes**: text-xs, h-8 buttons, text-[10px] labels
2. **Rounded Elements**: rounded-lg, rounded-full (avatars)
3. **Subtle Colors**: bg-muted/50, border-border
4. **Gradients**: bg-gradient-to-br from-primary/20
5. **Shadows**: hover:shadow-md transition-shadow
6. **Icons**: w-4 h-4 (12px, 16px)
7. **Spacing**: gap-3 (12px), p-2 for cards (8px for mobile optimization)
8. **Borders**: border-t separators between card sections for clarity

### Color System (Departments)
- Sales: Blue (bg-blue-500)
- Warehouse: Green (bg-green-500)
- Operations: Purple (bg-purple-500)
- Accounts: Orange (bg-orange-500)
- Quality: Pink (bg-pink-500)

## Storage Helpers

```typescript
// src/lib/storage.ts

// Basic CRUD
export function getFromStorage<T>(key: string): T[]
export function saveToStorage<T>(key: string, data: T[]): void
export function getNextId(key: string): number

// HR Tier Checks
export function isBasicHREnabled(): boolean // Always true
export function isFullHREnabled(): boolean // Subscription check

// Settings
export function getSystemSettings(): any
export function saveSystemSettings(settings: any): void
```

## Development Patterns

### 1. Component Structure
```tsx
// Always use DashboardLayout
export default function PageName() {
  // State
  const [data, setData] = useState([]);
  
  // Load data
  useEffect(() => {
    const stored = getFromStorage<Type>('key');
    setData(stored);
  }, []);
  
  // Handlers
  const handleAction = () => { /* ... */ };
  
  return (
    <DashboardLayout title="Page Title">
      <div className="space-y-4">
        {/* Content */}
      </div>
    </DashboardLayout>
  );
}
```

### 2. Mobile-First Styling
```tsx
// Bad
<div className="w-64 md:w-full">

// Good
<div className="w-full sm:w-64">
```

### 3. HR Feature Gating
```typescript
// Basic HR - Always available
const basicHR = isBasicHREnabled(); // true
if (basicHR) {
  // Log activity, show timeline, track performance
}

// Full HR - Subscription check
const fullHR = isFullHREnabled();
if (fullHR) {
  // Attendance, leave, shifts
}
```

### 4. Activity Logging Pattern
```typescript
// In any inventory operation (sale, purchase, payment)
if (isBasicHREnabled() && user) {
  const activity: EmployeeActivity = {
    id: getNextId('activities'),
    employeeId: user.id,
    employeeName: user.name,
    date: todayStr,
    timestamp: new Date().toISOString(),
    type: 'sale', // or 'purchase', 'payment', etc.
    title: 'Descriptive title',
    description: 'Details with amount',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  
  const activities = getFromStorage<EmployeeActivity>('activities');
  saveToStorage('activities', [...activities, activity]);
}
```

### 5. Demo Data Initialization
```typescript
// Call once when enabling HR module
initializeHRDemoData(); // Creates 5 employees, 30 days attendance, 1,800+ activities

// Structure
- 5 Employees (various roles)
- 30 days attendance (90% present, 5% leave, 5% absent)
- 1,800+ activities over 180 days (6 months) with realistic variations:
  * High activity employees: 3-5 activities/day (~900+ total)
  * Medium activity employees: 2-3 activities/day (~540+ total)
  * Low activity employees: 1-2 activities/day (~270+ total)
- Activity types: visits, calls, meetings, tasks, deliveries
- Leave balances (casual: 12, sick: 12, earned: 15)
```

## Common Issues & Solutions

### Issue: TypeScript Errors on User Type
**Problem**: `Type 'EmployeeStatus' is not assignable to type '"active"'`
**Solution**: Use explicit type annotation
```typescript
const [formData, setFormData] = useState<{
  role: 'admin' | 'staff';
  status: 'active' | 'inactive' | 'on-leave';
  // ...
}>({ /* defaults */ });
```

### Issue: HR Module Not Showing
**Problem**: Navigation items not appearing
**Solution**: Check tier requirement
```typescript
// Employees should use requiresBasicHR: true (always visible)
{ to: '/masters/employees', requiresBasicHR: true }

// Attendance should use requiresFullHR: true (subscription-gated)
{ to: '/attendance', requiresFullHR: true }
```

### Issue: Activities Not Logging
**Problem**: Sales/purchases not creating timeline entries
**Solution**: Use `isBasicHREnabled()` (always true)
```typescript
const hrEnabled = isBasicHREnabled(); // Not isFullHREnabled()
```

### Issue: Breadcrumb Showing Wrong Path
**Problem**: `/masters/employees` shows "Masters > Employees" instead of "Home > Employees"
**Solution**: Special case added in Breadcrumbs component
```typescript
if (location.pathname === '/masters/employees') {
  // Returns custom breadcrumb: Home > Employees
}
```

### Issue: Masters Nav Highlighting on Employees Page
**Problem**: Both Masters and Employees nav items highlighted when on `/masters/employees`
**Solution**: Add `end` prop to Masters NavLink for exact matching
```typescript
<NavLink to="/masters" end={item.to === '/masters'}>
```

## Routing Structure

```typescript
// Public
/login

// Protected (All Users)
/dashboard
/sales, /sales/new
/inventory
/profile

// Protected (Admin Only)
/purchase, /purchase/new, /purchase/edit/:id
/payments/*
/reports
/masters/* (companies, products, customers, schemes, rate-master)
/masters/employees // Basic HR - Always visible
/attendance // Full HR - Subscription gated
/employees/:employeeId/timeline
/settings
```

## Best Practices

### DO ✅
1. Use mobile-first responsive design (base → sm → lg)
2. Always wrap pages in `<DashboardLayout>`
3. Use `getFromStorage` and `saveToStorage` for data
4. Log activities with `isBasicHREnabled()` check
5. Gate full HR features with `isFullHREnabled()`
6. Use Shadcn/UI components (Card, Button, Dialog, etc.)
7. Show toast notifications with `toast.success()` / `toast.error()`
8. Use `getNextId()` for auto-incrementing IDs
9. Format dates as YYYY-MM-DD for storage
10. Keep UI compact: text-xs, h-8, text-[10px]

### DON'T ❌
1. Don't use `isHRModuleEnabled()` anymore (deprecated)
2. Don't create separate Users and Employees pages (merged)
3. Don't hardcode IDs (use `getNextId()`)
4. Don't forget mobile responsive styles
5. Don't skip HR tier checks when adding features
6. Don't use large UI elements (keep compact/premium)
7. Don't forget to update types when adding fields
8. Don't use external APIs (all data in LocalStorage)
9. Don't create pages without DashboardLayout
10. Don't forget toast notifications for user feedback

## Recent Changes & Decisions

### November 21, 2025
1. **Removed Users Page**: Merged with Employees (same entity)
2. **Two-Tier HR System**: Basic (free, always on) + Full (subscription)
3. **Enhanced Timeline**: 1,800+ activities (6 months, 4 employees with varied levels)
4. **Attendance Calendar**: Interactive date selection shows daily view
5. **Mobile Filters**: 2-column layout for department + status
6. **Late Badge**: Moved from stats card to individual attendance cards
7. **Calendar Optimization**: Scaled to 90%, 5-column grid (2-3 split)
8. **Employee Cards Optimized**: Reduced height by 20-25% for mobile (p-3→p-2, w-10→w-8 avatar, tighter spacing)
9. **Long Timeline Data**: 180 days (6 months) with realistic variations:
   - High activity: 3-5 activities/day (~900+ total)
   - Medium activity: 2-3 activities/day (~540+ total)
   - Low activity: 1-2 activities/day (~270+ total)
10. **Timeline Scrolling**: Added max-h-[600px] overflow-y-auto for long activity lists
11. **Card Borders**: Added visible border-t separators between sections (header, info, actions)
12. **Breadcrumb Fix**: `/masters/employees` now shows "Home > Employees" (not Masters > Employees)
13. **Navigation Fix**: Masters nav item no longer highlights when on Employees page (added `end` prop)

### Architecture Decisions
- **Why Two-Tier HR?** 
  - Basic HR solves inventory accountability (free, always on)
  - Full HR for businesses needing complete workforce management (paid)
  - Smooth upgrade path, no feature removal

- **Why Merge Users & Employees?**
  - Same entity, different views
  - Reduced code duplication
  - Clearer data model

- **Why Activity Auto-logging?**
  - Zero manual work for users
  - Real-time performance tracking
  - Accountability for inventory operations

## Testing Checklist

Before considering a feature complete:

1. ✅ No TypeScript errors
2. ✅ Mobile responsive (test at 375px, 768px, 1024px)
3. ✅ Toast notifications on actions
4. ✅ Data persists in LocalStorage
5. ✅ Works with both Basic and Full HR tiers
6. ✅ Breadcrumbs correct in DashboardLayout
7. ✅ Protected routes work for admin/staff
8. ✅ Demo data loads correctly
9. ✅ UI matches premium design system
10. ✅ Activity logging works (if applicable)

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run dev -- --port 3009  # Custom port

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Type Check
npx tsc --noEmit        # Check types without building
```

## Future Roadmap (Not Implemented)

- [ ] Leave Request & Approval workflow
- [ ] Shift scheduling & rostering
- [ ] Employee self-service portal
- [ ] GPS-based check-in/out
- [ ] Performance rating system
- [ ] Payroll integration
- [ ] Customer visit geo-tagging
- [ ] Daily report submission
- [ ] Multi-location support
- [ ] Role-based dashboards (sales-rep, warehouse-worker views)

---

**Last Updated**: November 21, 2025
**Version**: 2.0.0 (Two-Tier HR System)
**Maintainer**: AI Agent + Developer

---

## Quick Reference Card

```
🏗️  ARCHITECTURE
├─ Modular Monolith
├─ LocalStorage persistence
├─ Two-tier HR (Basic free, Full paid)
└─ User = Employee (dual entity)

🎨 UI PATTERNS
├─ Mobile-first (base → sm → lg)
├─ Compact premium (text-xs, h-8)
├─ 2-col filters on mobile
└─ Grid: 1 → 2 → 3/4 cols

💾 STORAGE KEYS
├─ users (employees)
├─ sales, purchases, products
├─ attendance, activities
├─ systemSettings
└─ leaveBalance

🔐 HR GATING
├─ isBasicHREnabled() → Always true
└─ isFullHREnabled() → Subscription check

📱 RESPONSIVE BREAKPOINTS
├─ base: < 640px (mobile)
├─ sm: 640px+ (tablet)
└─ lg: 1024px+ (desktop)
```
