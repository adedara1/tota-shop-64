
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface SimilarProductsProps {
  productId: string;
  similarProducts: string[];
  titleColor?: string;
}

const SimilarProducts = ({ productId, similarProducts, titleColor = "#FFFFFF" }: SimilarProductsProps) => {
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
          .select("id, name, images, original_price, discounted_price, currency, star_count")
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
      <h2 className="text-2xl font-medium mb-6" style={{ color: titleColor }}>Produits similaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id}
            className="group"
          >
            <div className="rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {product.original_price > product.discounted_price && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Sale
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium truncate text-black">
                  {product.name}
                </h3>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      className={`${i < (product.star_count || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center mt-1">
                  {product.original_price > product.discounted_price && (
                    <span className="text-xs text-gray-500 line-through mr-2">{product.original_price} {product.currency}</span>
                  )}
                  <span className="text-sm font-medium text-red-600">{product.discounted_price} {product.currency}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
