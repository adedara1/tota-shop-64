import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import ProductsSettings from './pages/ProductsSettings';
import Payment from './pages/Payment';
import Stats from './pages/Stats';
import Contact from './pages/Contact';
import Panel from './pages/Panel';
import Auth from './pages/Auth';
import { Toaster } from "@/components/ui/toaster";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from '@/components/ProtectedRoute';
import { initSupabase } from "@/utils/supabaseInit";
import Index from './pages/Index';
import StoreForm from './pages/StoreForm';
import Store from './pages/Store';
import WhatsAppRedirect from './pages/WhatsAppRedirect';
import WhatsAppRedirectPage from './pages/WhatsAppRedirectPage';
import Success from './pages/Success';

const App = () => {
  const queryClient = new QueryClient();
  
  useEffect(() => {
    // Initialize Supabase when the app starts
    initSupabase().then(success => {
      console.log("Supabase initialization:", success ? "successful" : "failed");
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/paiement" element={<Payment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/store-form" element={<StoreForm />} />
              <Route path="/store/:slug" element={<Store />} />
              <Route path="/contact/:nom" element={<WhatsAppRedirectPage />} />
              <Route path="/whatsapp" element={<WhatsAppRedirect />} />
              <Route path="/succes" element={<Success />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/product-form" element={<ProductForm />} />
                <Route path="/products-settings" element={<ProductsSettings />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/panel" element={<Panel />} />
              </Route>
            </Routes>
          </QueryClientProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;