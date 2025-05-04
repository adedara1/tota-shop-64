import { useState, useEffect } from "react";
import ProductOptions from "./ProductOptions";
import { Plus, Minus, ShoppingBag, ShoppingCart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";

interface OptionValue {
  value: string;
  image?: string;
}

interface ProductDetailsProps {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  cartUrl: string;
  buttonText: string;
  currency: Database['public']['Enums']['currency_code'];
  onButtonClick?: () => void;
  options?: Record<string, any>;
  onOptionImageChange?: (images: string[]) => void;
  useInternalCart?: boolean;
  onAddToCart?: (productData: any, quantity: number, selectedOptions: Record<string, any>) => void;
  productId?: string;
  optionTitleColor?: string;
  optionValueColor?: string;
  productNameColor?: string;
  originalPriceColor?: string;
  discountedPriceColor?: string;
  quantityTextColor?: string;
  showProductTrademark?: boolean;
  productTrademarkColor?: string;
  showStarReviews?: boolean;
  starReviewsColor?: string;
  reviewCount?: number;
  starCount?: number;
  showStockStatus?: boolean;
  stockStatusText?: string;
  stockStatusColor?: string;
}

const ProductDetails = ({
  name,
  originalPrice,
  discountedPrice,
  description,
  cartUrl,
  buttonText,
  currency,
  onButtonClick,
  options = {},
  onOptionImageChange,
  useInternalCart = false,
  onAddToCart,
  productId,
  optionTitleColor = "#000000",
  optionValueColor = "#000000",
  productNameColor = "#000000",
  originalPriceColor = "#808080",
  discountedPriceColor = "#000000",
  quantityTextColor = "#000000",
  showProductTrademark = true,
  productTrademarkColor = "#000000",
  showStarReviews = true,
  starReviewsColor = "#FFCC00",
  reviewCount = 1238,
  starCount = 5,
  showStockStatus = true,
  stockStatusText = "In stock, ready to ship",
  stockStatusColor = "#00AA00"
}: ProductDetailsProps) => {
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(discountedPrice);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  
  const discountPercentage = originalPrice > 0 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) 
    : 0;
  
  useEffect(() => {
    const initialOptions: Record<string, any> = {};
    const optionImages: string[] = [];
    
    Object.entries(options).forEach(([optionType, values]) => {
      if (values && values.length > 0) {
        const firstOption = values[0];
        if (typeof firstOption === 'object' && firstOption !== null) {
          initialOptions[optionType] = firstOption;
          if (firstOption.image) {
            optionImages.push(firstOption.image);
          }
        } else {
          initialOptions[optionType] = { value: firstOption };
        }
      }
    });
    
    setSelectedOptions(initialOptions);
    
    if (optionImages.length > 0 && onOptionImageChange) {
      onOptionImageChange(optionImages);
    }
  }, [options]);
  
  useEffect(() => {
    setTotalPrice(discountedPrice * quantity);
  }, [discountedPrice, quantity]);
  
  const handleOptionSelect = (optionType: string, selectedValue: string | OptionValue) => {
    setSelectedOptions(prev => {
      const newSelectedOptions = { ...prev };
      
      if (typeof selectedValue === 'string') {
        newSelectedOptions[optionType] = { value: selectedValue };
      } else {
        newSelectedOptions[optionType] = selectedValue;
      }
      
      if (onOptionImageChange) {
        const selectedImages = Object.values(newSelectedOptions)
          .filter(opt => typeof opt === 'object' && opt.image)
          .map(opt => opt.image as string);
        
        onOptionImageChange(selectedImages);
      }
      
      console.log(`Selected ${optionType}:`, selectedValue);
      console.log("All selected options:", newSelectedOptions);
      
      return newSelectedOptions;
    });
  };
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    
    if (useInternalCart) {
      if (productId) {
        addToCart({
          id: productId,
          name: name,
          price: discountedPrice,
          quantity: quantity,
          options: selectedOptions,
          image: Object.values(selectedOptions)
            .find((opt: any) => opt.image)?.image || null
        });
        
        toast({
          title: "Produit ajouté au panier",
          description: `${quantity} × ${name} ajouté au panier`,
        });
        
        setAddedToCart(true);
      }
      return;
    }
    
    // If using custom URL (not internal cart and not whatsapp)
    if (!cartUrl.includes('wa.me')) {
      let finalUrl = cartUrl;
      const params = new URLSearchParams();
      
      params.append('quantity', quantity.toString());
      
      Object.entries(selectedOptions).forEach(([key, value]) => {
        const optValue = typeof value === 'object' ? value.value : value;
        params.append(key, optValue);
      });
      
      params.append('price', totalPrice.toString());
      params.append('product', name);
      
      if (params.toString()) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.toString();
      }
      
      console.log("Checkout URL:", finalUrl);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // If using WhatsApp
    if (cartUrl.includes('wa.me')) {
      const phoneNumber = cartUrl.split('wa.me/')[1]?.split('?')[0];
      if (!phoneNumber) return;
      
      // Format WhatsApp message
      const optionsText = Object.entries(selectedOptions)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? value.value : value}`)
        .join('\n');
      
      const message = `
*Nouvelle commande*
Produit: ${name}
Prix: ${discountedPrice} ${displayCurrency}
Quantité: ${quantity}
Total: ${totalPrice} ${displayCurrency}
${optionsText ? `\n*Options*:\n${optionsText}` : ''}
      `.trim();
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const goToCart = () => {
    navigate('/paiement');
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Check if using custom URL (not WhatsApp)
  const isCustomUrl = cartUrl && !cartUrl.includes('wa.me') && !useInternalCart;
  const isWhatsApp = cartUrl && cartUrl.includes('wa.me');

  return (
    <div className="space-y-6 max-w-full">
      <h1 className="text-5xl font-medium break-words" style={{ color: productNameColor }}>
        {name}
        {showProductTrademark && <span style={{ color: productTrademarkColor }}>™</span>}
      </h1>
      
      {showStarReviews && (
        <div className="flex items-center mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < starCount ? "fill-current" : "text-gray-300"}
                style={{ color: i < starCount ? starReviewsColor : "#D1D5DB" }} 
              />
            ))}
          </div>
          <span className="text-xs ml-2">{reviewCount} reviews</span>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-gray-400 line-through text-2xl" style={{ color: originalPriceColor }}>{originalPrice}</span>
          <span className="text-gray-400 line-through text-2xl ml-1" style={{ color: originalPriceColor }}>{displayCurrency}</span>
        </div>
        <div className="flex items-center">
          <span className="text-3xl" style={{ color: discountedPriceColor }}>{totalPrice}</span>
          <span className="text-3xl ml-1" style={{ color: discountedPriceColor }}>{displayCurrency}</span>
        </div>
        {discountPercentage > 0 && (
          <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 ml-2">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>
      
      {showStockStatus && (
        <div className="flex items-center mt-4 text-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span style={{ color: stockStatusColor }}>{stockStatusText}</span>
        </div>
      )}
      
      {/* Hide quantity selection for custom URL products */}
      {!isCustomUrl && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: quantityTextColor }}>Quantité</h3>
          <div className="flex items-center">
            <button 
              onClick={decreaseQuantity}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300"
              style={{ color: quantityTextColor }}
            >
              <Minus size={16} />
            </button>
            <span className="mx-4" style={{ color: quantityTextColor }}>{quantity}</span>
            <button 
              onClick={increaseQuantity}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300"
              style={{ color: quantityTextColor }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Hide options for custom URL products */}
      {!isCustomUrl && Object.entries(options).map(([optionTitle, optionValues]) => (
        <ProductOptions
          key={optionTitle}
          title={optionTitle}
          options={optionValues}
          onSelect={(value) => handleOptionSelect(optionTitle, value)}
          selectedOption={
            selectedOptions[optionTitle] 
              ? (typeof selectedOptions[optionTitle] === 'object' 
                  ? selectedOptions[optionTitle].value 
                  : selectedOptions[optionTitle])
              : undefined
          }
          titleColor={optionTitleColor}
          valueColor={optionValueColor}
        />
      ))}
      
      {!isCustomUrl && Object.keys(selectedOptions).length > 0 && (
        <div className="bg-white/80 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2" style={{ color: optionTitleColor }}>Options sélectionnées:</h3>
          <ul className="space-y-1">
            {Object.entries(selectedOptions).map(([option, value]) => (
              <li key={option} className="text-sm">
                <span className="font-medium" style={{ color: optionTitleColor }}>{option}:</span>{" "}
                <span style={{ color: optionValueColor }}>
                  {typeof value === 'object' ? value.value : value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Updated buttons section - both buttons visible by default */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={handleButtonClick}
          className="block flex-1 bg-orange-500 text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors text-center"
        >
          {buttonText}
        </button>
        
        {useInternalCart && (
          <button 
            onClick={goToCart}
            className="block flex-1 bg-gray-800 text-white py-3 px-6 rounded hover:bg-gray-900 transition-colors text-center flex items-center justify-center"
          >
            <ShoppingCart className="mr-2" size={18} />
            {addedToCart ? "Voir mon panier" : "Commander maintenant"}
          </button>
        )}
      </div>
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
