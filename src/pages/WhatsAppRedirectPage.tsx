
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const WhatsAppRedirectPage = () => {
  const { nom } = useParams<{ nom: string }>();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRedirectInfo = async () => {
      try {
        // Essayer d'abord de récupérer par url_name
        let query = supabase
          .from('whatsapp_redirects')
          .select('*');
          
        if (nom) {
          // Vérifier si le paramètre ressemble à un UUID (ancienne URL)
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (uuidPattern.test(nom)) {
            query = query.eq('id', nom);
          } else {
            query = query.eq('url_name', nom);
          }
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          throw new Error('Redirection non trouvée');
        }
        
        if (!data.is_active) {
          throw new Error('Cette redirection a été désactivée');
        }
        
        // Définir l'URL de redirection et le compte à rebours directement en secondes
        setRedirectUrl(data.redirect_url);
        setCountdown(data.wait_minutes);
      } catch (error: any) {
        console.error('Erreur:', error);
        setError(error.message || 'Une erreur est survenue');
      }
    };
    
    fetchRedirectInfo();
  }, [nom]);
  
  useEffect(() => {
    // Gérer le compte à rebours si défini
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (countdown === 0 && redirectUrl) {
      // Rediriger vers WhatsApp quand le compte à rebours atteint zéro
      performRedirect(redirectUrl);
    }
  }, [countdown, redirectUrl]);
  
  // Fonction pour gérer la redirection vers WhatsApp
  const performRedirect = (url: string) => {
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
  
  // Formater le temps restant (en secondes)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
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
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Redirection WhatsApp</h1>
        
        {countdown !== null && countdown > 0 ? (
          <>
            <p className="text-gray-700 mb-2">
              Vous serez redirigé vers WhatsApp dans:
            </p>
            <div className="text-3xl font-bold text-blue-600 mb-6">
              {formatTime(countdown)}
            </div>
            <button
              onClick={() => setCountdown(0)}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
            >
              Rediriger maintenant
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-gray-700">Redirection en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppRedirectPage;
