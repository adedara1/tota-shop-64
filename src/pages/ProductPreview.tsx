
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

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

const ProductPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
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
        
        setProduct({
          ...data,
          options: typeof data.options === 'object' ? data.options : null
        });
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

    fetchProduct();
  }, [id, toast]);

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!product || !id) return;
    
    try {
      const { error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Modifications enregistrées avec succès",
      });
      
      setModified(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement des modifications",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (modified) {
      // Show confirmation dialog
      if (window.confirm("Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?")) {
        navigate("/products");
      }
    } else {
      navigate("/products");
    }
  };

  const handleMoveElement = (direction: 'up' | 'down' | 'left' | 'right') => {
    // This is a placeholder for future implementation
    // Will require tracking the position of each element
    toast({
      title: "Information",
      description: `Déplacement vers ${direction} - Fonctionnalité en développement`,
    });
  };

  const handleDeleteElement = () => {
    // This is a placeholder for future implementation
    // Will require tracking which elements can be deleted
    toast({
      title: "Information",
      description: "Suppression - Fonctionnalité en développement",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          Chargement...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          Produit non trouvé
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <Navbar />
      
      {/* Editing toolbar */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          
          <div className="space-x-2">
            {selectedElement && (
              <div className="inline-flex bg-gray-100 rounded-md p-1 mr-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveElement('up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveElement('down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveElement('left')}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveElement('right')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDeleteElement}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
            
            <Button 
              variant="default" 
              onClick={handleSave}
              disabled={!modified}
            >
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Aperçu du produit</h1>
          
          <div className="border border-gray-200 rounded-lg p-4 relative" 
               style={{ backgroundColor: product.theme_color }}>
            {/* Product preview - simplified version of ProductDetail */}
            <div 
              className={`cursor-pointer p-4 ${selectedElement === 'product-name' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleElementClick('product-name')}
            >
              <h2 className="text-xl font-bold">{product.name}</h2>
            </div>
            
            <div 
              className={`cursor-pointer p-4 ${selectedElement === 'product-price' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleElementClick('product-price')}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{product.discounted_price} {product.currency}</span>
                {product.original_price > product.discounted_price && (
                  <span className="text-sm line-through text-gray-500">{product.original_price} {product.currency}</span>
                )}
              </div>
            </div>
            
            <div 
              className={`cursor-pointer p-4 ${selectedElement === 'product-description' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleElementClick('product-description')}
            >
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
            
            <div 
              className={`cursor-pointer p-4 ${selectedElement === 'product-button' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleElementClick('product-button')}
            >
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                {product.button_text}
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Cliquez sur n'importe quel élément pour le sélectionner et le modifier. 
              Les modifications seront reflétées sur la page produit une fois enregistrées.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductPreview;
