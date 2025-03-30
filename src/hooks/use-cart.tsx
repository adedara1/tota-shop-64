
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  options?: Record<string, any>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on init
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }, []);

  // Save cart to localStorage when updated
  const saveCart = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => 
        i.id === item.id && 
        JSON.stringify(i.options) === JSON.stringify(item.options)
      );

      let newItems;
      
      if (existingItem) {
        newItems = prev.map(i => 
          i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...prev, item];
      }
      
      saveCart(newItems);
      return newItems;
    });

    toast({
      title: "Produit ajouté au panier",
      description: `${item.quantity} × ${item.name} ajouté au panier`,
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      saveCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    setItems(prev => {
      const newItems = prev.map(i => 
        i.id === id ? { ...i, quantity } : i
      );
      saveCart(newItems);
      return newItems;
    });
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
