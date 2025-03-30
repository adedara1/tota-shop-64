
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
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
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </QueryClientProvider>
      </CartProvider>
    </Router>
  );
};

export default App;
