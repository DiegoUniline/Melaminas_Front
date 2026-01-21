import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Dashboard from "@/pages/Dashboard";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import NewQuotationPage from "@/pages/NewQuotationPage";
import HistoryPage from "@/pages/HistoryPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/perfil" element={<BusinessProfilePage />} />
            <Route path="/cotizacion/nueva" element={<NewQuotationPage />} />
            <Route path="/cotizacion/:id" element={<NewQuotationPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
