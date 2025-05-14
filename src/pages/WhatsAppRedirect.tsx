
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const WhatsAppRedirect = () => {
  const [countdown, setCountdown] = useState(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Détection du WebView Facebook
  const isFacebookWebView = /FBAN|FBAV|Instagram/.test(navigator.userAgent);
  
  useEffect(() => {
    const fetchWhatsAppData = async () => {
      try {
        // Récupération du paramètre ID depuis l'URL
        const urlParts = window.location.pathname.split('/');
        const whatsappIdFromUrl = urlParts[urlParts.length - 1];
        
        const { data, error } = await supabase
          .from('whatsapp_redirects')
          .select('*')
          .eq('id', whatsappIdFromUrl)
          .maybeSingle();

        if (error) {
          console.error('Erreur lors de la récupération des données:', error);
          throw error;
        }

        if (data) {
          setRedirectUrl(data.url);
          setName(data.name);
          
          // Incrémenter le compteur de visites
          const { error: statsError } = await supabase.rpc('increment_whatsapp_visit', {
            whatsapp_id_param: data.id,
            redirect_name_param: data.name,
            url_name_param: data.url
          });

          if (statsError) {
            console.error('Erreur lors de l\'incrémentation des statistiques:', statsError);
          }
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la redirection',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    fetchWhatsAppData();
  }, [navigate]);

  // Fonction de redirection
  const performRedirect = (url: string) => {
    // Vérifier si l'URL commence par http:// ou https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    console.log(`Redirection vers: ${url}`);
    window.location.href = url;
  };

  // Compte à rebours pour la redirection automatique (uniquement hors Facebook WebView)
  useEffect(() => {
    if (!isFacebookWebView && redirectUrl) {
      const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
      
      if (countdown === 0) {
        performRedirect(redirectUrl);
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [countdown, redirectUrl, isFacebookWebView]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-6">
            <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-16 h-16" onError={(e) => {
              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
            }} />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Redirection WhatsApp</h1>
          
          {name && <p className="text-gray-600 mb-4">Vous allez être redirigé vers {name}</p>}
          
          {isFacebookWebView ? (
            <>
              <p className="text-gray-700 mb-6">
                Pour continuer vers WhatsApp, veuillez cliquer sur le bouton ci-dessous
              </p>
              <button
                onClick={() => redirectUrl && performRedirect(redirectUrl)}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Ouvrir WhatsApp maintenant
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Vous utilisez Facebook ou Instagram Browser. Une action manuelle est nécessaire.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-700">
                Redirection automatique dans <span className="font-bold">{countdown}</span> secondes...
              </p>
              <button
                onClick={() => redirectUrl && performRedirect(redirectUrl)}
                className="mt-6 w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Continuer immédiatement
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppRedirect;
