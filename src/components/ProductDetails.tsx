
import { useState, useEffect } from "react";
import ProductOptions from "./ProductOptions";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

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
  productId
}: ProductDetailsProps) => {
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(discountedPrice);
  const navigate = useNavigate();
  
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
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    
    if (useInternalCart) {
      if (onAddToCart) {
        onAddToCart({ id: productId, name, price: discountedPrice }, quantity, selectedOptions);
      }
      return;
    }
    
    // For external URLs
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

  const goToCart = () => {
    navigate('/paiement');
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
            <ShoppingBag className="mr-2" size={18} />
            Voir mon panier
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
