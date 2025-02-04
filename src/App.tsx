import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ProductForm from "@/pages/ProductForm";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";

function App() {
  return (
    <Router>
      <PromoBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product-form" element={<ProductForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;