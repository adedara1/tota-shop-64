import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Navbar />
      
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery />
          <ProductDetails />
        </div>
      </main>
    </div>
  );
};

export default Index;