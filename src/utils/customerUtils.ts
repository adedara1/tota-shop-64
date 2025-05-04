// Keep existing imports

export interface Customer {
  name: string;
  email?: string;
  phone: string;
  address?: string;
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

// Add any other utility functions here
