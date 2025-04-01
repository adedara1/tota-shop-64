
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
import { Toaster } from "@/components/ui/toaster";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { CartProvider } from "@/hooks/use-cart";

const App = () => {
  const queryClient = new QueryClient()

  return (
    <Router>
      <CartProvider>
        <Toaster />
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product-form" element={<ProductForm />} />
            <Route path="/products-settings" element={<ProductsSettings />} />
            <Route path="/paiement" element={<Payment />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </QueryClientProvider>
      </CartProvider>
    </Router>
  );
};

export default App;
