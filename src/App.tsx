
import React from 'react';
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

const App = () => {
  const queryClient = new QueryClient()

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/paiement" element={<Payment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              
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
