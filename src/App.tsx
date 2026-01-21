import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CatalogProvider } from "@/contexts/CatalogContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InstallPWABanner } from "@/components/pwa/InstallPWABanner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import LoginPage from "@/pages/LoginPage";
import InstallPage from "@/pages/InstallPage";
import NotFound from "@/pages/NotFound";

// Lazy load heavy pages for better initial load time
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const BusinessProfilePage = lazy(() => import("@/pages/BusinessProfilePage"));
const QuotationsPage = lazy(() => import("@/pages/QuotationsPage"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const QuotationDetailPage = lazy(() => import("@/pages/QuotationDetailPage"));
const SuperAdminPage = lazy(() => import("@/pages/SuperAdminPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));

const queryClient = new QueryClient();

// Reusable loading fallback
const PageLoader = () => <LoadingSpinner fullScreen text="Cargando página..." />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CatalogProvider>
          <DataProvider>
            <Toaster position="top-center" />
            <InstallPWABanner />
            <HashRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/instalar" element={<InstallPage />} />
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
              </Suspense>
            </HashRouter>
          </DataProvider>
        </CatalogProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
