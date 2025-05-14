
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const WhatsAppRedirectPage = () => {
  const { nom } = useParams<{ nom: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectInfo, setRedirectInfo] = useState<{
    id: string;
    name: string;
    redirect_url: string;
  } | null>(null);
  const [isFacebookWebView] = useState(() => /FBAN|FBAV/.test(navigator.userAgent));
  
  useEffect(() => {
    const fetchRedirectInfo = async () => {
      try {
        setLoading(true);
        console.log("Recherche de redirection pour:", nom);
        
        if (!nom || nom.trim() === '') {
          throw new Error("Identifiant de redirection manquant");
        }
        
        // Essayer d'abord de récupérer par url_name ou id
        let query = supabase.from('whatsapp_redirects').select('*');
        
        // Vérifier si le paramètre ressemble à un UUID
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidPattern.test(nom)) {
          console.log("Recherche par ID:", nom);
          query = query.eq('id', nom);
        } else {
          console.log("Recherche par url_name:", nom);
          query = query.eq('url_name', nom);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          console.error("Erreur Supabase:", error);
          throw error;
        }
        
        if (!data) {
          console.error("Redirection non trouvée pour:", nom);
          throw new Error('Redirection non trouvée');
        }
        
        console.log("Redirection trouvée:", data);
        
        if (!data.is_active) {
          console.log("Redirection inactive:", data);
          throw new Error('Cette redirection a été désactivée');
        }
        
        // Enregistrer la visite dans les statistiques générales
        if (data.id) {
          try {
            await supabase.rpc('increment_whatsapp_visit', {
              whatsapp_id_param: data.id,
              redirect_name_param: data.name,
              url_name_param: data.url_name || ''
            });
            console.log("Visite enregistrée pour:", data.name);
          } catch (statsError) {
            console.error("Erreur lors de l'enregistrement de la visite:", statsError);
            // Ne pas interrompre le processus de redirection si l'enregistrement échoue
          }
        }

        // Enregistrer les détails de visite avec les informations sur Facebook WebView
        try {
          const visitData = {
            whatsapp_redirect_id: data.id,
            is_facebook_webview: isFacebookWebView,
            user_agent: navigator.userAgent || ''
          };
          
          const { error: detailError } = await supabase
            .from('whatsapp_detailed_visits')
            .insert(visitData);
            
          if (detailError) {
            console.error("Erreur lors de l'enregistrement des détails de la visite:", detailError);
          }
        } catch (detailError) {
          console.error("Erreur lors de l'enregistrement des détails de la visite:", detailError);
        }
        
        // Définir les informations de redirection
        setRedirectInfo({
          id: data.id,
          name: data.name,
          redirect_url: data.redirect_url
        });
        
      } catch (error: any) {
        console.error('Erreur lors de la récupération de la redirection:', error);
        setError(error.message || 'Une erreur est survenue');
        // Afficher une notification toast pour les erreurs
        toast.error(error.message || 'Une erreur est survenue lors de la redirection');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRedirectInfo();
  }, [nom, isFacebookWebView]);
  
  // Fonction pour gérer la redirection vers WhatsApp
  const handleRedirect = () => {
    if (!redirectInfo?.redirect_url) return;
    
    console.log("Redirection vers:", redirectInfo.redirect_url);
    const url = redirectInfo.redirect_url;
    
    // Déterminer si nous sommes sur iOS, Android ou Web
    const userAgent = navigator.userAgent || navigator.vendor;
    
    // Pour Android, utiliser directement l'URL d'intention
    if (/android/i.test(userAgent)) {
      window.location.href = url;
    }
    // Pour iOS, essayer d'ouvrir WhatsApp avec un lien universel
    else if (/iPad|iPhone|iPod/.test(userAgent)) {
      // Essayer d'extraire le numéro de téléphone si c'est une URL d'intention
      let phoneNumber = '';
      const phoneMatch = url.match(/phone=(\d+)/);
      if (phoneMatch && phoneMatch[1]) {
        phoneNumber = phoneMatch[1];
        window.location.href = `whatsapp://send?phone=${phoneNumber}`;
      } else {
        // Si on ne peut pas extraire le numéro, essayer d'ouvrir directement WhatsApp
        window.location.href = 'whatsapp://';
      }
    }
    // Pour le Web ou autres plateformes, essayer d'ouvrir avec web.whatsapp.com
    else {
      // Essayer d'extraire le numéro de téléphone si c'est une URL d'intention
      let phoneNumber = '';
      let message = '';
      
      const phoneMatch = url.match(/phone=(\d+)/);
      if (phoneMatch && phoneMatch[1]) {
        phoneNumber = phoneMatch[1];
      }
      
      const textMatch = url.match(/text=([^&|#]+)/);
      if (textMatch && textMatch[1]) {
        message = decodeURIComponent(textMatch[1]);
      }
      
      // Construire l'URL pour web.whatsapp.com
      if (phoneNumber) {
        window.location.href = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message || '')}`;
      } else {
        window.location.href = 'https://web.whatsapp.com/';
      }
    }
  };
  
  // Message spécial pour Facebook WebView
  if (isFacebookWebView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Facebook WebView détecté</h1>
          <p className="text-gray-700 mb-6">
            Pour une meilleure expérience, veuillez ouvrir ce lien dans votre navigateur web.
          </p>
          <div className="mb-4">
            <Button 
              onClick={() => window.open(window.location.href, '_system')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 w-full"
            >
              Ouvrir dans mon navigateur
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <a 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-gray-700">Chargement en cours...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          {redirectInfo?.name || "Redirection WhatsApp"}
        </h1>
        
        <p className="text-gray-700 mb-6">
          Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp
        </p>
        
        <Button
          onClick={handleRedirect}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 w-full"
        >
          Ouvrir dans WhatsApp
        </Button>
        
        <div className="mt-6">
          <a 
            href="/"
            className="text-blue-600 hover:underline"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppRedirectPage;
