
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductDetails from "@/components/ProductDetails";
import SimilarProducts from "@/components/SimilarProducts"; 
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [optionImages, setOptionImages] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Retrieve product details
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Log product view in the product_stats table
        try {
          await supabase.rpc('increment_product_view', {
            product_id_param: id,
          });
        } catch (statsError) {
          console.error("Error updating view stats:", statsError);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleOptionImageChange = (images: string[]) => {
    setOptionImages(images);
  };

  const handleAddToCart = (productData: any, quantity: number, selectedOptions: Record<string, any>) => {
    addToCart({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: product.images[0],
      quantity,
      options: selectedOptions,
    });

    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} × ${productData.name} ajouté au panier`,
    });
  };

  const handleProductClick = async () => {
    try {
      await supabase.rpc('increment_product_click', {
        product_id_param: id,
      });
    } catch (error) {
      console.error("Error updating click stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-72">
            <p>Chargement du produit...</p>
          </div>
        </div>
        <Footer />
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
            <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
            <p>Le produit que vous recherchez n'existe pas ou a été retiré.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: product.theme_color || "#f1eee9" }}>
      {!product.hide_promo_bar && <PromoBar />}
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery images={product.images} optionImages={optionImages} />
          <ProductDetails
            name={product.name}
            originalPrice={product.original_price}
            discountedPrice={product.discounted_price}
            description={product.description}
            cartUrl={product.cart_url}
            buttonText={product.button_text}
            currency={product.currency}
            options={product.options || {}}
            onOptionImageChange={handleOptionImageChange}
            onButtonClick={handleProductClick}
            useInternalCart={product.use_internal_cart}
            onAddToCart={handleAddToCart}
            productId={product.id}
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
        
        {/* Similar Products Section */}
        {product.show_similar_products && product.similar_products && product.similar_products.length > 0 && (
          <SimilarProducts productId={product.id} similarProducts={product.similar_products} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
