import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PurchaseList from "./pages/purchase/PurchaseList";
import NewPurchase from "./pages/purchase/NewPurchase";
import EditPurchase from "./pages/purchase/EditPurchase";
import SalesList from "./pages/sales/SalesList";
import NewSale from "./pages/sales/NewSale";
import InventoryStock from "./pages/inventory/InventoryStock";
import ReceivePayment from "./pages/payments/ReceivePayment";
import PendingPayments from "./pages/payments/PendingPayments";
import MastersIndex from "./pages/masters/MastersIndex";
import RateMaster from "./pages/masters/RateMaster";
import Users from "./pages/masters/Users";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Workers from "./pages/Workers";
import PaymentHistory from "./pages/payments/PaymentHistory";
import Companies from "./pages/masters/Companies";
import Products from "./pages/masters/Products";
import Customers from "./pages/masters/Customers";
import Schemes from "./pages/masters/Schemes";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/purchase" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PurchaseList />
        </ProtectedRoute>
      } />
      <Route path="/purchase/new" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NewPurchase />
        </ProtectedRoute>
      } />
      <Route path="/purchase/edit/:id" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <EditPurchase />
        </ProtectedRoute>
      } />
      
      <Route path="/sales" element={
        <ProtectedRoute>
          <SalesList />
        </ProtectedRoute>
      } />
      <Route path="/sales/new" element={
        <ProtectedRoute>
          <NewSale />
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute>
          <InventoryStock />
        </ProtectedRoute>
      } />
      <Route path="/inventory/stock" element={
        <ProtectedRoute>
          <InventoryStock />
        </ProtectedRoute>
      } />
      
      <Route path="/payments/receive" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ReceivePayment />
        </ProtectedRoute>
      } />
      <Route path="/payments/pending" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PendingPayments />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PendingPayments />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/workers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Workers />
        </ProtectedRoute>
      } />
      
      <Route path="/payments/history" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PaymentHistory />
        </ProtectedRoute>
      } />
      
      <Route path="/masters" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MastersIndex />
        </ProtectedRoute>
      } />
      <Route path="/masters/rate-master" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <RateMaster />
        </ProtectedRoute>
      } />
      <Route path="/masters/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/masters/companies" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Companies />
        </ProtectedRoute>
      } />
      <Route path="/masters/products" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Products />
        </ProtectedRoute>
      } />
      <Route path="/masters/customers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Customers />
        </ProtectedRoute>
      } />
      <Route path="/masters/schemes" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Schemes />
        </ProtectedRoute>
      } />
      <Route path="/masters/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MastersIndex />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
