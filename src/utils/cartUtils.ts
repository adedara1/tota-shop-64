
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  image?: string;
}

export const addToCart = async (item: CartItem) => {
  try {
    // Get current cart items
    const { data: cartData, error: cartError } = await supabase
      .from('cart_items')
      .select('*');
    
    if (cartError) throw cartError;
    
    // Check if item already exists in cart
    const existingItemIndex = cartData?.findIndex(cartItem => 
      cartItem.product_id === item.productId && 
      JSON.stringify(cartItem.options) === JSON.stringify(item.options)
    );
    
    if (existingItemIndex !== undefined && existingItemIndex >= 0) {
      // Update quantity of existing item
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: cartData[existingItemIndex].quantity + item.quantity 
        })
        .eq('id', cartData[existingItemIndex].id);
      
      if (updateError) throw updateError;
    } else {
      // Add as new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          options: item.options,
          image: item.image
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return false;
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*');
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      productId: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
      image: item.image
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};
