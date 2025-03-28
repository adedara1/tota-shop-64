
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";

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
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionImages, setSelectedOptionImages] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fetch cart count from local storage
    const fetchCartCount = () => {
      try {
        const cartItems = localStorage.getItem('cartItems');
        if (cartItems) {
          const items = JSON.parse(cartItems);
          setCartCount(items.length);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();

    // Add event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartCount);

    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

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
        
        const transformedData: Product = {
          ...data,
          options: typeof data.options === 'object' ? data.options : null
        };
        
        setProduct(transformedData);

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
    try {
      // Save to cart_items table if using internal cart
      if (product?.use_internal_cart) {
        const cartItem = {
          product_id: product.id,
          name: product.name,
          price: product.discounted_price,
          quantity: quantity,
          options: selectedOptions,
          image: product.images && product.images.length > 0 ? product.images[0] : null
        };

        // Save to local storage
        const cartItemsStr = localStorage.getItem('cartItems');
        let cartItems = cartItemsStr ? JSON.parse(cartItemsStr) : [];
        cartItems.push(cartItem);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Dispatch event for cart updates
        window.dispatchEvent(new Event('cartUpdated'));

        // Also save to Supabase for persistence
        const { error } = await supabase
          .from('cart_items')
          .insert(cartItem);

        if (error) {
          console.error("Error saving to cart:", error);
        }

        toast({
          title: "Produit ajouté",
          description: "Le produit a été ajouté à votre panier",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout au panier",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar cartCount={cartCount} />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar cartCount={cartCount} />
        <div className="container mx-auto py-12 px-4 max-w-[100vw]">
          <div className="text-center">
            <h2 className="text-2xl font-medium mb-4">Produit non trouvé</h2>
            <p className="text-gray-600">
              Le produit que vous recherchez n'existe pas.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayImages = selectedOptionImages.length > 0 
    ? [...selectedOptionImages, ...product.images]
    : product.images;

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: product.theme_color }}>
      <PromoBar />
      <Navbar cartCount={cartCount} />
      <main className="container mx-auto py-4 md:py-12 px-4 max-w-[100vw]">
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8 lg:gap-12`}>
          <ProductGallery images={displayImages} />
          <div className="md:order-2 order-2">
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
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
