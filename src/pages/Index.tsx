import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
}

const Index = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product");
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            {error || "No product found"}
          </h2>
          <p className="text-gray-600">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Navbar />
      
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery images={product.images} />
          <ProductDetails
            name={product.name}
            originalPrice={product.original_price}
            discountedPrice={product.discounted_price}
            description={product.description}
            cartUrl={product.cart_url}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;