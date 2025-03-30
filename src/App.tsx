
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart";

// Import pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import ProductsSettings from "./pages/ProductsSettings";
import Auth from "./pages/Auth";
import Formulaire from "./pages/Formulaire";
import Stats from "./pages/Stats";
import Contact from "./pages/Contact";
import Payment from "./pages/Payment";
import ButtonStats from "./pages/ButtonStats";
import NotFound from "./pages/NotFound";
import Popo from "./pages/Popo";
import PopoSettings from "./pages/PopoSettings";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Auth />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product-form" element={<ProductForm />} />
            <Route path="/product-form/:id" element={<ProductForm />} />
            <Route path="/product-edit/:id" element={<ProductEdit />} />
            <Route path="/products-settings" element={<ProductsSettings />} />
            <Route path="/formulaire" element={<Formulaire />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/button-stats" element={<ButtonStats />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/paiement" element={<Payment />} />
            <Route path="/popo" element={<Popo />} />
            <Route path="/popo-settings" element={<PopoSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
