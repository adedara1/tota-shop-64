
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the products page
  // This is a simple redirect component since Index.tsx was a duplicate of Products.tsx
  React.useEffect(() => {
    navigate('/products');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <PromoBar />
      <Navbar />
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Redirection vers la page des produits...</p>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
