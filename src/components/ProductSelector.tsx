
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  images: string[];
  discounted_price: number;
  original_price: number;
  currency: string;
}

interface ProductSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedProducts: Product[]) => void;
  maxSelection?: number;
  initialSelectedProducts?: Product[];
}

const ProductSelector = ({
  open,
  onOpenChange,
  onSave,
  maxSelection = 4,
  initialSelectedProducts = []
}: ProductSelectorProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedProducts(initialSelectedProducts);
      fetchProducts();
    }
  }, [open, initialSelectedProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, images, discounted_price, original_price, currency")
        .eq("is_visible", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= maxSelection) {
          toast.warning(`Vous ne pouvez sélectionner que ${maxSelection} produits maximum`);
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedProducts);
    onOpenChange(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Sélectionnez les produits (maximum {maxSelection})</DialogTitle>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
        
        {loading ? (
          <div className="py-8 text-center">Chargement des produits...</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-start space-x-3 border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleProductSelection(product)}
                >
                  <Checkbox 
                    checked={selectedProducts.some(p => p.id === product.id)}
                    onCheckedChange={() => toggleProductSelection(product)}
                  />
                  <div className="flex-1 flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"} 
                        alt={product.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <p className="text-xs line-through text-gray-500">{product.original_price} {product.currency}</p>
                        <p className="text-xs font-medium">{product.discounted_price} {product.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Aucun produit trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm">
            {selectedProducts.length} sur {maxSelection} produits sélectionnés
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={selectedProducts.length === 0}>
              Confirmer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
