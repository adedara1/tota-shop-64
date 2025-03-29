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
import { 
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ColorPicker, Trash } from "lucide-react";

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
}

const ProductEdit = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionImages, setSelectedOptionImages] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const isMobile = useIsMobile();
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

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

  const handleOptionImageChange = (images: string[]) => {
    setSelectedOptionImages(images);
  };

  const handleAddToCart = () => {
    // Disabled in edit mode
  };

  const handleSaveChanges = async () => {
    if (!product) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update(changes)
        .eq("id", product.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Modifications enregistrées avec succès",
      });
      
      // Update the local product state with changes
      setProduct({
        ...product,
        ...changes
      });
      
      // Reset changes
      setChanges({});
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement des modifications",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (element: string) => {
    // This would open a color picker
    // For simplicity, we'll just change the color to a predefined value
    const newColor = "#" + Math.floor(Math.random()*16777215).toString(16);
    
    if (element === 'background') {
      setChanges({
        ...changes,
        theme_color: newColor
      });
    }
    // Other element color changes would be handled similarly
  };

  const handleMove = (element: string, direction: 'up' | 'down' | 'left' | 'right') => {
    // This would adjust the position of elements
    toast({
      description: `Déplacement de l'élément ${element} vers ${direction}`,
    });
    // Actual implementation would depend on how your layout is structured
  };

  const ContextMenuWrapper = ({ children, id }: { children: React.ReactNode, id: string }) => (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleColorChange(id)}>
          <ColorPicker className="mr-2 h-4 w-4" />
          Modifier la couleur
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleMove(id, 'up')}>
          <ArrowUp className="mr-2 h-4 w-4" />
          Déplacer vers le haut
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleMove(id, 'down')}>
          <ArrowDown className="mr-2 h-4 w-4" />
          Déplacer vers le bas
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleMove(id, 'left')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Déplacer vers la gauche
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleMove(id, 'right')}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Déplacer vers la droite
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-red-500">
          <Trash className="mr-2 h-4 w-4" />
          Supprimer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
        {!product?.hide_promo_bar && <PromoBar />}
        <div className="bg-white">
          <Navbar cartCount={cartCount} />
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
          <Navbar cartCount={cartCount} />
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

  const displayImages = selectedOptionImages.length > 0 
    ? [...selectedOptionImages, ...product.images]
    : product.images;

  // Use theme_color from changes if it exists, otherwise use the product's theme_color
  const themeColor = changes.theme_color || product.theme_color || "#000000";

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative" style={{ backgroundColor: themeColor }}>
      {/* Fixed control panel at the top */}
      <div className="fixed top-0 left-0 w-full bg-black bg-opacity-80 text-white z-50 p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm">
            Mode édition: <span className="font-bold">{product.name}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/product/${product.id}`}
            >
              Quitter
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveChanges}
              disabled={saving || Object.keys(changes).length === 0}
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add extra padding at the top to account for the fixed panel */}
      <div className="pt-12">
        {!product.hide_promo_bar && <PromoBar />}
        <div className="bg-white">
          <Navbar cartCount={cartCount} />
        </div>
        <main className="container mx-auto py-4 md:py-12 px-4 max-w-[100vw]">
          <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8 lg:gap-12`}>
            <ContextMenuWrapper id="gallery">
              <ProductGallery images={displayImages} />
            </ContextMenuWrapper>
            
            <div className="md:order-2 order-2 text-white">
              <ContextMenuWrapper id="product-header">
                <div className="mb-6">
                  <h2 className="uppercase text-sm font-bold tracking-wider">
                    {product.name}™
                  </h2>
                  
                  {/* Rating stars */}
                  <div className="flex items-center mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-yellow-400">★</button>
                      ))}
                    </div>
                    <span className="text-xs ml-2">1,238 reviews</span>
                  </div>
                  
                  {/* Price display */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xl font-bold text-orange-500">${product.discounted_price.toFixed(2)}</span>
                    {product.original_price > product.discounted_price && (
                      <span className="text-sm line-through text-gray-400">${product.original_price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* In stock indicator */}
                  <div className="flex items-center mt-4 text-sm">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>In stock, ready to ship</span>
                  </div>
                </div>
              </ContextMenuWrapper>
              
              <ContextMenuWrapper id="product-details">
                <ProductDetails
                  key={product.id}
                  name={product.name}
                  originalPrice={product.original_price}
                  discountedPrice={product.discounted_price}
                  description={product.description}
                  cartUrl={product.cart_url}
                  buttonText={product.button_text}
                  currency={product.currency}
                  onButtonClick={() => {}}
                  options={product.options || {}}
                  onOptionImageChange={handleOptionImageChange}
                  useInternalCart={product.use_internal_cart}
                  onAddToCart={handleAddToCart}
                  productId={product.id}
                />
              </ContextMenuWrapper>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProductEdit;
