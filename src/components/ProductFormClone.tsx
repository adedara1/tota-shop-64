import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSelector from "@/components/ColorSelector";
import { Database } from "@/integrations/supabase/types";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon, X, Link as LinkIcon, Globe, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorInput from "@/components/ColorInput";
import SimilarProductsSelector from "@/components/SimilarProductsSelector";

type CurrencyCode = Database['public']['Enums']['currency_code'];

const CURRENCIES = [
  { code: 'XOF' as CurrencyCode, label: 'Franc CFA (XOF) - UEMOA' },
  { code: 'XAF' as CurrencyCode, label: 'Franc CFA (XAF) - CEMAC' },
  { code: 'ZAR' as CurrencyCode, label: 'Rand sud-africain (ZAR)' },
  { code: 'MAD' as CurrencyCode, label: 'Dirham marocain (MAD)' },
  { code: 'EGP' as CurrencyCode, label: 'Livre égyptienne (EGP)' },
  { code: 'NGN' as CurrencyCode, label: 'Naira nigérian (NGN)' },
  { code: 'KES' as CurrencyCode, label: 'Shilling kényan (KES)' },
  { code: 'TND' as CurrencyCode, label: 'Dinar tunisien (TND)' },
  { code: 'UGX' as CurrencyCode, label: 'Shilling ougandais (UGX)' },
  { code: 'GHS' as CurrencyCode, label: 'Cedi ghanéen (GHS)' },
  { code: 'USD' as CurrencyCode, label: 'Dollar américain (USD)' },
  { code: 'EUR' as CurrencyCode, label: 'Euro (EUR)' }
];

interface ProductFormCloneProps {
  onSuccess: () => void;
  onCancel: () => void;
  product?: any | null;
}

interface OptionValue {
  value: string;
  image?: string;
}

const ProductFormClone = ({ onSuccess, onCancel, product }: ProductFormCloneProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const defaultColor = "#f1eee9";
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  
  const [optionTitleColor, setOptionTitleColor] = useState("#000000");
  const [optionValueColor, setOptionValueColor] = useState("#000000");
  const [productNameColor, setProductNameColor] = useState("#000000");
  const [originalPriceColor, setOriginalPriceColor] = useState("#808080");
  const [discountedPriceColor, setDiscountedPriceColor] = useState("#000000");
  const [quantityTextColor, setQuantityTextColor] = useState("#000000");
  
  const [showProductTrademark, setShowProductTrademark] = useState(true);
  const [showProductTrademarkColor, setShowProductTrademarkColor] = useState("#000000");
  const [showStarReviews, setShowStarReviews] = useState(true);
  const [starReviewsColor, setStarReviewsColor] = useState("#FFCC00");
  const [reviewCount, setReviewCount] = useState(1238);
  const [reviewCountColor, setReviewCountColor] = useState("#000000");
  const [starCount, setStarCount] = useState(5);
  const [showStockStatus, setShowStockStatus] = useState(true);
  const [stockStatusText, setStockStatusText] = useState("In stock, ready to ship");
  const [stockStatusColor, setStockStatusColor] = useState("#00AA00");
  const [similarProductsTitleColor, setSimilarProductsTitleColor] = useState("#FFFFFF");
  
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [optionTypes, setOptionTypes] = useState<string[]>([]);
  const [optionValues, setOptionValues] = useState<Record<string, any[]>>({});
  const [newOptionType, setNewOptionType] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingOptionType, setEditingOptionType] = useState("");
  const [optionImageFile, setOptionImageFile] = useState<File | null>(null);
  const [useInternalCart, setUseInternalCart] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [urlType, setUrlType] = useState<'whatsapp' | 'custom'>('whatsapp');
  const [hidePromoBar, setHidePromoBar] = useState(false);
  const [customPromoText, setCustomPromoText] = useState("Livraison GRATUITE et Paiement à la livraison !");
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<string[]>([]);
  const [showSimilarProductsSelector, setShowSimilarProductsSelector] = useState(false);

  // Initialiser le formulaire avec les données du produit si nous sommes en mode édition
  useEffect(() => {
    if (product) {
      setDescription(product.description || "");
      setSelectedColor(product.theme_color || defaultColor);
      setSimilarProducts(product.similar_products || []);
      
      setOptionTitleColor(product.option_title_color || "#000000");
      setOptionValueColor(product.option_value_color || "#000000");
      setProductNameColor(product.product_name_color || "#000000");
      setOriginalPriceColor(product.original_price_color || "#808080");
      setDiscountedPriceColor(product.discounted_price_color || "#000000");
      setQuantityTextColor(product.quantity_text_color || "#000000");
      
      setShowProductTrademark(product.show_product_trademark || false);
      setShowProductTrademarkColor(product.product_trademark_color || "#000000");
      setShowStarReviews(product.show_star_reviews || true);
      setStarReviewsColor(product.star_reviews_color || "#FFCC00");
      setReviewCount(product.review_count || 1238);
      setReviewCountColor(product.review_count_color || "#000000");
      setStarCount(product.star_count || 5);
      setShowStockStatus(product.show_stock_status || false);
      setStockStatusText(product.stock_status_text || "In stock, ready to ship");
      setStockStatusColor(product.stock_status_color || "#00AA00");
      setSimilarProductsTitleColor(product.similar_products_title_color || "#FFFFFF");
      
      setUseInternalCart(product.use_internal_cart || false);
      setHidePromoBar(product.hide_promo_bar || false);
      setCustomPromoText(product.custom_promo_text || "Livraison GRATUITE et Paiement à la livraison !");
      setShowSimilarProducts(product.show_similar_products || false);
      
      // Traitement des options
      if (product.options) {
        setOptionTypes(Object.keys(product.options));
        setOptionValues(product.options);
      }
      
      // Traitement de l'URL du panier
      if (product.cart_url) {
        if (product.cart_url === "#internal") {
          setUseInternalCart(true);
        } else if (product.cart_url.includes("wa.me")) {
          setUrlType('whatsapp');
          // Extraction du numéro WhatsApp et du message
          try {
            const url = new URL(product.cart_url);
            const phoneNumber = url.pathname.replace('/','');
            const message = url.searchParams.get('text') || '';
            setWhatsappNumber(phoneNumber);
            setWhatsappMessage(message);
          } catch (e) {
            console.error("Erreur lors de l'analyse de l'URL WhatsApp:", e);
          }
        } else {
          setUrlType('custom');
          setCustomUrl(product.cart_url);
        }
      }
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez télécharger que 4 images maximum",
        variant: "destructive",
      });
      return;
    }
    setImages(files);
  };

  const handleOptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOptionImageFile(e.target.files[0]);
    }
  };

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

  const addOptionValue = async () => {
    if (editingOptionType && newOptionValue.trim() && 
        !optionValues[editingOptionType]?.some(item => 
          typeof item === 'object' ? item.value === newOptionValue : item === newOptionValue)) {
      
      let optionValue: string | OptionValue = newOptionValue;
      
      if (optionImageFile) {
        try {
          const fileName = `option-${crypto.randomUUID()}-${optionImageFile.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, optionImageFile);

          if (uploadError) {
            console.error("Error uploading option image:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

          console.log("Option image uploaded successfully:", publicUrl);
          
          optionValue = {
            value: newOptionValue,
            image: publicUrl
          };
          
        } catch (error) {
          console.error("Error uploading option image:", error);
          toast({
            title: "Erreur",
            description: "Échec du téléchargement de l'image d'option",
            variant: "destructive",
          });
        }
      }
      
      setOptionValues({
        ...optionValues,
        [editingOptionType]: [...(optionValues[editingOptionType] || []), optionValue]
      });
      
      setNewOptionValue("");
      setOptionImageFile(null);
      
      const fileInput = document.getElementById('option-image-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const removeOptionType = (type: string) => {
    const newTypes = optionTypes.filter(t => t !== type);
    const newValues = { ...optionValues };
    delete newValues[type];
    
    setOptionTypes(newTypes);
    setOptionValues(newValues);
    if (editingOptionType === type) {
      setEditingOptionType("");
    }
  };

  const removeOptionValue = (type: string, value: string | OptionValue) => {
    if (optionValues[type]) {
      const valueToCompare = typeof value === 'object' ? value.value : value;
      
      setOptionValues({
        ...optionValues,
        [type]: optionValues[type].filter(v => {
          if (typeof v === 'object') {
            return v.value !== valueToCompare;
          }
          return v !== valueToCompare;
        })
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const imageUrls: string[] = [];

      if (images.length > 0) {
        for (const image of images) {
          try {
            const fileName = `${crypto.randomUUID()}-${image.name}`;
            console.log("Uploading image:", fileName);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("products")
              .upload(fileName, image);

            if (uploadError) {
              console.error("Error uploading image:", uploadError);
              throw new Error(`Erreur de téléchargement de l'image: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
              .from("products")
              .getPublicUrl(fileName);

            console.log("Image uploaded successfully:", publicUrl);
            imageUrls.push(publicUrl);
          } catch (imageError) {
            console.error("Error processing image:", imageError);
            toast({
              title: "Erreur",
              description: "Problème lors du téléchargement d'une image. Veuillez réessayer.",
              variant: "destructive",
            });
            setLoading(false);
            return; // Stop the submission if image upload fails
          }
        }
      }

      let cartUrl = "";
      
      if (useInternalCart) {
        cartUrl = "#internal";
      } else {
        if (urlType === 'custom' && customUrl) {
          cartUrl = customUrl;
        } else if (urlType === 'whatsapp') {
          const cleanWhatsappNumber = whatsappNumber.replace(/\D/g, '');
          cartUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        }
      }

      const productData = {
        name: formData.get("name") as string,
        original_price: parseInt(formData.get("original_price") as string) || 0,
        discounted_price: parseInt(formData.get("discounted_price") as string) || 0,
        description: description || "",
        cart_url: cartUrl || "#",
        theme_color: selectedColor,
        images: imageUrls.length > 0 ? imageUrls : product?.images || [],
        is_visible: true,
        button_text: formData.get("button_text") as string || "Contactez-nous sur WhatsApp",
        currency: formData.get("currency") as Database['public']['Enums']['currency_code'] || "XOF",
        options: optionTypes.length > 0 ? optionValues : null,
        use_internal_cart: useInternalCart,
        hide_promo_bar: hidePromoBar,
        custom_promo_text: customPromoText,
        option_title_color: optionTitleColor,
        option_value_color: optionValueColor,
        product_name_color: productNameColor,
        original_price_color: originalPriceColor,
        discounted_price_color: discountedPriceColor,
        quantity_text_color: quantityTextColor,
        show_product_trademark: showProductTrademark,
        product_trademark_color: showProductTrademarkColor,
        show_star_reviews: showStarReviews,
        star_reviews_color: starReviewsColor,
        review_count: reviewCount,
        review_count_color: reviewCountColor,
        star_count: starCount,
        show_stock_status: showStockStatus,
        stock_status_text: stockStatusText,
        stock_status_color: stockStatusColor,
        show_similar_products: showSimilarProducts,
        similar_products: similarProducts,
        similar_products_title_color: similarProductsTitleColor
      };

      console.log("Saving product data:", productData);

      if (product) {
        // Mode édition
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) {
          console.error("Error updating product:", updateError);
          throw new Error(`Erreur de mise à jour: ${updateError.message}`);
        }

        toast({
          title: "Succès",
          description: "Produit mis à jour avec succès",
        });

      } else {
        // Mode création
        const { error: insertError } = await supabase
          .from("products")
          .insert(productData);

        if (insertError) {
          console.error("Error creating product:", insertError);
          throw new Error(`Erreur de création: ${insertError.message}`);
        }

        toast({
          title: "Succès",
          description: "Produit créé avec succès",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error creating/updating product:", error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de la création/modification du produit. Veuillez vérifier les champs obligatoires.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimilarProductsSelect = (selected: string[]) => {
    setSimilarProducts(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="images-clone">Images du produit (Max 4)</Label>
        <Input
          id="images-clone"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
      </div>

      <div>
        <Label htmlFor="name-clone">Nom du produit</Label>
        <Input 
          id="name-clone" 
          name="name" 
          required 
          defaultValue={product?.name || ""}
        />
      </div>

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="show-product-trademark" 
          checked={showProductTrademark} 
          onCheckedChange={(checked) => {
            setShowProductTrademark(checked === true);
          }}
        />
        <Label htmlFor="show-product-trademark" className="font-medium cursor-pointer">
          Afficher le symbole "™" après le nom du produit
        </Label>
      </div>

      {showProductTrademark && (
        <ColorInput 
          label="Couleur du texte du nom avec trademark" 
          value={showProductTrademarkColor} 
          onChange={setShowProductTrademarkColor}
        />
      )}

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="show-star-reviews" 
          checked={showStarReviews} 
          onCheckedChange={(checked) => {
            setShowStarReviews(checked === true);
          }}
        />
        <Label htmlFor="show-star-reviews" className="font-medium cursor-pointer">
          Afficher les étoiles et le nombre d'avis
        </Label>
      </div>

      {showStarReviews && (
        <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="star-count">Nombre d'étoiles (1-5)</Label>
            <Input 
              id="star-count" 
              type="number" 
              min="1" 
              max="5" 
              value={starCount}
              onChange={(e) => setStarCount(parseInt(e.target.value))}
              className="w-20"
            />
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < starCount ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="review-count">Nombre d'avis</Label>
            <Input 
              id="review-count" 
              type="number" 
              min="0" 
              value={reviewCount}
              onChange={(e) => setReviewCount(parseInt(e.target.value))}
              className="w-40"
            />
          </div>
          
          <ColorInput 
            label="Couleur des étoiles" 
            value={starReviewsColor} 
            onChange={setStarReviewsColor}
            defaultColor="#FFCC00"
          />
          
          <ColorInput 
            label="Couleur du nombre d'avis" 
            value={reviewCountColor} 
            onChange={setReviewCountColor}
            defaultColor="#000000"
          />
        </div>
      )}

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="show-stock-status" 
          checked={showStockStatus} 
          onCheckedChange={(checked) => {
            setShowStockStatus(checked === true);
          }}
        />
        <Label htmlFor="show-stock-status" className="font-medium cursor-pointer">
          Afficher le statut de stock
        </Label>
      </div>

      {showStockStatus && (
        <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
          <div>
            <Label htmlFor="stock-status-text">Texte du statut de stock</Label>
            <Input 
              id="stock-status-text" 
              value={stockStatusText}
              onChange={(e) => setStockStatusText(e.target.value)}
              placeholder="Ex: En stock, prêt à être expédié"
            />
          </div>
          
          <ColorInput 
            label="Couleur du texte du statut de stock" 
            value={stockStatusColor} 
            onChange={setStockStatusColor}
            defaultColor="#00AA00"
          />
        </div>
      )}

      <div>
        <Label htmlFor="currency-clone">Devise</Label>
        <select
          id="currency-clone"
          name="currency"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          defaultValue="XOF"
          required
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="original_price-clone">Prix original</Label>
        <Input
          id="original_price-clone"
          name="original_price"
          type="number"
          required
          defaultValue={product?.original_price || ""}
        />
      </div>
      
      <ColorInput 
        label="Couleur du texte du prix original" 
        value={originalPriceColor} 
        onChange={setOriginalPriceColor}
        defaultColor="#808080"
      />

      <div>
        <Label htmlFor="discounted_price-clone">Prix réduit</Label>
        <Input
          id="discounted_price-clone"
          name="discounted_price"
          type="number"
          required
          defaultValue={product?.discounted_price || ""}
        />
      </div>
      
      <ColorInput 
        label="Couleur du texte du prix réduit" 
        value={discountedPriceColor} 
        onChange={setDiscountedPriceColor}
      />

      <ColorInput 
        label="Couleur du texte de quantité et ajustements" 
        value={quantityTextColor} 
        onChange={setQuantityTextColor}
      />

      <ColorInput 
        label="Couleur du texte du nom du produit" 
        value={productNameColor} 
        onChange={setProductNameColor}
      />

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="use-internal-cart" 
          checked={useInternalCart} 
          onCheckedChange={(checked) => {
            setUseInternalCart(checked === true);
          }}
        />
        <Label htmlFor="use-internal-cart" className="font-medium cursor-pointer">
          Utiliser le panier interne du site
        </Label>
      </div>
      
      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="hide-promo-bar" 
          checked={hidePromoBar} 
          onCheckedChange={(checked) => {
            setHidePromoBar(checked === true);
          }}
        />
        <Label htmlFor="hide-promo-bar" className="font-medium cursor-pointer">
          Masquer la barre d'annonce
        </Label>
      </div>
      
      {!hidePromoBar && (
        <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
          <div>
            <Label htmlFor="custom-promo-text">Texte personnalisé de la barre d'annonce</Label>
            <Input
              id="custom-promo-text"
              value={customPromoText}
              onChange={(e) => setCustomPromoText(e.target.value)}
              placeholder="Livraison GRATUITE et Paiement à la livraison !"
            />
          </div>
        </div>
      )}
      
      {!useInternalCart && (
        <div className="rounded-md border p-4 space-y-4">
          <Tabs defaultValue="whatsapp" value={urlType} onValueChange={(val) => setUrlType(val as 'whatsapp' | 'custom')}>
            <TabsList className="mb-4">
              <TabsTrigger value="whatsapp" className="flex items-center gap-1">
                <ImageIcon size={16} /> WhatsApp
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Globe size={16} /> URL personnalisée
              </TabsTrigger>
            </TabsList>
            
            {urlType === 'custom' ? (
              <div>
                <Label htmlFor="custom-url">URL personnalisée</Label>
                <div className="flex items-center mt-1">
                  <LinkIcon size={16} className="text-gray-400 mr-2" />
                  <Input
                    id="custom-url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    required={!useInternalCart && urlType === 'custom'}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="whatsapp-number-clone">Numéro WhatsApp</Label>
                  <Input
                    id="whatsapp-number-clone"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ex: 51180895"
                    required={!useInternalCart && urlType === 'whatsapp'}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp-message-clone">Message WhatsApp par défaut</Label>
                  <Input
                    id="whatsapp-message-clone"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Ex: Bonjour"
                    required={!useInternalCart && urlType === 'whatsapp'}
                  />
                </div>
              </>
            )}
          </Tabs>
        </div>
      )}

      <div>
        <Label htmlFor="button_text-clone">Texte du bouton</Label>
        <Input
          id="button_text-clone"
          name="button_text"
          required
          defaultValue={useInternalCart ? "Ajouter au panier" : "Contactez-nous sur WhatsApp"}
          placeholder={useInternalCart ? "Ajouter au panier" : "Contactez-nous sur WhatsApp"}
        />
      </div>

      <div>
        <Label htmlFor="description-clone">Description</Label>
        <div className="prose max-w-none">
          <RichTextEditor 
            value={description} 
            onChange={setDescription}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Couleur du thème</Label>
        <ColorSelector
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </div>

      <div className="space-y-4">
        <Label>Options du produit</Label>
        
        <ColorInput 
          label="Couleur du texte des titres d'options" 
          value={optionTitleColor} 
          onChange={setOptionTitleColor}
        />
        
        <ColorInput 
          label="Couleur du texte des valeurs d'options" 
          value={optionValueColor} 
          onChange={setOptionValueColor}
        />
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Nom de l'option (ex: Taille, Couleur)" 
            value={newOptionType}
            onChange={(e) => setNewOptionType(e.target.value)}
          />
          <Button 
            type="button" 
            onClick={addOptionType}
            variant="outline"
          >
            Ajouter
          </Button>
        </div>
        
        {optionTypes.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {optionTypes.map(type => (
                <Toggle
                  key={type}
                  pressed={editingOptionType === type}
                  onPressedChange={() => setEditingOptionType(type)}
                  className={`
                    rounded-full px-3 py-1 text-sm 
                    ${editingOptionType === type 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-300'
                    }
                  `}
                >
                  <span>{type}</span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOptionType(type);
                    }}
                    className="ml-2 text-xs"
                  >
                    ✕
                  </button>
                </Toggle>
              ))}
            </div>
            
            {editingOptionType && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Valeurs pour "{editingOptionType}"</h4>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Valeur de l'option (ex: S, M, L)" 
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      onClick={addOptionValue}
                      variant="outline"
                      size="sm"
                    >
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor="option-image-input" 
                      className="flex items-center gap-1 cursor-pointer text-sm p-2 border rounded hover:bg-gray-50"
                    >
                      <ImageIcon size={16} className="text-gray-500" />
                      <span>Ajouter une image</span>
                    </label>
                    <Input
                      id="option-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleOptionImageChange}
                      className="hidden"
                    />
                    {optionImageFile && (
                      <div className="text-xs text-gray-500">
                        {optionImageFile.name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {optionValues[editingOptionType]?.map((value, index) => {
                    const displayValue = typeof value === 'object' ? value.value : value;
                    const hasImage = typeof value === 'object' && value.image;
                    
                    return (
                      <div 
                        key={index} 
                        className={`${hasImage ? 'bg-blue-50' : 'bg-gray-100'} rounded-full px-3 py-1 text-sm flex items-center`}
                      >
                        {displayValue}
                        {hasImage && (
                          <span className="ml-1 text-blue-500">
                            <ImageIcon size={14} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeOptionValue(editingOptionType, value)}
                          className="ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="show-similar-products" 
          checked={showSimilarProducts} 
          onCheckedChange={(checked) => {
            setShowSimilarProducts(checked === true);
          }}
        />
        <Label htmlFor="show-similar-products" className="font-medium cursor-pointer">
          Afficher des produits similaires
        </Label>
      </div>
      
      {showSimilarProducts && (
        <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
          <div className="flex flex-col gap-3">
            <Label>Produits similaires sélectionnés: {similarProducts.length}</Label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSimilarProductsSelector(true)}
            >
              Sélectionner des produits similaires
            </Button>
            
            <ColorInput 
              label="Couleur du titre 'Produits similaires'" 
              value={similarProductsTitleColor} 
              onChange={setSimilarProductsTitleColor}
              defaultColor="#FFFFFF"
            />
          </div>
        </div>
      )}
      
      <SimilarProductsSelector
        open={showSimilarProductsSelector}
        onOpenChange={setShowSimilarProductsSelector}
        onSave={handleSimilarProductsSelect}
        initialSelectedProducts={similarProducts}
      />

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "En cours..." : product ? "Modifier" : "Créer"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1"
          type="button"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default ProductFormClone;
