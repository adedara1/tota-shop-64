import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductGalleryProps {
  images: string[];
  optionImages?: string[];
}

const ProductGallery = ({ images, optionImages = [] }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const allImages = [...images];
  const isMobile = useIsMobile();

  // Reset active index when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const nextSlide = () => {
    setActiveIndex(current => current === allImages.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setActiveIndex(current => current === 0 ? allImages.length - 1 : current - 1);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return <div className="relative h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
      <p className="text-gray-500">Aucune image disponible</p>
    </div>;
  }

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="relative flex flex-row gap-4">
        {/* Thumbnails on the left side for desktop */}
        {allImages.length > 1 && (
          <div className="flex flex-col gap-2 w-[100px] max-h-[500px] overflow-y-auto">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-[80px] w-[80px] flex-shrink-0 rounded-md overflow-hidden border-2 ${
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
        
        {/* Main image display */}
        <div className="relative h-[500px] flex-grow rounded-lg overflow-hidden">
          <img 
            src={allImages[activeIndex]} 
            alt={`Product image ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {allImages.length > 1 && (
            <>
              <button 
                onClick={prevSlide} 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md z-10" 
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextSlide} 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md z-10" 
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          
          {/* Price overlay at the bottom of the image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
            <div className="text-[#ff40c7] text-4xl font-bold">
              PRIX: 15.500 F
            </div>
          </div>
          
          {/* Info box overlay in the middle of the image */}
          <div className="absolute top-1/3 left-0 right-0 mx-auto w-max px-6 py-2 bg-[#8bff8b]/80 rounded-full border-2 border-[#1a9639] text-center">
            <p className="text-black text-lg font-semibold">
              Retrouvez votre <span className="text-[#ff1493]">moto</span> ou <span className="text-[#ff1493]">voiture</span> en cas de tentative de vol.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout - keeping the existing mobile layout
  return (
    <div className="relative flex flex-col gap-4">
      {/* Main image */}
      <div className="relative h-auto overflow-hidden rounded-lg flex-grow">
        <img 
          src={allImages[activeIndex]} 
          alt={`Product image ${activeIndex + 1}`}
          className="w-full max-w-xl"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "auto",
            alignSelf: "flex-start"
          }} 
        />
        
        {allImages.length > 1 && (
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
        
        {/* Price overlay for mobile */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-center">
          <div className="text-[#ff40c7] text-3xl font-bold">
            PRIX: 15.500 F
          </div>
        </div>
      </div>
      
      {/* Thumbnails for mobile - horizontal scroll */}
      {allImages.length > 1 && (
        <div className="flex flex-row overflow-x-auto gap-2 max-w-full">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
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
