
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const nextSlide = () => {
    setActiveIndex(current => current === images.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setActiveIndex(current => current === 0 ? images.length - 1 : current - 1);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return <div className="relative h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
      <p className="text-gray-500">Aucune image disponible</p>
    </div>;
  }

  return (
    <div className="relative">
      <div className="relative h-[500px] overflow-hidden rounded-lg">
        <img 
          src={images[activeIndex]} 
          alt={`Product image ${activeIndex + 1}`} 
          className="w-full max-w-xl object-cover" 
          style={{
            objectFit: "contain",
            height: "100%",
            width: "100%"
          }} 
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevSlide} 
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md" 
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextSlide} 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md" 
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-16 w-16 rounded-md overflow-hidden border-2 ${
                index === activeIndex ? 'border-black' : 'border-transparent'
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
