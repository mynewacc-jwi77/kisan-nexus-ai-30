import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";
import Layout from "@/components/Layout";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import DiseaseDetection from "./pages/DiseaseDetection";

import Weather from "./pages/Weather";
import RentalMarketplace from "./pages/RentalMarketplace";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import UserProfile from "./pages/UserProfile";
import KisanBazaar from "./pages/KisanBazaar";
import BarterMarket from "./pages/BarterMarket";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${window.location.origin}/sw.js`;
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DemoAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/rental-marketplace" element={<RentalMarketplace />} />
                  <Route path="/machinery" element={<RentalMarketplace />} />
                  <Route path="/rental-system" element={<RentalMarketplace />} />
                  <Route path="/schemes" element={<GovernmentSchemes />} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/bazaar" element={<KisanBazaar />} />
                  <Route path="/barter-market" element={<ProtectedRoute><BarterMarket /></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              <PWAInstallPrompt />
              <OfflineIndicator />
            </BrowserRouter>
          </TooltipProvider>
      </DemoAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
