import { Plus, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface CartItemCardProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  currency: string;
  isCurrentProduct: boolean;
  onQuantityChange?: (newQuantity: number) => void;
  options?: Record<string, any>; // Ajout des options
}

const CartItemCard = ({
  id,
  name,
  price,
  quantity,
  image,
  currency,
  isCurrentProduct,
  onQuantityChange,
  options = {}, // Utilisation des options
}: CartItemCardProps) => {
  const { removeFromCart } = useCart();
  const displayCurrency = currency === 'XOF' || currency === 'XAF' ? 'CFA' : currency;
  const totalItemPrice = price * quantity;

  const handleRemove = () => {
    if (isCurrentProduct) {
      // Si c'est le produit actuel, on ne peut pas le retirer, on le met à 0 quantité
      if (onQuantityChange) {
        onQuantityChange(0);
      }
    } else {
      // Si c'est un article du panier, on le retire du panier
      removeFromCart(id);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity > 0 && onQuantityChange) {
      onQuantityChange(newQuantity);
    } else if (newQuantity === 0) {
      handleRemove();
    }
  };
  
  // Filtrer les options pour exclure les données client si elles existent
  const displayOptions = Object.entries(options).filter(([key]) => key !== 'customer');

  return (
    <div className={cn(
      "relative p-4 rounded-lg border-2",
      isCurrentProduct ? "border-black bg-gray-100" : "border-gray-300 bg-white"
    )}>
      {/* Coin supérieur droit: Bouton Retirer */}
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-0 right-0 bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1 hover:bg-red-700 transition-colors z-10"
      >
        Je ne veux pas <X size={12} />
      </button>

      {/* Nom du produit */}
      <span className="text-lg font-bold text-black block mb-3">
        {name}
      </span>

      {/* Ligne d'action: Sélecteur | Prix | Image */}
      <div className="flex items-center justify-between">
        
        {/* Sélecteur de quantité et options */}
        <div className="flex flex-col items-start flex-shrink-0">
          <div className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-md w-fit">
            <button 
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="p-1 hover:bg-purple-700 rounded-full"
            >
              <Minus size={14} />
            </button>
            <span className="mx-3 font-medium">{quantity}</span>
            <button 
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="p-1 hover:bg-purple-700 rounded-full"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {/* Affichage des options sélectionnées */}
          {displayOptions.length > 0 && (
            <div className="text-xs text-gray-600 mt-2 space-y-0.5">
              {displayOptions.map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {typeof value === 'object' ? value.value : value}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prix total de l'article (Positionné au milieu) */}
        <span className="text-xl font-bold text-black mx-4 flex-grow text-right">
          {totalItemPrice} {displayCurrency}
        </span>

        {/* Image du produit - carrée (96x96px) */}
        <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300 bg-white flex items-center justify-center flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              // Utiliser object-contain pour s'assurer que l'image entière est visible
              className="w-full h-full object-contain" 
            />
          ) : (
            <X size={24} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;