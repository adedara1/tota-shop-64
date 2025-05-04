
import { useEffect, useState } from "react";
import { fetchPromoText } from "@/utils/customerUtils";

type PromoBarProps = {
  text?: string;
  productId?: string;
};

const PromoBar = ({ text = "Livraison GRATUITE et Paiement à la livraison !", productId }: PromoBarProps) => {
  const [customText, setCustomText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      const loadPromoText = async () => {
        setLoading(true);
        try {
          console.log("Loading promo text for product:", productId);
          const promoText = await fetchPromoText(productId);
          if (promoText) {
            console.log("Found custom promo text:", promoText);
            setCustomText(promoText);
          } else {
            console.log("No custom promo text found, using default:", text);
          }
        } catch (error) {
          console.error("Error loading promo text:", error);
        } finally {
          setLoading(false);
        }
      };
      
      loadPromoText();
    }
  }, [productId, text]);

  return (
    <div className="w-full bg-promo text-white text-center py-2 text-sm">
      {loading ? "Chargement..." : customText}
    </div>
  );
};

export default PromoBar;
