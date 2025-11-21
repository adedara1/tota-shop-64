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
        
        {/* Sélecteur de quantité */}
        <div className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-md w-fit flex-shrink-0">
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

        {/* Prix total de l'article (Positionné au milieu) */}
        <span className="text-xl font-bold text-black mx-4 flex-grow text-right">
          {totalItemPrice} {displayCurrency}
        </span>

        {/* Image du produit - carrée (70% de la hauteur du CartItemCard) */}
        <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300 bg-white flex items-center justify-center flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover" 
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