
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProductSelector from "@/components/ProductSelector";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ChevronRight, Eye, Trash, PenSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MediaUploader from "@/components/MediaUploader";

interface Product {
  id: string;
  name: string;
  images: string[];
  discounted_price: number;
  original_price: number;
  currency: string;
}

interface StoreData {
  id?: string;
  name: string;
  products: string[];
  media_url?: string;
  media_type?: string;
  show_media?: boolean;
  description?: string;
  contact?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
}

interface Store extends StoreData {}

// Fonctions d'aide pour l'interaction avec Supabase
const createStore = async (storeData: StoreData): Promise<Store> => {
  // Générer un slug à partir du nom
  const slug = storeData.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const dataWithSlug = { ...storeData, slug };
  
  const { data, error } = await supabase
    .from('stores')
    .insert(dataWithSlug)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const fetchStores = async (): Promise<StoreData[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchStoreById = async (id: string): Promise<StoreData | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
};

const updateStore = async (id: string, storeData: Partial<StoreData>): Promise<StoreData> => {
  // Si le nom est mis à jour, mettre à jour le slug aussi
  if (storeData.name) {
    storeData.slug = storeData.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  }
  
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteStore = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

const handleSupabaseError = (error: any, toastFn: any): void => {
  console.error("Supabase Error:", error);
  toastFn({
    title: "Erreur",
    description: error?.message || "Une erreur inattendue s'est produite",
    variant: "destructive"
  });
};

const StoreForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [showMedia, setShowMedia] = useState<boolean>(true);
  const [storeName, setStoreName] = useState<string>("Ma boutique");

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
      handleSupabaseError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProducts = (products: Product[]) => {
    setSelectedProducts(products);
  };

  const handleMediaUpload = (url: string, type: "image" | "video") => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleShowMediaChange = (show: boolean) => {
    setShowMedia(show);
  };

  const onSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un produit",
        variant: "destructive"
      });
      return;
    }

    if (!storeName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez donner un nom à votre boutique",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const storeData: StoreData = {
        name: storeName,
        products: selectedProducts.map(p => p.id),
        media_url: mediaUrl || undefined,
        media_type: mediaUrl ? mediaType : undefined,
        show_media: showMedia
      };

      if (editingStoreId) {
        // Update existing store
        const updatedStore = await updateStore(editingStoreId, storeData);
        
        toast({
          title: "Succès",
          description: "Votre boutique a été mise à jour avec succès"
        });
        navigate(`/store/${updatedStore.slug}`);
        setEditingStoreId(null);
      } else {
        // Create a new store
        const newStore = await createStore(storeData);

        toast({
          title: "Succès",
          description: "Votre boutique a été créée avec succès"
        });
        navigate(`/store/${newStore.slug}`);
      }
      
      setSelectedProducts([]);
      setMediaUrl("");
      setStoreName("Ma boutique");
      loadStores(); // Refresh the stores list
    } catch (error) {
      console.error("Error creating/updating store:", error);
      handleSupabaseError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStore = async (storeId: string) => {
    try {
      const storeData = await fetchStoreById(storeId);
      if (!storeData) {
        toast({
          title: "Erreur",
          description: "Boutique introuvable"
        });
        return;
      }
      
      setEditingStoreId(storeId);
      
      // Set store name
      setStoreName(storeData.name);
      
      // Set media data if available
      if (storeData.media_url) {
        setMediaUrl(storeData.media_url);
        setMediaType(storeData.media_type || "image");
      } else {
        setMediaUrl("");
        setMediaType("image");
      }
      
      // Set show_media flag
      setShowMedia(storeData.show_media !== false);
      
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
          
        if (error) {
          handleSupabaseError(error, toast);
          return;
        }
        
        if (data) {
          setSelectedProducts(data);
          setIsDialogOpen(true);
        }
      } catch (error) {
        console.error("Error fetching products for store:", error);
        handleSupabaseError(error, toast);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      handleSupabaseError(error, toast);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      return;
    }

    try {
      await deleteStore(storeId);
      toast({
        title: "Succès",
        description: "Boutique supprimée avec succès"
      });
      loadStores(); // Refresh the list
    } catch (error) {
      console.error("Error deleting store:", error);
      handleSupabaseError(error, toast);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-8 text-center">{editingStoreId ? "Modifier la boutique" : "Créer votre boutique"}</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>{editingStoreId ? "Modifier la boutique" : "Créer une boutique"}</CardTitle>
              <CardDescription>
                Personnalisez votre boutique et sélectionnez jusqu'à 4 produits qui seront affichés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nom de la boutique</Label>
                <Input 
                  id="store-name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Entrez le nom de votre boutique"
                />
              </div>
              
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

              <MediaUploader 
                onMediaUpload={handleMediaUpload}
                initialMedia={mediaUrl ? { url: mediaUrl, type: mediaType } : undefined}
                showMedia={showMedia}
                onShowMediaChange={handleShowMediaChange}
              />

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
                disabled={isSubmitting || selectedProducts.length === 0 || !storeName.trim()} 
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
                              onClick={() => navigate(`/store/${store.slug || store.id}`)}
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
