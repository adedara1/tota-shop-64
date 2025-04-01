import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSelector from "@/components/ColorSelector";
import { Copy, Edit, Eye, EyeOff, Plus, Trash, ArrowLeft } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";
import ProductFormClone from "@/components/ProductFormClone";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import SimilarProductsSelector from "@/components/SimilarProductsSelector";
import { Link } from "react-router-dom";

type CurrencyCode = Database['public']['Enums']['currency_code'];
const COLOR_PALETTES = {
  blue: ['#0000FF', '#79F8F8', '#007FFF', '#1E7FCB', '#74D0F1', '#A9EAFE', '#3A8EBA'],
  white: ['#FFFFFF', '#FEFEFE', '#EFEFEF', '#F0FFFF', '#F5F5DC', '#FEFEE2'],
  brown: ['#5B3C11', '#88421D', '#A76726', '#F0C300', '#9D3E0C', '#8B6C42', '#C8AD7F'],
  gray: ['#606060', '#5A5E6B', '#CECECE', '#EFEFEF', '#766F64', '#3D2B1F', '#856D4D'],
  yellow: ['#FFFF00', '#F0C300', '#FFCB60', '#F0E36B', '#FFF48D', '#E8D630', '#E2BC74'],
  black: ['#000000', '#2C030B', '#3A020D', '#0B1616', '#120D16', '#130E0A'],
  orange: ['#ED7F10', '#E67E30', '#FFCB60', '#F1E2BE', '#FFE4C4', '#F4661B', '#DF6D14'],
  pink: ['#FD6C9E', '#FFE4C4', '#DE3163', '#FEC3AC', '#FDE9E0', '#FEE7F0', '#C72C48'],
  red: ['#FF0000', '#91283B', '#6D071A', '#842E1B', '#BB0B0B', '#E73E01', '#ED0000'],
  green: ['#00FF00', '#79F8F8', '#7BA05B', '#008E8E', '#048B9A', '#83A697', '#80D0D0']
};
const ALL_COLORS = Object.values(COLOR_PALETTES).flat();
const CURRENCIES = [{
  code: 'XOF' as CurrencyCode,
  label: 'Franc CFA (XOF) - UEMOA'
}, {
  code: 'XAF' as CurrencyCode,
  label: 'Franc CFA (XAF) - CEMAC'
}, {
  code: 'ZAR' as CurrencyCode,
  label: 'Rand sud-africain (ZAR)'
}, {
  code: 'MAD' as CurrencyCode,
  label: 'Dirham marocain (MAD)'
}, {
  code: 'EGP' as CurrencyCode,
  label: 'Livre égyptienne (EGP)'
}, {
  code: 'NGN' as CurrencyCode,
  label: 'Naira nigérian (NGN)'
}, {
  code: 'KES' as CurrencyCode,
  label: 'Shilling kényan (KES)'
}, {
  code: 'TND' as CurrencyCode,
  label: 'Dinar tunisien (TND)'
}, {
  code: 'UGX' as CurrencyCode,
  label: 'Shilling ougandais (UGX)'
}, {
  code: 'GHS' as CurrencyCode,
  label: 'Cedi ghanéen (GHS)'
}, {
  code: 'USD' as CurrencyCode,
  label: 'Dollar américain (USD)'
}, {
  code: 'EUR' as CurrencyCode,
  label: 'Euro (EUR)'
}];

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
  theme_color: string;
  created_at: string;
  is_visible: boolean;
  button_text: string;
  currency: CurrencyCode;
  options?: Record<string, string[]> | null;
  use_internal_cart?: boolean;
  show_similar_products?: boolean;
  similar_products?: string[];
}

const ProductForm = () => {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const defaultColor = "#f1eee9";
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [optionTypes, setOptionTypes] = useState<string[]>([]);
  const [optionValues, setOptionValues] = useState<Record<string, string[]>>({});
  const [newOptionType, setNewOptionType] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingOptionType, setEditingOptionType] = useState("");
  const [showSimilarProductsSelector, setShowSimilarProductsSelector] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("products").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez télécharger que 4 images maximum",
        variant: "destructive"
      });
      return;
    }
    setImages(files);
  };

  useEffect(() => {
    if (editingProduct && editingProduct.options) {
      const types = Object.keys(editingProduct.options);
      setOptionTypes(types);
      setOptionValues(editingProduct.options);
    } else {
      setOptionTypes([]);
      setOptionValues({});
    }
  }, [editingProduct]);

  const addOptionType = () => {
    if (newOptionType.trim() && !optionTypes.includes(newOptionType)) {
      setOptionTypes([...optionTypes, newOptionType]);
      setOptionValues({
        ...optionValues,
        [newOptionType]: []
      });
      setNewOptionType("");
      setEditingOptionType(newOptionType);
    }
  };

  const addOptionValue = () => {
    if (editingOptionType && newOptionValue.trim() && !optionValues[editingOptionType]?.includes(newOptionValue)) {
      setOptionValues({
        ...optionValues,
        [editingOptionType]: [...(optionValues[editingOptionType] || []), newOptionValue]
      });
      setNewOptionValue("");
    }
  };

  const removeOptionType = (type: string) => {
    const newTypes = optionTypes.filter(t => t !== type);
    const newValues = {
      ...optionValues
    };
    delete newValues[type];
    setOptionTypes(newTypes);
    setOptionValues(newValues);
    if (editingOptionType === type) {
      setEditingOptionType("");
    }
  };

  const removeOptionValue = (type: string, value: string) => {
    if (optionValues[type]) {
      setOptionValues({
        ...optionValues,
        [type]: optionValues[type].filter(v => v !== value)
      });
    }
  };

  const handleSimilarProductsSelect = (selectedProducts: string[]) => {
    setSimilarProducts(selectedProducts);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const imageUrls: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const fileName = `${crypto.randomUUID()}-${image.name}`;
          console.log("Uploading image:", fileName);
          const {
            data: uploadData,
            error: uploadError
          } = await supabase.storage.from("products").upload(fileName, image);
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            throw uploadError;
          }
          const {
            data: {
              publicUrl
            }
          } = supabase.storage.from("products").getPublicUrl(fileName);
          console.log("Image uploaded successfully:", publicUrl);
          imageUrls.push(publicUrl);
        }
      }
      const productData = {
        name: formData.get("name") as string,
        original_price: parseInt(formData.get("original_price") as string),
        discounted_price: parseInt(formData.get("discounted_price") as string),
        description: description,
        cart_url: formData.get("cart_url") as string,
        theme_color: selectedColor,
        images: imageUrls.length > 0 ? imageUrls : editingProduct?.images || [],
        is_visible: editingProduct ? editingProduct.is_visible : true,
        button_text: formData.get("button_text") as string || "Ajouter au panier",
        currency: formData.get("currency") as CurrencyCode || "XOF",
        options: optionTypes.length > 0 ? optionValues : null,
        use_internal_cart: formData.get("use_internal_cart") === "on",
        show_similar_products: formData.get("show_similar_products") === "on",
        similar_products: similarProducts.length > 0 ? similarProducts : []
      };
      console.log("Saving product data:", productData);
      if (editingProduct) {
        const {
          error: updateError
        } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (updateError) {
          console.error("Error updating product:", updateError);
          throw updateError;
        }
        toast({
          title: "Succès",
          description: "Produit mis à jour avec succès"
        });
      } else {
        const {
          error: insertError
        } = await supabase.from("products").insert(productData);
        if (insertError) {
          console.error("Error creating product:", insertError);
          throw insertError;
        }
        toast({
          title: "Succès",
          description: "Produit créé avec succès"
        });
      }
      resetForm();
      setIsSheetOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating/updating product:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'opération",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const {
        error
      } = await supabase.from("products").update({
        is_visible: !currentVisibility
      }).eq("id", id);
      if (error) throw error;
      toast({
        title: "Succès",
        description: `Produit ${!currentVisibility ? 'visible' : 'masqué'} avec succès`
      });
      fetchProducts();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Erreur",
        description: "Échec de la modification",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDescription(product.description);
    setSelectedColor(product.theme_color || defaultColor);
    setSimilarProducts(product.similar_products || []);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
        return;
      }
      setLoading(true);
      console.log("Starting deletion process for product:", id);

      const {
        error: statsError
      } = await supabase.from("product_stats").delete().eq("product_id", id);
      if (statsError) {
        console.error("Error deleting product stats:", statsError);
      }

      const {
        error: cartError
      } = await supabase.from("cart_items").delete().eq("product_id", id);
      if (cartError) {
        console.error("Error deleting cart items:", cartError);
      }

      const {
        error
      } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Supabase deletion error:", error);
        throw error;
      }
      console.log("Product successfully deleted");
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès"
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression. Vérifiez que ce produit n'est pas utilisé ailleurs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string) => {
    const url = `https://digit-sarl.store/product/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copié !",
      description: "L'URL du produit a été copiée dans le presse-papier"
    });
  };

  const resetForm = () => {
    setImages([]);
    setDescription("");
    setSelectedColor(defaultColor);
    setEditingProduct(null);
    setOptionTypes([]);
    setOptionValues({});
    setNewOptionType("");
    setNewOptionValue("");
    setEditingOptionType("");
    setSimilarProducts([]);
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) form.reset();
  };

  useEffect(() => {
    if (editingProduct) {
      setDescription(editingProduct.description);
      setSelectedColor(editingProduct.theme_color || defaultColor);
      setSimilarProducts(editingProduct.similar_products || []);
      setIsSheetOpen(true);
    }
  }, [editingProduct]);

  return <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 px-4 overflow-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/home">
                <Button variant="outline" size="icon" title="Retour à l'accueil">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-medium">Gestion des produits</h1>
            </div>
            <div className="flex gap-4">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau produit
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle>
                      {editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="images">Images du produit (Max 4)</Label>
                        <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} />
                      </div>

                      <div>
                        <Label htmlFor="name">Nom du produit</Label>
                        <Input id="name" name="name" required defaultValue={editingProduct?.name} />
                      </div>

                      <div>
                        <Label htmlFor="currency">Devise</Label>
                        <select id="currency" name="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" defaultValue={editingProduct?.currency || "XOF"} required>
                          {CURRENCIES.map(currency => <option key={currency.code} value={currency.code}>
                              {currency.label}
                            </option>)}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="original_price">Prix original</Label>
                        <Input id="original_price" name="original_price" type="number" required defaultValue={editingProduct?.original_price} />
                      </div>

                      <div>
                        <Label htmlFor="discounted_price">Prix réduit</Label>
                        <Input id="discounted_price" name="discounted_price" type="number" required defaultValue={editingProduct?.discounted_price} />
                      </div>

                      <div>
                        <Label htmlFor="button_text">Texte du bouton</Label>
                        <Input id="button_text" name="button_text" required defaultValue={editingProduct?.button_text || "Ajouter au panier"} placeholder="Ajouter au panier" />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <div className="prose max-w-none">
                          <RichTextEditor value={description} onChange={setDescription} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Couleur du thème</Label>
                        <ColorSelector selectedColor={selectedColor} onColorSelect={setSelectedColor} />
                      </div>

                      <div>
                        <Label htmlFor="cart_url">URL du panier</Label>
                        <Input id="cart_url" name="cart_url" type="url" required defaultValue={editingProduct?.cart_url} />
                      </div>

                      <div className="space-y-4">
                        <Label>Options du produit</Label>
                        
                        <div className="flex items-center gap-2">
                          <Input placeholder="Nom de l'option (ex: Taille, Couleur)" value={newOptionType} onChange={e => setNewOptionType(e.target.value)} />
                          <Button type="button" onClick={addOptionType} variant="outline">
                            Ajouter
                          </Button>
                        </div>
                        
                        {optionTypes.length > 0 && <div className="border rounded-lg p-4">
                            <div className="flex gap-2 mb-4 flex-wrap">
                              {optionTypes.map(type => <Toggle key={type} pressed={editingOptionType === type} onPressedChange={() => setEditingOptionType(type)} className={`
                                    rounded-full px-3 py-1 text-sm 
                                    ${editingOptionType === type ? 'bg-black text-white' : 'bg-white border border-gray-300'}
                                  `}>
                                  <span>{type}</span>
                                  <button type="button" onClick={e => {
                              e.stopPropagation();
                              removeOptionType(type);
                            }} className="ml-2 text-xs">
                                    ✕
                                  </button>
                                </Toggle>)}
                            </div>
                            
                            {editingOptionType && <div className="space-y-3">
                                <h4 className="text-sm font-medium">Valeurs pour "{editingOptionType}"</h4>
                                
                                <div className="flex items-center gap-2">
                                  <Input placeholder="Valeur de l'option (ex: S, M, L)" value={newOptionValue} onChange={e => setNewOptionValue(e.target.value)} />
                                  <Button type="button" onClick={addOptionValue} variant="outline" size="sm">
                                    Ajouter
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {optionValues[editingOptionType]?.map(value => <div key={value} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
                                      {value}
                                      <button type="button" onClick={() => removeOptionValue(editingOptionType, value)} className="ml-2">
                                        ✕
                                      </button>
                                    </div>)}
                                </div>
                              </div>}
                          </div>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="show_similar_products" 
                            name="show_similar_products"
                            defaultChecked={editingProduct?.show_similar_products}
                          />
                          <Label htmlFor="show_similar_products">Afficher des produits similaires</Label>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setShowSimilarProductsSelector(true)}
                        >
                          Sélectionner des produits similaires
                          {similarProducts.length > 0 && ` (${similarProducts.length} sélectionnés)`}
                        </Button>
                      </div>

                      <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? "En cours..." : editingProduct ? "Modifier" : "Créer"}
                        </Button>
                        <SheetClose asChild>
                          <Button variant="outline" onClick={resetForm} className="flex-1">
                            Annuler
                          </Button>
                        </SheetClose>
                      </div>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet open={showCloneForm} onOpenChange={setShowCloneForm}>
                <SheetTrigger asChild>
                  <Button variant="default" className="bg-green-500 hover:bg-green-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un produit
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle>
                      Créer un nouveau produit
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <ProductFormClone onSuccess={() => {
                    setShowCloneForm(false);
                    fetchProducts();
                  }} onCancel={() => setShowCloneForm(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left">Nom</th>
                    <th className="px-6 py-3 text-left">Prix original</th>
                    <th className="px-6 py-3 text-left">Prix réduit</th>
                    <th className="px-6 py-3 text-left">Date de création</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4">{product.original_price} {product.currency}</td>
                      <td className="px-6 py-4">{product.discounted_price} {product.currency}</td>
                      <td className="px-6 py-4">
                        {format(new Date(product.created_at), "d MMMM yyyy", {
                      locale: fr
                    })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => toggleVisibility(product.id, product.is_visible)} title={product.is_visible ? "Masquer" : "Afficher"}>
                            {product.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(product.id)} title="Copier l'URL">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(product)} title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)} title="Supprimer">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default ProductForm;
