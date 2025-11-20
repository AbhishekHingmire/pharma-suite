# SchemeWise - Pharma Distribution Management System

A comprehensive pharmaceutical distribution management system built with modern web technologies for managing purchases, sales, inventory, payments, and schemes.

## 🚀 Features

### Core Modules

- **Dashboard**: Real-time overview of sales, purchases, inventory, and payments
- **Purchase Management**: Track and manage pharmaceutical purchases from suppliers
- **Sales Management**: Process customer orders and track sales transactions
- **Inventory Management**: Monitor stock levels, batches, and expiry dates
- **Payment Management**: Handle receivables, pending payments, and payment history
- **Master Data Management**:
  - Companies/Suppliers
  - Products/Medicines
  - Customers
  - Schemes & Discounts
  - Rate Master
  - User Management

### User Features

- **Role-Based Access Control**: Admin and Staff roles with different permissions
- **Mobile-Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-Time Notifications**: Toast notifications for user actions
- **Search & Filters**: Global search and advanced filtering capabilities
- **Reports**: Comprehensive business reports and analytics

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **UI Components**: 
  - shadcn/ui (Radix UI primitives)
  - Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pharma-suite
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Default Login Credentials

The application includes demo data for testing:

- **Admin User**: Mobile: 9999999999
- **Staff User**: Mobile: 8888888888

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, TopBar, etc.)
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── pages/              # Page components
│   ├── masters/        # Master data management pages
│   ├── purchase/       # Purchase module pages
│   ├── sales/          # Sales module pages
│   ├── inventory/      # Inventory module pages
│   └── payments/       # Payment module pages
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── App.tsx             # Root application component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features Highlights

### Authentication & Authorization
- Mobile-based authentication
- Role-based access control (Admin/Staff)
- Protected routes with permission checks

### Data Management
- Local storage-based data persistence
- Demo data initialization
- CRUD operations for all entities

### Responsive Design
- Desktop-first with mobile optimization
- Bottom navigation for mobile devices
- Collapsible sidebar for desktop

### User Experience
- Toast notifications for user feedback
- Loading states and error handling
- Search and filter capabilities
- Modal dialogs for forms

## 📱 Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software.

## 👥 Authors

SchemeWise Development Team

