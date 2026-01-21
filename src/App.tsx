import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CatalogProvider } from "@/contexts/CatalogContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import QuotationsPage from "@/pages/QuotationsPage";
import HistoryPage from "@/pages/HistoryPage";
import UsersPage from "@/pages/UsersPage";
import ClientsPage from "@/pages/ClientsPage";
import QuotationDetailPage from "@/pages/QuotationDetailPage";
import SuperAdminPage from "@/pages/SuperAdminPage";
import ReportsPage from "@/pages/ReportsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CatalogProvider>
          <DataProvider>
            <Toaster position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><BusinessProfilePage /></ProtectedRoute>} />
                <Route path="/cotizaciones" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
                <Route path="/cotizaciones/nueva" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
                <Route path="/cotizaciones/:id" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
                <Route path="/cotizacion/nueva" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
                <Route path="/cotizacion/:id" element={<ProtectedRoute><QuotationDetailPage /></ProtectedRoute>} />
                <Route path="/historial" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/superadmin" element={<ProtectedRoute><SuperAdminPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </CatalogProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
