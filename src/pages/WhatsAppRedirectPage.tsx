
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface RedirectData {
  id: string;
  name: string;
  redirect_url: string;
  url_name: string;
  is_active: boolean;
  wait_minutes: number;
  redirect_code: string;
  created_at: string;
  updated_at: string;
}

const WhatsAppRedirectPage = () => {
  const [countdown, setCountdown] = useState<number>(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const { nom } = useParams<{ nom?: string }>();
  const [isFacebookWebView, setIsFacebookWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Détection du WebView Facebook/Instagram
  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const isFBWebView = 
      userAgent.indexOf('FBAN') > -1 || 
      userAgent.indexOf('FBAV') > -1 || 
      userAgent.indexOf('Instagram') > -1;
    
    setIsFacebookWebView(isFBWebView);
    console.log("Facebook WebView détecté:", isFBWebView);
  }, []);

  // Fonction pour effectuer la redirection
  const performRedirect = (url: string) => {
    window.location.href = url;
  };

  // Chercher l'URL de redirection
  useEffect(() => {
    const fetchRedirectUrl = async () => {
      if (!nom) return;
      
      try {
        const { data, error } = await supabase
          .from('whatsapp_redirects') // Correction: utiliser la table qui existe réellement
          .select('*')
          .eq('url_name', nom)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          setRedirectUrl(data.redirect_url);
        } else {
          toast.error('Aucune redirection trouvée pour ce nom.');
        }
      } catch (error) {
        console.error('Error fetching redirect:', error);
        toast.error('Une erreur est survenue.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedirectUrl();
  }, [nom]);

  // Compte à rebours et redirection automatique (uniquement hors WebView Facebook)
  useEffect(() => {
    if (isLoading || !redirectUrl || isFacebookWebView) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          performRedirect(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl, isLoading, isFacebookWebView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <img src="/placeholder.svg" alt="WhatsApp" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-center mb-3">Redirection WhatsApp</h1>
            
            {isLoading ? (
              <p className="text-center text-gray-500">Chargement...</p>
            ) : (
              <>
                {redirectUrl ? (
                  <div className="space-y-4 w-full">
                    <p className="text-center text-gray-600">
                      {!isFacebookWebView && `Redirection automatique dans ${countdown} secondes...`}
                    </p>
                    
                    {/* Affichage différent pour Facebook WebView */}
                    {isFacebookWebView ? (
                      <div className="space-y-4 text-center">
                        <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
                          Vous utilisez le navigateur Facebook ou Instagram. 
                          Veuillez cliquer sur le bouton ci-dessous pour ouvrir WhatsApp.
                        </p>
                        <Button 
                          onClick={() => performRedirect(redirectUrl)}
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                        >
                          Ouvrir WhatsApp maintenant
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <p className="text-sm text-gray-500">
                          Si la redirection ne fonctionne pas automatiquement :
                        </p>
                        <Button 
                          onClick={() => performRedirect(redirectUrl)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Ouvrir WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">Aucune redirection n'est configurée pour "{nom}".</p>
                    <Link to="/" className="text-green-600 hover:underline">
                      Retour à l'accueil
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppRedirectPage;
