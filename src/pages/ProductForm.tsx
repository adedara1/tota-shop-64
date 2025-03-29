import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/RichTextEditor";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Undo2, Plus, X, Edit, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Currency = Database['public']['Enums']['currency_code'];

interface ProductData {
  id?: string;
  name: string;
  description: string;
  original_price: number;
  discounted_price: number;
  currency: Currency;
  images: string[];
  cart_url: string;
  button_text: string;
  theme_color: string;
  options?: Record<string, any>;
  use_internal_cart: boolean;
  hide_promo_bar?: boolean;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ProductData>({
    name: "",
    description: "",
    original_price: 0,
    discounted_price: 0,
    currency: "XOF",
    images: [],
    cart_url: "",
    button_text: "Ajouter au panier",
    theme_color: "#f1eee9",
    options: {},
    use_internal_cart: false,
    hide_promo_bar: false
  });
  const [colorOptions, setColorOptions] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState("general");
  const [addingOptionType, setAddingOptionType] = useState("");
  const [addingOptionValue, setAddingOptionValue] = useState("");
  const [addingImageUrl, setAddingImageUrl] = useState("");
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(!id);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
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

      const options = data.options as Record<string, any> | null;
      
      setProduct({
        ...data,
        options
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Erreur",
        description: "Échec du chargement du produit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (id) {
        result = await supabase
          .from("products")
          .update(product)
          .eq("id", id);
      } else {
        result = await supabase
          .from("products")
          .insert(product);
      }

      if (result.error) throw result.error;
      
      toast({
        title: "Succès",
        description: id 
          ? "Produit mis à jour avec succès" 
          : "Produit créé avec succès",
      });

      if (!id) {
        navigate("/products");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduct((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value: string) => {
    setProduct((prev) => ({ ...prev, description: value }));
  };

  const addOption = () => {
    if (!addingOptionType.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir un type d'option",
        variant: "destructive",
      });
      return;
    }

    setProduct((prev) => {
      const updatedOptions = { ...prev.options };
      if (!updatedOptions[addingOptionType]) {
        updatedOptions[addingOptionType] = [];
      }
      
      if (addingOptionValue.trim()) {
        if (addingImageUrl.trim()) {
          updatedOptions[addingOptionType].push({
            value: addingOptionValue,
            image: addingImageUrl
          });
        } else {
          updatedOptions[addingOptionType].push(addingOptionValue);
        }
      }
      
      return { ...prev, options: updatedOptions };
    });

    setAddingOptionValue("");
    setAddingImageUrl("");
  };

  const removeOption = (optionType: string, index: number) => {
    setProduct((prev) => {
      const updatedOptions = { ...prev.options };
      if (updatedOptions[optionType]) {
        updatedOptions[optionType] = updatedOptions[optionType].filter(
          (_, i) => i !== index
        );
        
        if (updatedOptions[optionType].length === 0) {
          delete updatedOptions[optionType];
        }
      }
      return { ...prev, options: updatedOptions };
    });
  };

  const removeOptionType = (optionType: string) => {
    setProduct((prev) => {
      const updatedOptions = { ...prev.options };
      delete updatedOptions[optionType];
      return { ...prev, options: updatedOptions };
    });
  };

  const addImage = (url: string) => {
    if (!url.trim()) return;
    
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, url]
    }));
    
    setAddingImageUrl("");
  };

  const removeImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handlePreviewClick = () => {
    if (id) {
      window.open(`/product/${id}`, '_blank');
    } else {
      toast({
        title: "Enregistrement requis",
        description: "Veuillez d'abord enregistrer ce produit pour pouvoir le prévisualiser.",
        variant: "destructive",
      });
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? "Modifier le produit" : "Nouveau produit"}
        </h1>
        <div className="flex gap-2">
          {id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreviewClick}>
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button 
            variant="default" 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {!isEditing && id ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="text-center">
            <h2 className="text-xl font-medium">{product.name}</h2>
            <p className="text-gray-500 mt-2">
              Mode lecture seule. Cliquez sur le bouton "Modifier" pour apporter des modifications.
            </p>
            <Button onClick={toggleEditing} className="mt-4">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="checkout">Panier & Paiement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleInputChange}
                      placeholder="Nom du produit"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme_color">Couleur du thème</Label>
                    <Input
                      id="theme_color"
                      name="theme_color"
                      type="color"
                      value={product.theme_color}
                      onChange={handleInputChange}
                      className="h-10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="original_price">Prix original</Label>
                    <Input
                      id="original_price"
                      name="original_price"
                      type="number"
                      value={product.original_price}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discounted_price">Prix réduit</Label>
                    <Input
                      id="discounted_price"
                      name="discounted_price"
                      type="number"
                      value={product.discounted_price}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select 
                      value={product.currency}
                      onValueChange={(value) => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">XOF (CFA)</SelectItem>
                        <SelectItem value="XAF">XAF (CFA)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor 
                    value={product.description} 
                    onChange={handleEditorChange} 
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hide_promo_bar"
                    checked={product.hide_promo_bar}
                    onCheckedChange={(checked) => handleSwitchChange("hide_promo_bar", checked as boolean)}
                  />
                  <Label htmlFor="hide_promo_bar">Masquer la barre de promotion</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Label htmlFor="add_image">Ajouter une image</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add_image"
                          value={addingImageUrl}
                          onChange={(e) => setAddingImageUrl(e.target.value)}
                          placeholder="URL de l'image"
                        />
                        <Button type="button" onClick={() => addImage(addingImageUrl)}>
                          Ajouter
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Note: Ajoutez d'abord des images à la bibliothèque média, puis utilisez leurs URLs ici.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {product.images.map((url, index) => (
                        <div 
                          key={index} 
                          className={`relative group border rounded-md overflow-hidden ${
                            index === 0 ? "border-blue-500" : "border-gray-200"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Product ${index}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="rounded-full"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="options" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <Label>Ajouter une option</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <Input
                          placeholder="Type d'option (ex: Couleur)"
                          value={addingOptionType}
                          onChange={(e) => setAddingOptionType(e.target.value)}
                        />
                        <Input
                          placeholder="Valeur (ex: Rouge)"
                          value={addingOptionValue}
                          onChange={(e) => setAddingOptionValue(e.target.value)}
                        />
                        <Input
                          placeholder="URL de l'image (optionnel)"
                          value={addingImageUrl}
                          onChange={(e) => setAddingImageUrl(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={addOption}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> 
                        Ajouter une option
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {Object.entries(product.options || {}).map(([optionType, values]) => (
                        <div key={optionType} className="border p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{optionType}</h3>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeOptionType(optionType)}
                            >
                              Supprimer
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {values.map((option, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div className="flex items-center">
                                  {typeof option === 'object' && option.image && (
                                    <img 
                                      src={option.image} 
                                      alt={option.value}
                                      className="w-8 h-8 rounded-full mr-2 object-cover"
                                    />
                                  )}
                                  <span>{typeof option === 'object' ? option.value : option}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(optionType, index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {Object.keys(product.options || {}).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Aucune option ajoutée
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="checkout" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="cart_url">URL du panier</Label>
                    <Input
                      id="cart_url"
                      name="cart_url"
                      value={product.cart_url}
                      onChange={handleInputChange}
                      placeholder="https://exemple.com/panier"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'URL vers laquelle les clients seront redirigés pour finaliser leur achat.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="button_text">Texte du bouton</Label>
                    <Input
                      id="button_text"
                      name="button_text"
                      value={product.button_text}
                      onChange={handleInputChange}
                      placeholder="Ajouter au panier"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use_internal_cart"
                      checked={product.use_internal_cart}
                      onCheckedChange={(checked) => handleSwitchChange("use_internal_cart", checked)}
                    />
                    <Label htmlFor="use_internal_cart">Utiliser le panier interne</Label>
                  </div>
                  
                  {product.use_internal_cart && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Les clients seront redirigés vers la page de paiement intégrée.
                        L'URL du panier externe sera ignorée.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="col-span-12 lg:col-span-4">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Aperçu du produit</h3>
                
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md mb-3">
                    <p className="text-gray-400">Aucune image</p>
                  </div>
                )}
                
                <h4 className="font-bold">{product.name || "Nom du produit"}</h4>
                
                <div className="flex gap-2 mt-1">
                  <span className="line-through text-gray-400">
                    {product.original_price} {product.currency}
                  </span>
                  <span className="font-medium">
                    {product.discounted_price} {product.currency}
                  </span>
                </div>
                
                {Object.keys(product.options || {}).length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-1">Options:</h5>
                    <div className="text-sm text-gray-600">
                      {Object.entries(product.options || {}).map(([type, values]) => (
                        <div key={type} className="mb-1">
                          <span className="font-medium">{type}:</span>{" "}
                          {values.map(v => typeof v === 'object' ? v.value : v).join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={handlePreviewClick}
                    disabled={!id}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir l'aperçu complet
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID:</span>
                    <span className="font-mono">{id || "Nouveau produit"}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Couleur du thème:</span>
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: product.theme_color }}
                      ></div>
                      <span>{product.theme_color}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mode panier:</span>
                    <span>
                      {product.use_internal_cart ? "Interne" : "Externe"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Barre promo:</span>
                    <span>
                      {product.hide_promo_bar ? "Masquée" : "Visible"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
