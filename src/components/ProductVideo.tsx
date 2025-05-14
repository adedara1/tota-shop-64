
import { useState, useEffect, useRef } from 'react';
import { X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductVideoProps {
  videoUrl: string;
  enablePip?: boolean;
  autoplay?: boolean;
}

const ProductVideo = ({ videoUrl, enablePip = false, autoplay = false }: ProductVideoProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize PIP if enabled
  useEffect(() => {
    if (videoRef.current && enablePip) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry.isIntersecting && isVisible && videoRef.current) {
            try {
              const videoElement = videoRef.current;
              if (document.pictureInPictureElement !== videoElement && 
                  videoElement.readyState >= 2 && // Has enough data to play
                  !document.pictureInPictureElement) {
                videoElement.requestPictureInPicture().catch(err => {
                  // If PIP fails, we don't want to break the app
                  console.error("PiP error:", err);
                });
              }
            } catch (err) {
              console.error("PiP not supported:", err);
            }
          }
        },
        { threshold: 0.1 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
        
        // Exit PiP when component unmounts
        if (document.pictureInPictureElement === videoRef.current) {
          document.exitPictureInPicture().catch(err => {
            console.error("Error exiting PiP:", err);
          });
        }
      };
    }
  }, [enablePip, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Exit PiP if active
    if (document.pictureInPictureElement === videoRef.current) {
      document.exitPictureInPicture().catch(err => {
        console.error("Error exiting PiP:", err);
      });
    }
    
    // Pause the video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleShow = () => {
    setIsVisible(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs" ref={containerRef}>
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

export default ProductVideo;
