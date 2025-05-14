
import { useState, useEffect, useRef } from 'react';
import { X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface FloatingProductVideoProps {
  videoUrl: string;
  autoplay?: boolean;
}

const FloatingProductVideo = ({ videoUrl, autoplay = false }: FloatingProductVideoProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fonction pour fermer la vidéo
  const handleClose = () => {
    setIsVisible(false);
    // Pause la vidéo quand on la ferme
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Fonction pour afficher la vidéo
  const handleShow = () => {
    setIsVisible(true);
    // Lecture automatique quand on réouvre la vidéo
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
    }, 100);
  };

  // Détection de Facebook WebView
  const [isFacebookWebView, setIsFacebookWebView] = useState(false);
  
  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const isFBWebView = 
      userAgent.indexOf('FBAN') > -1 || 
      userAgent.indexOf('FBAV') > -1 || 
      userAgent.indexOf('Instagram') > -1;
    
    setIsFacebookWebView(isFBWebView);
    console.log("Facebook WebView détecté:", isFBWebView);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs shadow-lg" 
         style={{ 
           position: isFacebookWebView ? 'absolute' : 'fixed', 
           maxWidth: '280px'
         }}>
      {isVisible ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <AspectRatio ratio={16/9}>
              <video 
                ref={videoRef} 
                src={videoUrl} 
                controls 
                autoPlay={autoplay}
                className="w-full h-full object-cover"
                controlsList="nodownload"
                playsInline
                muted={autoplay} // Mute pour permettre l'autoplay sur mobile
              />
            </AspectRatio>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClose}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={handleShow}
          variant="outline" 
          className="bg-white/95 shadow-lg flex items-center gap-2"
        >
          <Video size={16} /> Voir la vidéo
        </Button>
      )}
    </div>
  );
};

export default FloatingProductVideo;
