
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProductSelector from "@/components/ProductSelector";
import { createStore } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  images: string[];
  discounted_price: number;
  original_price: number;
  currency: string;
}

const StoreForm = () => {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectProducts = (products: Product[]) => {
    setSelectedProducts(products);
  };

  const onSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new store with just a default name and the selected products
      const storeData = await createStore({
        name: "Ma boutique",
        products: selectedProducts.map(p => p.id)
      });

      toast.success("Votre boutique a été créée avec succès");
      navigate(`/store/${storeData.id}`);
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Une erreur est survenue lors de la création de la boutique");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Créer votre boutique</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Sélection des produits</CardTitle>
              <CardDescription>
                Sélectionnez jusqu'à 4 produits qui seront affichés dans votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
              >
                Sélectionner des produits
              </Button>

              {selectedProducts.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="border rounded-md overflow-hidden bg-white"
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs line-clamp-2 font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.discounted_price} {product.currency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ProductSelector
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSelectProducts}
                initialSelectedProducts={selectedProducts}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="button" 
                disabled={isSubmitting || selectedProducts.length === 0} 
                onClick={onSubmit}
              >
                {isSubmitting ? "Création en cours..." : "Créer ma boutique"}
                {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreForm;
