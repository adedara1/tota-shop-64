import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductDetailsProps {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  cartUrl: string;
  buttonText: string;
  currency: string;
}

const ProductDetails = ({
  name,
  originalPrice,
  discountedPrice,
  description,
  cartUrl,
  buttonText,
  currency,
}: ProductDetailsProps) => {
  const [isIframeOpen, setIsIframeOpen] = useState(false);
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;

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
      
      <button 
        onClick={() => setIsIframeOpen(true)}
        className="block w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors text-center"
      >
        {buttonText}
      </button>

      <Dialog open={isIframeOpen} onOpenChange={setIsIframeOpen}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[80vh]">
          <iframe
            src={cartUrl}
            className="w-full h-full border-none"
            title="Cart"
          />
        </DialogContent>
      </Dialog>
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;