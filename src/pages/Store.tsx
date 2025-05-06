import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
interface Product {
  id: string;
  name: string;
  images: string[];
  discounted_price: number;
  original_price: number;
  currency: string;
}
interface Store {
  id: string;
  name: string;
  products: string[];
  created_at: string;
  media_url?: string;
  media_type?: "image" | "video";
}
const Store = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);

  // Fetch store data
  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError
  } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const {
          data,
          error
        } = await supabase.from("stores").select("*").eq('id', id).single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching store:", error);
        throw error;
      }
    }
  });

  // Fetch products when store data is available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!store || !store.products || store.products.length === 0) return;
      try {
        const {
          data,
          error
        } = await supabase.from("products").select("id, name, images, discounted_price, original_price, currency").in("id", store.products);
        if (error) throw error;
        setStoreProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Erreur lors du chargement des produits");
      }
    };
    fetchProducts();
  }, [store]);
  if (isStoreLoading) {
    return <div className="min-h-screen bg-white">
        <PromoBar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>;
  }
  if (storeError || !store) {
    return <div className="min-h-screen bg-white">
        <PromoBar />
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Boutique introuvable</h2>
          <p className="mb-8">La boutique que vous recherchez n'existe pas ou a été supprimée.</p>
        </div>
        <Footer />
      </div>;
  }

  // Ensure we have exactly 4 product slots (either real products or placeholders)
  const productsToDisplay = [...storeProducts];
  const placeholdersNeeded = Math.max(0, 4 - productsToDisplay.length);
  return <div className="min-h-screen bg-white">
      <PromoBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="bg-black text-white p-6 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold mr-2">TOTAL-</h1>
                  <h1 className="text-3xl font-extrabold">SERVICE</h1>
                </div>
                
                
                
              </div>
              
              <div className="md:max-w-xs w-full">
                {store.media_url && store.media_type === "image" && <img src={store.media_url} alt="Store Showcase" className="rounded-md w-full" />}
                
                {store.media_url && store.media_type === "video" && <video src={store.media_url} controls className="rounded-md w-full" />}
                
                {!store.media_url && <img src="public/lovable-uploads/1237687d-4028-42e4-924a-a4dc28aaa0d3.png" alt="Store Showcase" className="rounded-md w-full" />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Products Section */}
        <div className="container mx-auto mb-8 px-4">
          <h2 className="text-2xl font-medium mb-4">Produits en vedette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productsToDisplay.map(product => <Link to={`/product/${product.id}`} key={product.id} className="block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-gray-100">
                        <p className="text-sm text-gray-500">Pas d'image</p>
                      </div>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 line-through">{product.original_price} {product.currency}</p>
                        <p className="text-sm font-medium">{product.discounted_price} {product.currency}</p>
                      </div>
                      <button className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200">
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>)}
            
            {/* If we have less than 4 products, fill with placeholders */}
            {Array.from({
            length: placeholdersNeeded
          }).map((_, index) => <Card key={`placeholder-${index}`} className="h-full">
                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-500">Produit à venir</p>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm">Produit à venir</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Prix à déterminer</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Store;