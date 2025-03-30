
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface SimilarProductsSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedProducts: string[]) => void;
  currentProductId?: string;
  initialSelectedProducts?: string[];
}

const SimilarProductsSelector = ({
  open,
  onOpenChange,
  onSave,
  currentProductId,
  initialSelectedProducts = []
}: SimilarProductsSelectorProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialSelectedProducts);

  useEffect(() => {
    if (open) {
      setSelectedProductIds(initialSelectedProducts);
      fetchProducts();
    }
  }, [open, initialSelectedProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("id, name, images, discounted_price, currency")
        .eq("is_visible", true);
      
      // Exclude current product if provided
      if (currentProductId) {
        query = query.neq("id", currentProductId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedProductIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sélectionnez les produits similaires</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">Chargement des produits...</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-start space-x-3 border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <Checkbox 
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                  />
                  <div className="flex-1 flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-xs mt-1">{product.discounted_price} {product.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimilarProductsSelector;
