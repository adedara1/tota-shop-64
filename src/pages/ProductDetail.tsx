
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import SimilarProducts from "@/components/SimilarProducts";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/hooks/use-cart";

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
  theme_color: string;
  button_text: string;
  currency: Database['public']['Enums']['currency_code'];
  options?: Record<string, any> | null;
  use_internal_cart?: boolean;
  hide_promo_bar?: boolean;
  // Customization fields
  option_title_color?: string;
  option_value_color?: string;
  product_name_color?: string;
  original_price_color?: string;
  discounted_price_color?: string;
  quantity_text_color?: string;
  show_product_trademark?: boolean;
  product_trademark_color?: string;
  show_star_reviews?: boolean;
  star_reviews_color?: string;
  review_count?: number;
  star_count?: number;
  show_stock_status?: boolean;
  stock_status_text?: string;
  stock_status_color?: string;
  show_similar_products?: boolean;
  similar_products?: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionImages, setSelectedOptionImages] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const { addToCart } = useCart();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        
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
        
        const transformedData: Product = {
          ...data,
          options: typeof data.options === 'object' ? data.options : null,
          similar_products: data.similar_products || []
        };
        
        setProduct(transformedData);

        // Track product view
        const { error: statsError } = await supabase.rpc('increment_product_view', {
          product_id_param: id
        });

        if (statsError) {
          console.error("Error incrementing view count:", statsError);
        }
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

  const handleProductClick = async () => {
    if (id) {
      const { error } = await supabase.rpc('increment_product_click', {
        product_id_param: id
      });

      if (error) {
        console.error("Error incrementing click count:", error);
      }
    }
  };

  const handleOptionImageChange = (images: string[]) => {
    setSelectedOptionImages(images);
  };

  const handleAddToCart = async (productData: any, quantity: number, selectedOptions: Record<string, any>) => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discounted_price,
      quantity: quantity,
      options: selectedOptions,
      image: product.images && product.images.length > 0 ? product.images[0] : null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
        {!product?.hide_promo_bar && <PromoBar />}
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto py-12 px-4">
          <div className="text-center text-white">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "#000000" }}>
        <PromoBar />
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto py-12 px-4 max-w-[100vw]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-medium mb-4">Produit non trouvé</h2>
            <p className="text-gray-400">
              Le produit que vous recherchez n'existe pas.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Ne plus mélanger les images d'options avec les images du produit
  const productImages = product.images;

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: product.theme_color || "#000000" }}>
      {!product.hide_promo_bar && <PromoBar />}
      <div className="bg-white">
        <Navbar />
      </div>
      <main className="container mx-auto py-4 md:py-12 px-4 max-w-[100vw]">
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8 lg:gap-12`}>
          <ProductGallery 
            images={productImages} 
            optionImages={selectedOptionImages}
          />
          <div className="md:order-2 order-2 text-white">
            <ProductDetails
              key={product.id}
              name={product.name}
              originalPrice={product.original_price}
              discountedPrice={product.discounted_price}
              description={product.description}
              cartUrl={product.cart_url}
              buttonText={product.button_text}
              currency={product.currency}
              onButtonClick={handleProductClick}
              options={product.options || {}}
              onOptionImageChange={handleOptionImageChange}
              useInternalCart={product.use_internal_cart}
              onAddToCart={handleAddToCart}
              productId={product.id}
              // Pass customization properties
              optionTitleColor={product.option_title_color}
              optionValueColor={product.option_value_color}
              productNameColor={product.product_name_color}
              originalPriceColor={product.original_price_color}
              discountedPriceColor={product.discounted_price_color}
              quantityTextColor={product.quantity_text_color}
              showProductTrademark={product.show_product_trademark}
              productTrademarkColor={product.product_trademark_color}
              showStarReviews={product.show_star_reviews}
              starReviewsColor={product.star_reviews_color}
              reviewCount={product.review_count}
              starCount={product.star_count}
              showStockStatus={product.show_stock_status}
              stockStatusText={product.stock_status_text}
              stockStatusColor={product.stock_status_color}
            />
          </div>
        </div>

        {/* Section produits similaires */}
        {product.show_similar_products && product.similar_products && product.similar_products.length > 0 && (
          <div className="mt-12 bg-white/10 p-6 rounded-lg text-white">
            <SimilarProducts 
              productId={product.id} 
              similarProducts={product.similar_products} 
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
