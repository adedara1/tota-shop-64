
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface SimilarProductsProps {
  productId: string;
  similarProducts: string[];
}

const SimilarProducts = ({ productId, similarProducts }: SimilarProductsProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!similarProducts || similarProducts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, images, discounted_price, currency")
          .in("id", similarProducts)
          .eq("is_visible", true);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [similarProducts]);

  if (loading) {
    return <div className="py-4">Chargement des produits similaires...</div>;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-medium mb-6">Produits similaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id}
            className="group"
          >
            <div className="rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-sm mt-1">{product.discounted_price} {product.currency}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
