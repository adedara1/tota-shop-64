// Keep existing imports

export interface Customer {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  call_time?: string; // Ajout de call_time
}

// Generate a consistent color for a customer based on their name
export const generateCustomerColor = (label: string): string => {
  // Simple hash function to generate a consistent color
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to a hue value (0-360)
  const hue = hash % 360;
  
  // Use a fixed saturation and lightness for better readability
  return `hsl(${hue}, 70%, 40%)`;
};

// Generate a label for a customer
export const generateCustomerLabel = (customer: Customer): string => {
  if (!customer) return "Unknown";
  
  // Use initials from name
  const nameParts = customer.name.split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  
  // If only one name, use first two letters
  return customer.name.substring(0, 2).toUpperCase();
};

// Generate a label for a cart
export const generateCartLabel = (cartId: string, customer?: Customer | null): string => {
  if (customer) {
    return generateCustomerLabel(customer);
  }
  
  // If no customer, use part of the cart ID
  return `C-${cartId.substring(0, 4)}`;
};

// Fetch all cart items for a cart
export const fetchAllCartItems = async (cartId: string) => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId)
      .eq("hidden", false);

    if (error) {
      console.error("Error fetching cart items:", error);
      return { data: [], error };
    }

    // Process any options that are stored as strings
    const processedData = data.map(item => ({
      ...item,
      options: typeof item.options === 'string' 
        ? JSON.parse(item.options) 
        : item.options || {}
    }));

    return { data: processedData, error: null };
  } catch (error) {
    console.error("Exception when fetching cart items:", error);
    return { data: [], error };
  }
};

// Check if a cart is shared (contains products from different product_id)
export const isSharedCart = async (cartId: string, productId: string) => {
  try {
    const { data, error } = await fetchAllCartItems(cartId);
    if (error || !data) {
      return false;
    }
    
    // Check if there are products with different product_id
    return data.some(item => item.product_id !== productId);
  } catch (error) {
    console.error("Error checking if cart is shared:", error);
    return false;
  }
};

// Update the is_shared_cart status for cart items
export const updateSharedCartStatus = async (cartId: string) => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Fetch all items in the cart
    const { data, error } = await fetchAllCartItems(cartId);
    
    if (error || !data || data.length === 0) {
      return { success: false };
    }
    
    // Check if cart has items with different product IDs
    const productIds = new Set(data.map(item => item.product_id));
    const isShared = productIds.size > 1;
    
    // Update all items in the cart with the shared status
    if (data.length > 0) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ is_shared_cart: isShared })
        .eq("cart_id", cartId);
      
      if (updateError) {
        console.error("Error updating shared cart status:", updateError);
        return { success: false };
      }
    }
    
    return { success: true, isShared };
  } catch (error) {
    console.error("Error updating shared cart status:", error);
    return { success: false };
  }
};

// Add any other utility functions here