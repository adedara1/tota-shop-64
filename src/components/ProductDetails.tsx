interface ProductDetailsProps {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  cartUrl: string;
}

const ProductDetails = ({
  name,
  originalPrice,
  discountedPrice,
  description,
  cartUrl,
}: ProductDetailsProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-medium">{name}</h1>
      
      <div className="flex items-center gap-4">
        <span className="text-gray-400 line-through text-2xl">CFA{originalPrice}</span>
        <span className="text-3xl font-bold">CFA{discountedPrice}</span>
      </div>
      
      <a 
        href={cartUrl}
        className="block w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors text-center"
      >
        Ajouter au panier
      </a>
      
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <span>🌡️</span>
          <p className="font-medium">
            Dites adieu aux journées étouffantes ! 🔥
          </p>
        </div>
        
        <div className="mt-6 text-gray-600 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;