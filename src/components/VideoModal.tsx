
import React, { useState } from 'react';
import { X, Video } from 'lucide-react';

interface VideoModalProps {
  videoSrc: string;
  videoTitle?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, videoTitle = 'Video' }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-72 md:w-80 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
            <h3 className="text-sm font-medium truncate">{videoTitle}</h3>
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
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
