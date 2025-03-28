
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the products page
  useEffect(() => {
    navigate('/products');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <PromoBar />
      <Navbar />
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Redirection vers la page des produits de Total-Service...</p>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
