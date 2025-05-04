
// Utility functions for customer-related operations
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Function to generate a unique customer label
export const generateCustomerLabel = (customer: Customer | null) => {
  if (!customer) return "";
  
  const firstTwoLetters = customer.name.substring(0, 2).toUpperCase();
  const lastThreeDigits = customer.phone.replace(/\D/g, '').slice(-3);
  
  return `${firstTwoLetters}-${lastThreeDigits}`;
};

// Function to generate a consistent color for a customer
export const generateCustomerColor = (label: string) => {
  const colors = [
    "bg-purple-500", "bg-blue-500", "bg-green-500", 
    "bg-yellow-500", "bg-orange-500", "bg-red-500", 
    "bg-pink-500", "bg-indigo-500", "bg-cyan-500"
  ];
  
  // Simple hash function to get a consistent color
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Helper function to save promo text to the database
export const savePromoText = async (productId: string, text: string) => {
  const { error } = await supabase
    .from('promo_settings')
    .upsert({ 
      product_id: productId, 
      custom_text: text
    });
  
  return { error };
};

// Helper function to fetch promo text from the database
export const fetchPromoText = async (productId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('promo_settings')
    .select('custom_text')
    .eq('product_id', productId)
    .maybeSingle();
  
  if (error || !data) {
    return null;
  }
  
  return data.custom_text;
};
