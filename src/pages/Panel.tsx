import React from "react";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConnected } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { toast } from "sonner";

interface ProductType {
  id: string;
  name: string;
  images: string[];
  original_price: number;
  discounted_price: number;
  currency: string;
}

export default function Panel() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isSupabaseConnected();
        console.log("État de la connexion Supabase (Panel):", connected);
        setIsConnected(connected);
        
        if (!connected) {
          toast.error("Impossible de se connecter à la base de données");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchProducts();
    }
  }, [isConnected]);

  async function fetchProducts() {
    if (!isConnected) return;
    
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Afficher un message si la base de données est déconnectée
  if (isConnected === false) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-20">
          <Database size={64} className="text-gray-400" />
          <h2 className="text-2xl font-bold">Base de données déconnectée</h2>
          <p className="text-gray-600 max-w-md text-center">
            La connexion à la base de données a été interrompue. Veuillez reconnecter votre projet à une base de données Supabase pour accéder au tableau de bord.
          </p>
          <Button variant="outline" asChild>
            <Link to="/" className="mt-4">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : products.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
                      <div className="flex items-center">
                        <span className="text-orange-600 font-bold">
                          {product.discounted_price} {product.currency}
                        </span>
                        {product.original_price > product.discounted_price && (
                          <span className="text-gray-400 line-through ml-2 text-sm">
                            {product.original_price} {product.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
