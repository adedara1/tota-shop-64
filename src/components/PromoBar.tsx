
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PromoBarProps = {
  text?: string;
  productId?: string;
};

const PromoBar = ({ text = "Livraison GRATUITE et Paiement à la livraison !", productId }: PromoBarProps) => {
  const [customText, setCustomText] = useState(text);

  useEffect(() => {
    if (productId) {
      const fetchPromoSettings = async () => {
        const { data, error } = await supabase
          .from("promo_settings")
          .select("custom_text")
          .eq("product_id", productId)
          .maybeSingle();
        
        if (!error && data) {
          setCustomText(data.custom_text);
        }
      };
      
      fetchPromoSettings();
    }
  }, [productId]);

  return (
    <div className="w-full bg-promo text-white text-center py-2 text-sm">
      {customText}
    </div>
  );
};

export default PromoBar;
