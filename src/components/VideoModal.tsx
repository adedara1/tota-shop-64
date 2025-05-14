
import React, { useState, useEffect } from 'react';
import { X, Video, Maximize, Minimize } from 'lucide-react';

interface VideoModalProps {
  videoSrc: string;
  videoTitle?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, videoTitle = 'Video' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleFullscreen = () => {
    const iframe = document.querySelector('.video-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (!isFullscreen) {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if ((iframe as any).webkitRequestFullscreen) {
          (iframe as any).webkitRequestFullscreen();
        } else if ((iframe as any).mozRequestFullScreen) {
          (iframe as any).mozRequestFullScreen();
        } else if ((iframe as any).msRequestFullscreen) {
          (iframe as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-72 md:w-80 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
            <button
              onClick={handleFullscreen}
              className="flex items-center text-white hover:text-blue-300 transition-colors"
            >
              <h3 className="text-sm font-medium truncate mr-2">Agrandir la vidéo</h3>
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Fermer la vidéo"
            >
              <X size={18} />
            </button>
          </div>
          <div className="aspect-video bg-black">
            <iframe
              src={videoSrc}
              title={videoTitle}
              className="w-full h-full video-iframe"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
        >
          <Video size={18} />
          <span>Voir la vidéo</span>
        </button>
      )}
    </div>
  );
};

export default VideoModal;
