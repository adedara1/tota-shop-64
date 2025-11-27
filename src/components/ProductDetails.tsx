import { useState, useEffect } from "react";
import ProductOptions from "./ProductOptions";
import { Plus, Minus, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";
import VideoModal from "./VideoModal";
import DirectOrderForm from "./DirectOrderForm";

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
  productImage?: string | null;
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
  reviewCountColor?: string;
  starCount?: number;
  showStockStatus?: boolean;
  stockStatusText?: string;
  stockStatusColor?: string;
  videoUrl?: string;
  showVideo?: boolean;
  videoPipEnabled?: boolean;
  videoAutoplay?: boolean;
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
  productImage = null,
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
  reviewCountColor = "#000000",
  starCount = 5,
  showStockStatus = true,
  stockStatusText = "In stock, ready to ship",
  stockStatusColor = "#00AA00",
  videoUrl,
  showVideo = false,
  videoPipEnabled = false,
  videoAutoplay = false
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
    
    // This function is only used for external links (when useInternalCart is false)
    
    // If using custom URL (not whatsapp)
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

  // Find the image for the order submission: prioritize option image, fallback to main product image
  const optionImage = Object.values(selectedOptions)
    .find((opt: any) => opt.image)?.image || null;
    
  const orderImage = optionImage || productImage;


  // Check if using custom URL (not WhatsApp)
  const isCustomUrl = cartUrl && !cartUrl.includes('wa.me') && !useInternalCart;
  
  // Determine if we should show the direct order form (when internal cart is enabled)
  const showDirectOrderForm = useInternalCart;

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
          <span className="text-xs ml-2" style={{ color: reviewCountColor }}>{reviewCount} reviews</span>
        </div>
      )}
      
      {/* Afficher la vidéo intégrée uniquement si showVideo est true, videoUrl est défini et videoPipEnabled est false */}
      {showVideo && videoUrl && !videoPipEnabled && (
        <div className="my-4">
          <iframe
            src={videoUrl}
            title={name}
            className="w-full aspect-video rounded-lg overflow-hidden shadow-md"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      {/* Afficher VideoModal uniquement si showVideo est true, videoUrl est défini et videoPipEnabled est true */}
      {showVideo && videoUrl && videoPipEnabled && (
        <VideoModal 
          videoSrc={videoUrl} 
          videoTitle={name}
        />
      )}
      
      <div className="flex items-center">
        <div className="flex items-center">
          <span className="text-gray-400 line-through text-2xl" style={{ color: originalPriceColor }}>{originalPrice}</span>
          <span className="text-gray-400 line-through text-2xl ml-1" style={{ color: originalPriceColor }}>{displayCurrency}</span>
        </div>
        <div className="flex items-center ml-2">
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
        <div className="relative border border-black rounded-lg p-3 mt-4 animate-blink">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="flex items-center mt-2 text-sm">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span style={{ color: stockStatusColor }}>{stockStatusText}</span>
          </div>
        </div>
      )}
      
      {/* Options du produit */}
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
      
      {/* Affichage des options sélectionnées */}
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
      
      {/* --- DIRECT ORDER FORM INSERTION --- */}
      {showDirectOrderForm && productId && (
        <div className="flex justify-center w-full"> {/* Ajout d'un conteneur flex pour centrer */}
          <DirectOrderForm
            productId={productId}
            productName={name}
            productPrice={discountedPrice}
            initialQuantity={quantity}
            onQuantityChange={setQuantity}
            selectedOptions={selectedOptions}
            productImage={orderImage}
            buttonText={buttonText}
            currency={displayCurrency}
          />
        </div>
      )}
      {/* ------------------------------------- */}
      
      {/* Only show the old button if we are NOT using the internal cart/direct order form */}
      {!showDirectOrderForm && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleButtonClick}
            className="block flex-1 bg-orange-500 text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors text-center"
          >
            {buttonText}
          </button>
        </div>
      )}
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;