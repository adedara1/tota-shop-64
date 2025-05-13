
import { useState, useRef, useEffect } from 'react';
import { PictureInPicture2, Play, Pause } from 'lucide-react';
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
  
  // Auto-enable PiP if requested
  useEffect(() => {
    if (pipEnabled && videoRef.current && !isPiPActive) {
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
      
      // We need user interaction before enabling PiP on some browsers
      const handleFirstInteraction = () => {
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              setIsPlaying(true);
              if (pipEnabled) enablePiP();
            })
            .catch(err => console.error("Error playing video:", err));
        }
      };
      
      // Listen for scroll events to enable PiP when user scrolls past the video
      const handleScroll = () => {
        if (!videoRef.current || isPiPActive) return;
        
        const rect = videoRef.current.getBoundingClientRect();
        // If video is out of viewport and is playing, enable PiP
        if ((rect.bottom < 0 || rect.top > window.innerHeight) && isPlaying) {
          enablePiP();
        }
      };
      
      if (autoPlay) {
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleFirstInteraction, { once: true });
      }
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, [pipEnabled, autoPlay, isPiPActive, isPlaying]);
  
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
