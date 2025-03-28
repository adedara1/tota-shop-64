
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import ButtonStats from "./pages/ButtonStats";
import Popo from "./pages/Popo";
import PopoSettings from "./pages/PopoSettings";
import Formulaire from "./pages/Formulaire";
import ProductsSettings from "./pages/ProductsSettings";
import { initSupabase } from "./utils/supabaseInit";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Supabase functions and tables
    const initialize = async () => {
      try {
        setIsInitializing(true);
        const success = await initSupabase();
        if (success) {
          console.log("Supabase initialized successfully");
        } else {
          console.error("Failed to initialize Supabase");
          toast({
            title: "Erreur d'initialisation",
            description: "Impossible d'initialiser correctement la base de données. Certaines fonctionnalités pourraient ne pas fonctionner.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error initializing Supabase:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/popo" element={<Popo />} />
            <Route path="/formulaire" element={<Formulaire />} />
            <Route
              path="/products-set"
              element={
                <ProtectedRoute>
                  <ProductsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/popo-setting"
              element={
                <ProtectedRoute>
                  <PopoSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-form"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/paiement" element={<Payment />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
