
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProductSelector from "@/components/ProductSelector";
import { createStore, fetchStores, deleteStore, updateStore, fetchStoreById } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ChevronRight, Eye, Trash, PenSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  images: string[];
  discounted_price: number;
  original_price: number;
  currency: string;
}

interface Store {
  id: string;
  name: string;
  products: string[];
  created_at: string;
}

const StoreForm = () => {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setIsLoading(true);
    try {
      const storeData = await fetchStores();
      setStores(storeData);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Erreur lors du chargement des boutiques");
    } finally {
      setIsLoading(false);
    }
  };

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
      if (editingStoreId) {
        // Update existing store
        const storeData = await updateStore(editingStoreId, {
          products: selectedProducts.map(p => p.id)
        });
        
        toast.success("Votre boutique a été mise à jour avec succès");
        navigate(`/store/${storeData.id}`);
        setEditingStoreId(null);
      } else {
        // Create a new store
        const storeData = await createStore({
          name: "Ma boutique",
          products: selectedProducts.map(p => p.id)
        });

        toast.success("Votre boutique a été créée avec succès");
        navigate(`/store/${storeData.id}`);
      }
      
      setSelectedProducts([]);
      loadStores(); // Refresh the stores list
    } catch (error) {
      console.error("Error creating/updating store:", error);
      toast.error("Une erreur est survenue lors de la création/modification de la boutique");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStore = async (storeId: string) => {
    try {
      const storeData = await fetchStoreById(storeId);
      if (!storeData) {
        toast.error("Boutique introuvable");
        return;
      }
      
      setEditingStoreId(storeId);
      
      // Fetch product details for the selected products
      const productIds = storeData.products || [];
      
      if (productIds.length === 0) {
        setSelectedProducts([]);
        setIsDialogOpen(true);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, images, discounted_price, original_price, currency")
          .in("id", productIds);
          
        if (error) throw error;
        
        if (data) {
          setSelectedProducts(data);
          setIsDialogOpen(true);
        }
      } catch (error) {
        console.error("Error fetching products for store:", error);
        toast.error("Erreur lors du chargement des produits de la boutique");
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      toast.error("Erreur lors du chargement des données de la boutique");
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      return;
    }

    try {
      await deleteStore(storeId);
      toast.success("Boutique supprimée avec succès");
      loadStores(); // Refresh the list
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("Erreur lors de la suppression de la boutique");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Créer votre boutique</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>{editingStoreId ? "Modifier la boutique" : "Sélection des produits"}</CardTitle>
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
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open && !selectedProducts.length) {
                    setEditingStoreId(null);
                  }
                }}
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
                {isSubmitting ? "Traitement en cours..." : editingStoreId ? "Mettre à jour ma boutique" : "Créer ma boutique"}
                {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Stores List Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Boutiques disponibles</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Chargement des boutiques...</p>
            </div>
          ) : stores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucune boutique n'a été créée</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{store.products.length} produits</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/store/${store.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditStore(store.id)}
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteStore(store.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreForm;
