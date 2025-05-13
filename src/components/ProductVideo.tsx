
import { useState, useRef, useEffect } from 'react';
import { PictureInPicture2, Play, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductVideoProps {
  videoUrl: string;
  pipEnabled?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const ProductVideo = ({
  videoUrl,
  pipEnabled = false,
  autoPlay = false,
  className
}: ProductVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  
  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle Picture in Picture mode
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement === videoRef.current) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (error) {
      console.error("Picture-in-Picture failed:", error);
    }
  };

  // Toggle video visibility
  const toggleVideoVisibility = () => {
    setIsVideoVisible(!isVideoVisible);
    
    // Si on ferme la vidéo et qu'elle est en PiP, on quitte le mode PiP
    if (isVideoVisible && isPiPActive && videoRef.current && document.pictureInPictureElement === videoRef.current) {
      document.exitPictureInPicture().catch(err => console.error("Error exiting PiP:", err));
      setIsPiPActive(false);
    }

    // Si on rouvre la vidéo et qu'elle doit jouer, on la lance
    if (!isVideoVisible && autoPlay && videoRef.current) {
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
      setIsPlaying(true);
    }
  };
  
  // Auto-enable PiP if requested - s'active automatiquement à l'atterrissage
  useEffect(() => {
    if (pipEnabled && videoRef.current && !isPiPActive && isVideoVisible) {
      const enablePiP = async () => {
        try {
          // Only request PiP if video has started playing
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await videoRef.current.requestPictureInPicture();
            setIsPiPActive(true);
          }
        } catch (error) {
          console.error("Could not enter Picture-in-Picture mode:", error);
        }
      };

      // Activer PiP automatiquement après le chargement de la vidéo
      const handleVideoReady = () => {
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              setIsPlaying(true);
              enablePiP();
            })
            .catch(err => console.error("Error playing video:", err));
        }
      };
      
      if (videoRef.current.readyState >= 2) {
        handleVideoReady();
      } else {
        videoRef.current.addEventListener('loadeddata', handleVideoReady, { once: true });
      }
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleVideoReady);
        }
      };
    }
  }, [pipEnabled, videoRef.current, isVideoVisible]);
  
  // Handle PiP events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onEnterPiP = () => setIsPiPActive(true);
    const onExitPiP = () => setIsPiPActive(false);
    
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onExitPiP);
    
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onExitPiP);
    };
  }, []);

  // Si la vidéo est masquée, afficher uniquement le bouton pour la réouvrir
  if (!isVideoVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={toggleVideoVisibility}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full bg-opacity-70 hover:bg-opacity-90 transition-all shadow-lg"
        >
          <Play size={16} /> Voir la vidéo
        </button>
      </div>
    );
  }
  
  return (
    <div className={cn("relative w-full rounded-md overflow-hidden", className)}>
      <video 
        ref={videoRef}
        src={videoUrl}
        controls={false}
        muted
        autoPlay={autoPlay}
        playsInline
        className="w-full h-auto"
        loop
      />
      
      <div className="absolute top-2 right-2">
        <button
          onClick={toggleVideoVisibility}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
          aria-label="Fermer la vidéo"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={togglePlay}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        {pipEnabled && (
          <button
            onClick={togglePictureInPicture}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Picture in Picture"
          >
            <PictureInPicture2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductVideo;
