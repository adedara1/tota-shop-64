import { useState } from "react";

const ProductGallery = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const images = [
    "/lovable-uploads/8586c121-4614-4481-aa62-0488d1a65bac.png",
    "/lovable-uploads/8586c121-4614-4481-aa62-0488d1a65bac.png",
    "/lovable-uploads/8586c121-4614-4481-aa62-0488d1a65bac.png",
    "/lovable-uploads/8586c121-4614-4481-aa62-0488d1a65bac.png",
  ];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`w-20 h-20 border-2 ${
              selectedImage === index ? "border-black" : "border-gray-200"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <div className="flex-1">
        <img
          src={images[selectedImage]}
          alt="Main product"
          className="w-full max-w-xl object-cover"
        />
      </div>
    </div>
  );
};

export default ProductGallery;