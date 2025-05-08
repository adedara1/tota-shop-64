
import React, { useState, useEffect } from "react";

interface ProductGalleryProps {
  images: string[];
  optionImages?: string[];
}

const ProductGallery = ({ images, optionImages = [] }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Utiliser un Set pour éliminer les doublons entre images produit et images d'options
  const uniqueImages = [...new Set([...images, ...optionImages])];

  // Définir l'image active au chargement ou quand les images changent
  useEffect(() => {
    if (uniqueImages.length > 0) {
      setActiveImage(uniqueImages[0]);
    } else {
      setActiveImage(null);
    }
  }, [images, optionImages]);

  return (
    <div className="md:order-1 order-1">
      {/* Main large image */}
      <div className="mb-4 rounded-lg overflow-hidden bg-white border border-gray-200">
        {activeImage ? (
          <img
            src={activeImage}
            alt="Product"
            className="w-full h-auto object-cover aspect-square"
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Aucune image</p>
          </div>
        )}
      </div>

      {/* Thumbnail gallery */}
      {uniqueImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {uniqueImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`cursor-pointer rounded-md overflow-hidden border ${
                activeImage === image 
                  ? "border-blue-500 ring-2 ring-blue-300" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActiveImage(image)}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
