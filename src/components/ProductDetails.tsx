
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProductOptions from "./ProductOptions";
import { Plus, Minus } from "lucide-react";

interface ProductDetailsProps {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  cartUrl: string;
  buttonText: string;
  currency: string;
  onButtonClick?: () => void;
  options?: Record<string, string[]>;
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
}: ProductDetailsProps) => {
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const handleOptionSelect = (optionType: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
  };
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    
    // Construct URL with selected options
    let finalUrl = cartUrl;
    const params = new URLSearchParams();
    
    // Add quantity
    params.append('quantity', quantity.toString());
    
    // Add selected options
    Object.entries(selectedOptions).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    // Append parameters to URL
    if (params.toString()) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.toString();
    }
    
    // Open the cart URL in a new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
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
          <span className="text-3xl">{discountedPrice}</span>
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
          selectedOption={selectedOptions[optionTitle]}
        />
      ))}
      
      {/* Call to Action Button */}
      <button 
        onClick={handleButtonClick}
        className="block w-full bg-orange-500 text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors text-center mt-4"
      >
        {buttonText}
      </button>
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
