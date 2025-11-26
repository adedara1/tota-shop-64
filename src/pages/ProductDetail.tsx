import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";
import ProductDetails from "@/components/ProductDetails";
import SimilarProducts from "@/components/SimilarProducts";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "@/integrations/supabase/utils";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Database as DatabaseIcon } from "lucide-react";
import { Loader2, AlertCircle } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

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
  review_count_color?: string;
  star_count?: number;
  show_stock_status?: boolean;
  stock_status_text?: string;
  stock_status_color?: string;
  show_similar_products?: boolean;
  similar_products?: string[];
  similar_products_title_color?: string;
  video_url?: string;
  show_video?: boolean;
  video_pip_enabled?: boolean;
  video_autoplay?: boolean;
  slug?: string;
}

const ProductDetail = () => {
  const { id } = useParams(); // Utilisation de id au lieu de slug
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionImages, setSelectedOptionImages] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Utilisation du hook pour le défilement
  useScrollToTop();

  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        const connected = await isSupabaseConnected();
        console.log("État de la connexion Supabase (ProductDetail):", connected);
        setIsConnected(connected);
        
        if (!connected) {
          toast({
            title: "Erreur de connexion",
            description: "Impossible de se connecter à la base de données",
            variant: "destructive",
          });
        }
        
        setConnectionChecked(true);
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification de la connexion",
          variant: "destructive",
        });
        setConnectionChecked(true);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!connectionChecked || !id) return;
      
      try {
        // Recherche par ID
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

        // Increment view count using product ID
        const { error: statsError } = await supabase.rpc('increment_product_view', {
          product_id_param: data.id
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

    if (id && connectionChecked) {
      fetchProduct();
    }
  }, [id, connectionChecked]);

  const handleProductClick = async () => {
    if (product?.id) {
      const { error } = await supabase.rpc('increment_product_click', {
        product_id_param: product.id
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

  if (isConnected === false) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
        <PromoBar />
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <DatabaseIcon size={64} className="text-gray-400" />
            <h2 className="text-3xl font-bold text-white">Base de données déconnectée</h2>
            <p className="text-gray-400 max-w-md">
              La connexion à la base de données a été interrompue. Impossible d'afficher les détails du produit.
            </p>
            <Button variant="outline" asChild>
              <Link to="/" className="mt-4">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
        <PromoBar productId={product?.id} />
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

  const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const isWhatsApp = product.cart_url && product.cart_url.includes('wa.me');

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: product?.theme_color || "#000000" }}>
      <PromoBar productId={product.id} />
      <div className="bg-white">
        <Navbar />
      </div>
      <main className="container mx-auto py-4 md:py-12 px-4 max-w-[100vw]">
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8 lg:gap-12`}>
          <ProductGallery 
            images={product?.images || []} 
            optionImages={selectedOptionImages}
          />
          <div className="md:order-2 order-2 text-white">
            <ProductDetails
              key={product?.id}
              name={product?.name || ""}
              originalPrice={product?.original_price || 0}
              discountedPrice={product?.discounted_price || 0}
              description={product?.description || ""}
              cartUrl={product?.cart_url || ""}
              buttonText={product?.button_text || ""}
              currency={product?.currency || "USD"}
              onButtonClick={handleProductClick}
              options={product?.options || {} as Record<string, any>}
              onOptionImageChange={handleOptionImageChange}
              useInternalCart={product?.use_internal_cart}
              onAddToCart={handleAddToCart}
              productId={product?.id}
              productSlug={product?.slug}
              productImage={productImage} 
              optionTitleColor={product?.option_title_color}
              optionValueColor={product?.option_value_color}
              productNameColor={product?.product_name_color}
              originalPriceColor={product?.original_price_color}
              discountedPriceColor={product?.discounted_price_color}
              quantityTextColor={product?.quantity_text_color}
              showProductTrademark={product?.show_product_trademark}
              productTrademarkColor={product?.product_trademark_color}
              showStarReviews={product?.show_star_reviews}
              starReviewsColor={product?.star_reviews_color}
              reviewCount={product?.review_count}
              reviewCountColor={product?.review_count_color}
              starCount={product?.star_count}
              showStockStatus={product?.show_stock_status}
              stockStatusText={product?.stock_status_text}
              stockStatusColor={product?.stock_status_color}
              videoUrl={product?.video_url}
              showVideo={product?.show_video}
              videoPipEnabled={product?.video_pip_enabled}
              videoAutoplay={product?.video_autoplay}
            />
          </div>
        </div>

        {product?.show_similar_products && product?.similar_products && product?.similar_products.length > 0 && (
          <div className="mt-12 bg-white/10 p-6 rounded-lg text-white">
            <SimilarProducts 
              productId={product.id} 
              similarProducts={product.similar_products}
              titleColor={product.similar_products_title_color || "#FFFFFF"}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;