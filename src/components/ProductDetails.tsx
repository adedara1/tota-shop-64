
import { useState, useEffect } from "react";
import ProductOptions from "./ProductOptions";
import { Plus, Minus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { addToCart } from "@/utils/cartUtils";
import { useToast } from "@/hooks/use-toast";

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
  productId?: string;
  useInternalCart?: boolean;
  secondaryButton?: {
    text: string;
    url: string;
    color: string;
  };
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
  productId,
  useInternalCart = false,
  secondaryButton,
}: ProductDetailsProps) => {
  const { toast } = useToast();
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(discountedPrice);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Initialize selectedOptions with the first option of each type
  useEffect(() => {
    const initialOptions: Record<string, any> = {};
    const optionImages: string[] = [];
    
    Object.entries(options).forEach(([optionType, values]) => {
      if (values && values.length > 0) {
        // Check if value is an object with image property
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
    
    // Update gallery with option images
    if (optionImages.length > 0 && onOptionImageChange) {
      onOptionImageChange(optionImages);
    }
  }, [options, onOptionImageChange]);
  
  // Update total price when quantity changes
  useEffect(() => {
    setTotalPrice(discountedPrice * quantity);
  }, [discountedPrice, quantity]);
  
  const handleOptionSelect = (optionType: string, value: string | OptionValue) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
    
    // Update image gallery if option has an image
    if (onOptionImageChange) {
      const selectedImages = Object.values(selectedOptions)
        .filter(opt => typeof opt === 'object' && opt.image)
        .map(opt => opt.image);
      
      // Add the newly selected option image if it exists
      if (typeof value === 'object' && value.image) {
        const newSelectedImages = [...selectedImages];
        const existingIndex = newSelectedImages.indexOf(value.image);
        
        if (existingIndex === -1) {
          newSelectedImages.push(value.image);
        }
        
        onOptionImageChange(newSelectedImages);
      }
    }
    
    console.log(`Selected ${optionType}:`, value);
  };
  
  const handleButtonClick = async () => {
    if (onButtonClick) {
      onButtonClick();
    }
    
    if (useInternalCart && productId) {
      setIsAddingToCart(true);
      
      try {
        // Convert selected options to format for cart
        const optionsForCart: Record<string, string> = {};
        Object.entries(selectedOptions).forEach(([key, value]) => {
          optionsForCart[key] = typeof value === 'object' ? value.value : value;
        });
        
        const success = await addToCart({
          productId,
          name,
          price: discountedPrice,
          quantity,
          options: optionsForCart,
          image: options.images && options.images.length > 0 ? options.images[0] : undefined
        });
        
        if (success) {
          toast({
            title: "Produit ajouté",
            description: `${name} a été ajouté à votre panier`,
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter le produit au panier",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le produit au panier",
          variant: "destructive",
        });
      } finally {
        setIsAddingToCart(false);
      }
      
      return;
    }
    
    // Construct URL with selected options
    let finalUrl = cartUrl;
    const params = new URLSearchParams();
    
    // Add quantity
    params.append('quantity', quantity.toString());
    
    // Add selected options
    Object.entries(selectedOptions).forEach(([key, value]) => {
      const optValue = typeof value === 'object' ? value.value : value;
      params.append(key, optValue);
    });
    
    // Add price (total price based on quantity)
    params.append('price', totalPrice.toString());
    
    // Add product name
    params.append('product', name);
    
    // Append parameters to URL
    if (params.toString()) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.toString();
    }
    
    console.log("Checkout URL:", finalUrl);
    
    // Open the cart URL in a new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSecondaryButtonClick = () => {
    if (secondaryButton?.url) {
      window.open(secondaryButton.url, '_blank', 'noopener,noreferrer');
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="space-y-6 max-w-full">
      <h1 className="text-5xl font-medium break-words">{name}</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-gray-400 line-through text-2xl">{originalPrice}</span>
          <span className="text-gray-400 line-through text-2xl ml-1">{displayCurrency}</span>
        </div>
        <div className="flex items-center">
          <span className="text-3xl">{totalPrice}</span>
          <span className="text-3xl ml-1">{displayCurrency}</span>
        </div>
      </div>
      
      {/* Quantity Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Quantité</h3>
        <div className="flex items-center">
          <button 
            onClick={decreaseQuantity}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300"
          >
            <Minus size={16} />
          </button>
          <span className="mx-4">{quantity}</span>
          <button 
            onClick={increaseQuantity}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Product Options */}
      {Object.entries(options).map(([optionTitle, optionValues]) => (
        <ProductOptions
          key={optionTitle}
          title={optionTitle}
          options={optionValues}
          onSelect={(value) => handleOptionSelect(optionTitle, value)}
          selectedOption={typeof selectedOptions[optionTitle] === 'object' 
            ? selectedOptions[optionTitle].value 
            : selectedOptions[optionTitle]}
        />
      ))}
      
      {/* Selected Options Summary */}
      {Object.keys(selectedOptions).length > 0 && (
        <div className="bg-white/80 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Options sélectionnées:</h3>
          <ul className="space-y-1">
            {Object.entries(selectedOptions).map(([option, value]) => (
              <li key={option} className="text-sm">
                <span className="font-medium">{option}:</span> {
                  typeof value === 'object' ? value.value : value
                }
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Call to Action Button */}
      <button 
        onClick={handleButtonClick}
        disabled={isAddingToCart}
        className="block w-full bg-orange-500 text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors text-center mt-4 disabled:opacity-75"
      >
        {isAddingToCart ? "Ajout en cours..." : buttonText}
      </button>
      
      {/* Secondary Button (if present) */}
      {secondaryButton && secondaryButton.text && (
        <button 
          onClick={handleSecondaryButtonClick}
          className="block w-full py-3 px-6 rounded text-center mt-2 border"
          style={{ 
            backgroundColor: secondaryButton.color || '#f59e0b',
            color: isLightColor(secondaryButton.color) ? 'black' : 'white'
          }}
        >
          {secondaryButton.text}
        </button>
      )}
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Default to true if color is not provided
  if (!color) return true;
  
  // Convert hex to RGB
  let r, g, b;
  
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return true; // Default for non-hex colors
  }
  
  // Calculate luminance using the formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is light (luminance > 0.5)
  return luminance > 0.5;
}

export default ProductDetails;
