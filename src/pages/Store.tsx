
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MapPin, Phone, ChevronLeft, Star } from "lucide-react";
import { fetchStoreById, supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import { toast } from "sonner";

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
  description: string;
  contact: string;
  address: string;
  products: string[];
  created_at: string;
}

const Store = () => {
  const { id } = useParams<{ id: string }>();
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);

  // Fetch store data
  const { data: store, isLoading: isStoreLoading, error: storeError } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!id) return null;
      return await fetchStoreById(id);
    }
  });

  // Fetch products when store data is available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!store || !store.products || store.products.length === 0) return;

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, images, discounted_price, original_price, currency")
          .in("id", store.products);

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
    return (
      <div className="min-h-screen bg-white">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Chargement de la boutique...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-white">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Boutique introuvable</h2>
          <p className="mb-8">La boutique que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button asChild>
            <Link to="/products">Retour aux produits</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PromoBar />
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link to="/products"><ChevronLeft className="mr-2 h-4 w-4" />Retour aux produits</Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mb-4">{store.description}</p>
              )}
              
              <div className="flex flex-col gap-2">
                {store.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{store.address}</span>
                  </div>
                )}
                
                {store.contact && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{store.contact}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">5.0 (Nouveau)</span>
              </div>
              <p className="text-sm text-gray-600">Boutique créée le {new Date(store.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-medium mb-6">Produits disponibles</h2>
        
        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {storeProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <p className="text-sm text-gray-500">Pas d'image</p>
                      </div>
                    )}
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucun produit disponible pour cette boutique</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Store;
