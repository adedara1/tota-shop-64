import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
  theme_color: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Erreur",
            description: "Produit non trouvé",
            variant: "destructive",
          });
          return;
        }
        
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement du produit",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-medium mb-4">Produit non trouvé</h2>
            <p className="text-gray-600">
              Le produit que vous recherchez n'existe pas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: product.theme_color }}>
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

export default ProductDetail;