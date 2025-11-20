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
import SalesList from "./pages/sales/SalesList";
import NewSale from "./pages/sales/NewSale";
import InventoryStock from "./pages/inventory/InventoryStock";
import ReceivePayment from "./pages/payments/ReceivePayment";
import PendingPayments from "./pages/payments/PendingPayments";
import MastersIndex from "./pages/masters/MastersIndex";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

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
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/masters" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MastersIndex />
        </ProtectedRoute>
      } />
      <Route path="/masters/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MastersIndex />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Settings />
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
