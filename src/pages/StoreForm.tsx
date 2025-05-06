
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface FormValues {
  name: string;
  description: string;
  contact: string;
  address: string;
}

const StoreForm = () => {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      contact: "",
      address: ""
    }
  });

  const handleSelectProducts = (products: Product[]) => {
    setSelectedProducts(products);
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedProducts.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new store
      const storeData = await createStore({
        name: data.name,
        description: data.description,
        contact: data.contact,
        address: data.address,
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Entrez les informations de base de votre boutique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Le nom de la boutique est requis" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la boutique</FormLabel>
                        <FormControl>
                          <Input placeholder="Ma boutique" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre boutique en quelques mots..."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                  <CardDescription>
                    Comment vos clients peuvent vous contacter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact"
                    rules={{ required: "Les coordonnées de contact sont requises" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Email ou téléphone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse de la boutique" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produits</CardTitle>
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
              </Card>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création en cours..." : "Créer ma boutique"}
                  {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreForm;
