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
    <div className="space-y-6 max-w-full">
      <h1 className="text-5xl font-medium break-words">{name}</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-gray-400 line-through text-2xl">{originalPrice}</span>
          <span className="text-gray-400 line-through text-2xl ml-1">CFA</span>
        </div>
        <div className="flex items-center">
          <span className="text-3xl">{discountedPrice}</span>
          <span className="text-3xl ml-1">CFA</span>
        </div>
      </div>
      
      <a 
        href={cartUrl}
        className="block w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors text-center"
      >
        Ajouter au panier
      </a>
      
      <div className="space-y-4 pt-6">
        <div className="mt-6 text-gray-600 prose max-w-full overflow-hidden break-words">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;