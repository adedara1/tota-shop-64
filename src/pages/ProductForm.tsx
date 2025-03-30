import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Loader2, ListFilter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import ColorSelector from "@/components/ColorSelector";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  original_price: number;
  discounted_price: number;
  currency: string;
  cart_url: string;
  button_text: string;
  options: Record<string, any> | null;
  theme_color: string;
  use_internal_cart: boolean | null;
  hide_promo_bar: boolean | null;
  option_title_color: string | null;
  option_value_color: string | null;
  product_name_color: string | null;
  original_price_color: string | null;
  discounted_price_color: string | null;
  quantity_text_color: string | null;
  show_product_trademark: boolean | null;
  product_trademark_color: string | null;
  show_star_reviews: boolean | null;
  star_reviews_color: string | null;
  review_count: number | null;
  star_count: number | null;
  show_stock_status: boolean | null;
  stock_status_text: string | null;
  stock_status_color: string | null;
  show_similar_products: boolean | null;
  similar_products: string[] | null;
}

interface ProductFormProps {
  initialProduct?: Product;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du produit doit comporter au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères.",
  }),
  original_price: z.number().min(0, {
    message: "Le prix original doit être supérieur ou égal à 0.",
  }),
  discounted_price: z.number().min(0, {
    message: "Le prix réduit doit être supérieur ou égal à 0.",
  }),
  currency: z.string(),
  cart_url: z.string().url({
    message: "L'URL du panier doit être une URL valide.",
  }),
  button_text: z.string().min(2, {
    message: "Le texte du bouton doit comporter au moins 2 caractères.",
  }),
  theme_color: z.string(),
  option_title_color: z.string(),
  option_value_color: z.string(),
  product_name_color: z.string(),
  original_price_color: z.string(),
  discounted_price_color: z.string(),
  quantity_text_color: z.string(),
  product_trademark_color: z.string(),
  star_reviews_color: z.string(),
  stock_status_color: z.string(),
});

interface SimilarProductsSelectorProps {
  currentProductId: string;
  selectedProductIds: string[];
  onSelectionChange: (selectedProductIds: string[]) => void;
}

const SimilarProductsSelector = ({
  currentProductId,
  selectedProductIds,
  onSelectionChange
}: SimilarProductsSelectorProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name")
          .neq("id", currentProductId);

        if (error) {
          setError(error.message);
        } else if (data) {
          setProducts(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentProductId]);

  const toggleProductSelection = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onSelectionChange(selectedProductIds.filter((id) => id !== productId));
    } else {
      onSelectionChange([...selectedProductIds, productId]);
    }
  };

  if (loading) {
    return <div>Chargement des produits...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between">
          <Label htmlFor={`product-${product.id}`}>{product.name}</Label>
          <Switch
            id={`product-${product.id}`}
            checked={selectedProductIds.includes(product.id)}
            onCheckedChange={() => toggleProductSelection(product.id)}
          />
        </div>
      ))}
    </div>
  );
};

const ProductForm = ({ initialProduct }: ProductFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [product, setProduct] = useState<Product>(
    initialProduct || {
      id: "",
      name: "",
      description: "",
      images: [],
      original_price: 0,
      discounted_price: 0,
      currency: "XOF",
      cart_url: "",
      button_text: "Ajouter au panier",
      options: null,
      theme_color: "#f1eee9",
      use_internal_cart: false,
      hide_promo_bar: false,
      option_title_color: "#000000",
      option_value_color: "#000000",
      product_name_color: "#000000",
      original_price_color: "#808080",
      discounted_price_color: "#000000",
      quantity_text_color: "#000000",
      show_product_trademark: true,
      product_trademark_color: "#000000",
      show_star_reviews: true,
      star_reviews_color: "#FFCC00",
      review_count: 1238,
      star_count: 5,
      show_stock_status: true,
      stock_status_text: "In stock, ready to ship",
      stock_status_color: "#00AA00",
      show_similar_products: false,
      similar_products: [],
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>(product.images || []);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [showSimilarProductsSelector, setShowSimilarProductsSelector] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      original_price: product.original_price,
      discounted_price: product.discounted_price,
      currency: product.currency,
      cart_url: product.cart_url,
      button_text: product.button_text,
      theme_color: product.theme_color,
      option_title_color: product.option_title_color || "#000000",
      option_value_color: product.option_value_color || "#000000",
      product_name_color: product.product_name_color || "#000000",
      original_price_color: product.original_price_color || "#808080",
      discounted_price_color: product.discounted_price_color || "#000000",
      quantity_text_color: product.quantity_text_color || "#000000",
      product_trademark_color: product.product_trademark_color || "#000000",
      star_reviews_color: product.star_reviews_color || "#FFCC00",
      stock_status_color: product.stock_status_color || "#00AA00",
    },
  });

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setImagePreview(initialProduct.images || []);
      form.reset({
        name: initialProduct.name,
        description: initialProduct.description,
        original_price: initialProduct.original_price,
        discounted_price: initialProduct.discounted_price,
        currency: initialProduct.currency,
        cart_url: initialProduct.cart_url,
        button_text: initialProduct.button_text,
        theme_color: initialProduct.theme_color,
        option_title_color: initialProduct.option_title_color || "#000000",
        option_value_color: initialProduct.option_value_color || "#000000",
        product_name_color: initialProduct.product_name_color || "#000000",
        original_price_color: initialProduct.original_price_color || "#808080",
        discounted_price_color: initialProduct.discounted_price_color || "#000000",
        quantity_text_color: initialProduct.quantity_text_color || "#000000",
        product_trademark_color: initialProduct.product_trademark_color || "#000000",
        star_reviews_color: initialProduct.star_reviews_color || "#FFCC00",
        stock_status_color: initialProduct.stock_status_color || "#00AA00",
      });
    }
  }, [initialProduct, form]);

  const { data: existingProduct, isLoading } = useQuery(
    ["product", id],
    async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    {
      enabled: isEditing,
      initialData: initialProduct || undefined,
    }
  );

  useEffect(() => {
    if (existingProduct) {
      setProduct(existingProduct);
      setImagePreview(existingProduct.images || []);
      form.reset({
        name: existingProduct.name,
        description: existingProduct.description,
        original_price: existingProduct.original_price,
        discounted_price: existingProduct.discounted_price,
        currency: existingProduct.currency,
        cart_url: existingProduct.cart_url,
        button_text: existingProduct.button_text,
        theme_color: existingProduct.theme_color,
        option_title_color: existingProduct.option_title_color || "#000000",
        option_value_color: existingProduct.option_value_color || "#000000",
        product_name_color: existingProduct.product_name_color || "#000000",
        original_price_color: existingProduct.original_price_color || "#808080",
        discounted_price_color: existingProduct.discounted_price_color || "#000000",
        quantity_text_color: existingProduct.quantity_text_color || "#000000",
        product_trademark_color: existingProduct.product_trademark_color || "#000000",
        star_reviews_color: existingProduct.star_reviews_color || "#FFCC00",
        stock_status_color: existingProduct.stock_status_color || "#00AA00",
      });
    }
  }, [existingProduct, isEditing, form]);

  const upsertProduct = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const imagesToSave = [...imagePreview];

      if (newImage) {
        const imagePath = `/lovable-uploads/${newImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(imagePath, newImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        imagesToSave.push(
          `https://wndftcyfvbfnensmwpae.supabase.co/storage/v1/object/public/images${imagePath}`
        );
      }

      const productData = {
        ...values,
        images: imagesToSave,
        options: Object.keys(options).length > 0 ? options : null,
        use_internal_cart: product.use_internal_cart,
        hide_promo_bar: product.hide_promo_bar,
        show_similar_products: product.show_similar_products,
        similar_products: product.similar_products,
      };

      let response;
      if (isEditing) {
        response = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);
      } else {
        response = await supabase.from("products").insert([productData]);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "Produit mis à jour" : "Produit créé",
        description: `Le produit a été ${
          isEditing ? "mis à jour" : "créé"
        } avec succès.`,
      });

      queryClient.invalidateQueries(["products"]);
      navigate("/products");
    } catch (error: any) {
      console.error("Error during product upsert:", error);
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de la sauvegarde du produit.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const { mutate: deleteProduct } = useMutation(
    async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        toast({
          title: "Produit supprimé",
          description: "Le produit a été supprimé avec succès.",
        });
        queryClient.invalidateQueries(["products"]);
        navigate("/products");
      },
      onError: (error: any) => {
        toast({
          title: "Erreur",
          description:
            error.message || "Une erreur est survenue lors de la suppression.",
          variant: "destructive",
        });
      },
    }
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview([...imagePreview, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreview(imagePreview.filter((_, index) => index !== indexToRemove));
  };

  const handleAddOption = () => {
    if (newOptionName && newOptionValue) {
      setOptions((prevOptions) => {
        const updatedOptions = { ...prevOptions };
        if (updatedOptions[newOptionName]) {
          updatedOptions[newOptionName] = [
            ...updatedOptions[newOptionName],
            newOptionValue,
          ];
        } else {
          updatedOptions[newOptionName] = [newOptionValue];
        }
        return updatedOptions;
      });
      setNewOptionValue("");
    }
  };

  const handleRemoveOption = (optionName: string, optionValue: string) => {
    setOptions((prevOptions) => {
      const updatedOptions = { ...prevOptions };
      updatedOptions[optionName] = prevOptions[optionName].filter(
        (value) => value !== optionValue
      );
      if (updatedOptions[optionName].length === 0) {
        delete updatedOptions[optionName];
      }
      return updatedOptions;
    });
  };

  const handleSave = form.handleSubmit(async (values) => {
    await upsertProduct(values);
  });

  const handleSimilarProductsChange = (selectedProducts: string[]) => {
    setProduct(prev => ({
      ...prev,
      similar_products: selectedProducts
    }));
    setShowSimilarProductsSelector(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
      <PromoBar />
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Modifier le produit" : "Créer un nouveau produit"}
          </h1>
          <div className="flex items-center space-x-4">
            {isEditing && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (product.id) {
                    deleteProduct(product.id);
                  }
                }}
                disabled={isSaving}
              >
                Supprimer
              </Button>
            )}
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8">
          <div>
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="pricing">Prix</TabsTrigger>
                <TabsTrigger value="appearance">Apparence</TabsTrigger>
                <TabsTrigger value="advanced">Avancé</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                    <CardDescription>
                      Informations de base sur le produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du produit" {...field} />
                          </FormControl>
                          <FormDescription>
                            C'est le nom qui sera affiché sur la page du produit.
                          </FormDescription>
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
                              placeholder="Description du produit"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Description détaillée du produit.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Images du produit</CardTitle>
                    <CardDescription>
                      Ajouter, supprimer et organiser les images du produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreview.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="rounded-md aspect-square object-cover"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full opacity-70 hover:opacity-100 transition"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Label htmlFor="new-image">Ajouter une nouvelle image</Label>
                    <Input
                      type="file"
                      id="new-image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="options" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Options du produit</CardTitle>
                    <CardDescription>
                      Définir les différentes options disponibles pour le produit
                      (taille, couleur, etc.).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Nom de l'option (ex: Taille)"
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="Valeur de l'option (ex: S)"
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {Object.entries(options).map(([optionName, optionValues]) => (
                        <div key={optionName} className="space-y-1">
                          <h4 className="font-semibold">{optionName}</h4>
                          <div className="flex flex-wrap gap-2">
                            {optionValues.map((value) => (
                              <Badge
                                key={value}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {value}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-transparent"
                                  onClick={() =>
                                    handleRemoveOption(optionName, value)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prix et devise</CardTitle>
                    <CardDescription>
                      Définir les prix et la devise du produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix original</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Prix original"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Prix de vente normal.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discounted_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix réduit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Prix réduit"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Prix de vente avec réduction.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Devise</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[200px] justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? field.value
                                    : "Sélectionner la devise"}
                                  <ListFilter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Rechercher une devise..." />
                                <CommandEmpty>Aucune devise trouvée.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="XOF"
                                    onSelect={() => {
                                      form.setValue("currency", "XOF");
                                    }}
                                  >
                                    XOF
                                  </CommandItem>
                                  <CommandItem
                                    value="XAF"
                                    onSelect={() => {
                                      form.setValue("currency", "XAF");
                                    }}
                                  >
                                    XAF
                                  </CommandItem>
                                  <CommandItem
                                    value="ZAR"
                                    onSelect={() => {
                                      form.setValue("currency", "ZAR");
                                    }}
                                  >
                                    ZAR
                                  </CommandItem>
                                  <CommandItem
                                    value="MAD"
                                    onSelect={() => {
                                      form.setValue("currency", "MAD");
                                    }}
                                  >
                                    MAD
                                  </CommandItem>
                                  <CommandItem
                                    value="EGP"
                                    onSelect={() => {
                                      form.setValue("currency", "EGP");
                                    }}
                                  >
                                    EGP
                                  </CommandItem>
                                  <CommandItem
                                    value="NGN"
                                    onSelect={() => {
                                      form.setValue("currency", "NGN");
                                    }}
                                  >
                                    NGN
                                  </CommandItem>
                                  <CommandItem
                                    value="KES"
                                    onSelect={() => {
                                      form.setValue("currency", "KES");
                                    }}
                                  >
                                    KES
                                  </CommandItem>
                                  <CommandItem
                                    value="TND"
                                    onSelect={() => {
                                      form.setValue("currency", "TND");
                                    }}
                                  >
                                    TND
                                  </CommandItem>
                                  <CommandItem
                                    value="UGX"
                                    onSelect={() => {
                                      form.setValue("currency", "UGX");
                                    }}
                                  >
                                    UGX
                                  </CommandItem>
                                  <CommandItem
                                    value="GHS"
                                    onSelect={() => {
                                      form.setValue("currency", "GHS");
                                    }}
                                  >
                                    GHS
                                  </CommandItem>
                                  <CommandItem
                                    value="USD"
                                    onSelect={() => {
                                      form.setValue("currency", "USD");
                                    }}
                                  >
                                    USD
                                  </CommandItem>
                                  <CommandItem
                                    value="EUR"
                                    onSelect={() => {
                                      form.setValue("currency", "EUR");
                                    }}
                                  >
                                    EUR
                                  </CommandItem>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Sélectionner la devise du produit.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cart_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL du panier</FormLabel>
                          <FormControl>
                            <Input placeholder="URL du panier" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL où l'utilisateur sera redirigé pour ajouter le
                            produit au panier.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="button_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texte du bouton</FormLabel>
                          <FormControl>
                            <Input placeholder="Texte du bouton" {...field} />
                          </FormControl>
                          <FormDescription>
                            Texte affiché sur le bouton d'ajout au panier.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Apparence</CardTitle>
                    <CardDescription>
                      Personnaliser l'apparence du produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="theme_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur du thème</FormLabel>
                          <FormControl>
                            <ColorSelector
                              selectedColor={field.value}
                              onColorSelect={(color) => form.setValue("theme_color", color)}
                            />
                          </FormControl>
                          <FormDescription>
                            Couleur de thème principale du produit.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="option_title_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur du titre de l'option</FormLabel>
                          <FormControl>
                            <ColorSelector
                              selectedColor={field.value}
                              onColorSelect={(color) => form.setValue("option_title_color", color)}
                            />
                          </FormControl>
                          <FormDescription>
                            Couleur du titre de l'option.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="option_value_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur de la valeur de l'option</FormLabel>
                          <FormControl>
                            <ColorSelector
                              selectedColor={field.value}
                              onColorSelect={(color) => form.setValue("option_value_color", color)}
                            />
                          </FormControl>
                          <FormDescription>
                            Couleur de la valeur de l'option.
                          </
