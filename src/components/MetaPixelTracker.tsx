import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMetaPixelConfig } from './AppSettingsForm';

// Déclaration globale pour le Meta Pixel
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const MetaPixelTracker = () => {
  const { data } = useMetaPixelConfig();
  const metaPixelId = data?.metaPixelId;
  const location = useLocation();

  useEffect(() => {
    if (!metaPixelId) {
      console.log("Meta Pixel ID non configuré. Suivi désactivé.");
      return;
    }

    // 1. Charger le script Meta Pixel
    if (!window.fbq) {
      (function(f: Window, b: Document, e: string, v: string, n: string, t: string, s: string) {
        if (f.fbq) return;
        n = f.fbq = function() {
          (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        (t as HTMLScriptElement).src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', 'fbq', '', '');
    }

    // 2. Initialiser le Pixel et suivre la vue de page
    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
    
    console.log(`Meta Pixel initialisé: ${metaPixelId}`);

  }, [metaPixelId]);

  useEffect(() => {
    if (!metaPixelId || !window.fbq) return;

    // 3. Suivre l'événement d'achat sur la page /succes
    if (location.pathname === '/succes') {
      const conversionDataString = localStorage.getItem('meta_conversion_data');
      
      if (conversionDataString) {
        try {
          const conversionData = JSON.parse(conversionDataString);
          
          const purchaseData: Record<string, any> = {
            value: conversionData.value || 0,
            currency: conversionData.currency || 'XOF',
            content_type: 'product',
            // Utiliser les IDs pour content_ids
            content_ids: conversionData.productIds || [],
          };
          
          // Si l'achat provient d'une seule page produit, nous pouvons ajouter l'ID de la source
          if (conversionData.sourceProductId) {
            purchaseData.source_product_id = conversionData.sourceProductId;
          }
          
          // Envoi de l'événement Purchase
          window.fbq('track', 'Purchase', purchaseData);
          console.log("Meta Pixel: Événement 'Purchase' envoyé sur /succes", purchaseData);
          
          // Nettoyer les données après l'envoi
          localStorage.removeItem('meta_conversion_data');
          
        } catch (e) {
          console.error("Erreur lors de l'analyse des données de conversion:", e);
        }
      } else {
        console.log("Meta Pixel: Page /succes atteinte, mais aucune donnée de conversion trouvée.");
      }
    }
    
    // Suivre les vues de page pour les changements de route
    window.fbq('track', 'PageView');
    
  }, [location.pathname, metaPixelId]);

  return null; // Ce composant n'affiche rien
};

export default MetaPixelTracker;