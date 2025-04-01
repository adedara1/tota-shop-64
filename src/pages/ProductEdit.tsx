
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import ProductGallery from "@/components/ProductGallery";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Palette, Trash, Save, X } from "lucide-react";

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

interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
}

interface ElementState {
  id: string;
  type: 'text' | 'button' | 'price' | 'image' | 'header' | 'description';
  content: string;
  style: ElementStyle;
}

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionImages, setSelectedOptionImages] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<ElementState | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  const handleColorChange = (color: string) => {
    if (selectedElement === 'theme') {
      setChanges({
        ...changes,
        theme_color: color
      });
    } else if (editingElement) {
      setEditingElement({
        ...editingElement,
        style: {
          ...editingElement.style,
          color: color
        }
      });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    if (editingElement) {
      setEditingElement({
        ...editingElement,
        style: {
          ...editingElement.style,
          backgroundColor: color
        }
      });
    }
  };

  const handleMove = (element: string, direction: 'up' | 'down' | 'left' | 'right') => {
    // This would adjust the position of elements
    toast({
      description: `Déplacement de l'élément ${element} vers ${direction}`,
    });
    // Actual implementation would depend on how your layout is structured
  };

  const handleElementClick = (elementId: string, elementType: ElementState['type'], content: string, currentStyle?: ElementStyle) => {
    setSelectedElement(elementId);
    setEditingElement({
      id: elementId,
      type: elementType,
      content: content,
      style: currentStyle || {}
    });
    setIsEditorOpen(true);
  };

  const handleUpdateElement = () => {
    if (!editingElement || !product) return;
    
    // Update the appropriate product field based on the element ID
    const newChanges = { ...changes };
    
    switch (editingElement.id) {
      case 'product-name':
        newChanges.name = editingElement.content;
        break;
      case 'product-description':
        newChanges.description = editingElement.content;
        break;
      case 'product-button':
        newChanges.button_text = editingElement.content;
        break;
      case 'product-price':
        // Handle price updates if needed
        break;
      case 'theme':
        // Theme handled separately
        break;
    }
    
    // For now we're just updating content, but we could store styles in a JSON field too
    setChanges(newChanges);
    setIsEditorOpen(false);
    
    toast({
      description: "Élément mis à jour. N'oubliez pas d'enregistrer les changements.",
    });
  };

  const handleGoBack = () => {
    if (Object.keys(changes).length > 0) {
      if (window.confirm("Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter?")) {
        navigate("/product-form");
      }
    } else {
      navigate("/product-form");
    }
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
              onClick={handleGoBack}
            >
              Retour
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
      
      {/* Element editor sheet */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Modifier l'élément</SheetTitle>
          </SheetHeader>
          {editingElement && (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="elementContent">Contenu</Label>
                {editingElement.type === 'description' ? (
                  <textarea 
                    id="elementContent"
                    className="w-full min-h-[200px] p-2 border rounded-md"
                    value={editingElement.content}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      content: e.target.value
                    })}
                  />
                ) : (
                  <Input 
                    id="elementContent"
                    value={editingElement.content}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      content: e.target.value
                    })}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Couleur du texte</Label>
                <div className="grid grid-cols-5 gap-2">
                  {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                   '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
                <Input 
                  type="color" 
                  value={editingElement.style.color || '#000000'} 
                  onChange={(e) => handleColorChange(e.target.value)}
                />
              </div>
              
              {editingElement.type === 'button' && (
                <div className="space-y-2">
                  <Label>Couleur de fond</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                     '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map(color => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: color }}
                        onClick={() => handleBackgroundColorChange(color)}
                      />
                    ))}
                  </div>
                  <Input 
                    type="color" 
                    value={editingElement.style.backgroundColor || '#000000'} 
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Taille du texte</Label>
                <div className="flex gap-2">
                  {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'].map(size => (
                    <button
                      key={size}
                      className={`px-3 py-1 border rounded ${editingElement.style.fontSize === size ? 'bg-black text-white' : ''}`}
                      onClick={() => setEditingElement({
                        ...editingElement,
                        style: { ...editingElement.style, fontSize: size }
                      })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Alignement</Label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      className={`px-3 py-1 border rounded ${editingElement.style.textAlign === align ? 'bg-black text-white' : ''}`}
                      onClick={() => setEditingElement({
                        ...editingElement,
                        style: { ...editingElement.style, textAlign: align }
                      })}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateElement}>
                  Appliquer
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Theme color selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 rounded-full h-12 w-12 z-50 flex items-center justify-center"
            size="icon"
          >
            <Palette className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h3 className="font-medium">Couleur du thème</h3>
            <div className="grid grid-cols-5 gap-2">
              {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
               '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
            <Input 
              type="color" 
              value={themeColor} 
              onChange={(e) => handleColorChange(e.target.value)} 
            />
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Add extra padding at the top to account for the fixed panel */}
      <div className="pt-12">
        {!product.hide_promo_bar && <PromoBar />}
        <div className="bg-white">
          <Navbar />
        </div>
        <main className="container mx-auto py-4 md:py-12 px-4 max-w-[100vw]">
          <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8 lg:gap-12`}>
            <div 
              className="cursor-pointer"
              onClick={() => handleElementClick('gallery', 'image', 'Product Gallery')}
            >
              <ProductGallery images={displayImages} />
            </div>
            
            <div className="md:order-2 order-2 text-white">
              <div 
                className="mb-6 cursor-pointer"
                onClick={() => handleElementClick('product-name', 'header', product.name || '')}
              >
                <h2 className="uppercase text-sm font-bold tracking-wider">
                  {changes.name || product.name}™
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
              </div>
              
              {/* Price display */}
              <div 
                className="flex items-center gap-2 mt-4 cursor-pointer"
                onClick={() => handleElementClick('product-price', 'price', `${product.discounted_price}`)}
              >
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
              
              {/* Product description */}
              <div 
                className="mt-8 cursor-pointer"
                onClick={() => handleElementClick('product-description', 'description', product.description || '')}
                dangerouslySetInnerHTML={{ __html: changes.description || product.description }}
              />
              
              {/* Add to cart button */}
              <div 
                className="mt-8 cursor-pointer"
                onClick={() => handleElementClick('product-button', 'button', product.button_text || 'Ajouter au panier')}
              >
                <Button className="w-full">
                  {changes.button_text || product.button_text}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProductEdit;
