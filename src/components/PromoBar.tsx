
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPromoText } from "@/utils/customerUtils";

type PromoBarProps = {
  text?: string;
  productId?: string;
};

const PromoBar = ({ text = "Livraison GRATUITE et Paiement à la livraison !", productId }: PromoBarProps) => {
  const [customText, setCustomText] = useState(text);

  useEffect(() => {
    if (productId) {
      const loadPromoText = async () => {
        const promoText = await fetchPromoText(productId);
        if (promoText) {
          setCustomText(promoText);
        }
      };
      
      loadPromoText();
    }
  }, [productId]);

  return (
    <div className="w-full bg-promo text-white text-center py-2 text-sm">
      {customText}
    </div>
  );
};

export default PromoBar;
