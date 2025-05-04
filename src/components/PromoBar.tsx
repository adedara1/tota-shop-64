
import { useEffect, useState } from "react";

type PromoBarProps = {
  text?: string;
  productId?: string;
};

const PromoBar = ({ text = "Livraison GRATUITE et Paiement à la livraison !", productId }: PromoBarProps) => {
  const [customText, setCustomText] = useState(text);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (productId) {
      const loadPromoText = async () => {
        setLoading(true);
        try {
          console.log("Loading promo info for product:", productId);
          
          // Importer supabase dynamiquement dans l'effet pour éviter des problèmes de SSR
          const { supabase } = await import("@/integrations/supabase/client");
          
          const { data, error } = await supabase
            .from("products")
            .select("custom_promo_text, hide_promo_bar")
            .eq("id", productId)
            .maybeSingle();

          if (error) {
            console.error("Error loading promo info:", error);
            return;
          }
          
          if (data) {
            // Vérification si la barre doit être cachée
            if (data.hide_promo_bar) {
              console.log("Promo bar is hidden for this product");
              setVisible(false);
              return;
            }
            
            // Mise à jour du texte personnalisé si disponible
            if (data.custom_promo_text) {
              console.log("Found custom promo text:", data.custom_promo_text);
              setCustomText(data.custom_promo_text);
            } else {
              console.log("No custom promo text found, using default:", text);
            }
          } else {
            console.log("No promo info found, using default text:", text);
          }
        } catch (error) {
          console.error("Exception when loading promo info:", error);
        } finally {
          setLoading(false);
        }
      };
      
      loadPromoText();
    }
  }, [productId, text]);

  // Ne pas rendre le composant si visible est false
  if (!visible) return null;

  return (
    <div className="w-full bg-promo text-white text-center py-2 text-sm">
      {loading ? "Chargement..." : customText}
    </div>
  );
};

export default PromoBar;
