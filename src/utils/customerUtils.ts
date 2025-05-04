
// Utility functions for customer-related operations
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

// Generate cart label from cart ID
export const generateCartLabel = (cartId: string) => {
  if (!cartId) return "";
  
  return `CA-${cartId.substring(0, 3)}`;
};

// Helper function to save promo text directly to the products table
export const savePromoText = async (productId: string, text: string) => {
  try {
    if (!productId || text === undefined) {
      console.error('Missing productId or text for saving promo text:', { productId, text });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Données manquantes pour la sauvegarde"
      });
      return { error: new Error('Missing productId or text') };
    }
    
    console.log('Attempting to save promo text:', { productId, text });
    
    const { data, error } = await supabase
      .from('products')
      .update({ 
        custom_promo_text: text
      })
      .eq("id", productId);
    
    if (error) {
      console.error('Error saving promo text:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec lors de la sauvegarde des paramètres promotionnels"
      });
      return { error };
    }

    console.log('Promo text saved successfully:', data);
    toast({
      title: "Succès",
      description: "Paramètres promotionnels enregistrés"
    });
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception when saving promo text:', err);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Échec lors de la sauvegarde des paramètres promotionnels"
    });
    return { error: err };
  }
};

// Fonction pour définir la visibilité de la barre promo 
export const setPromoBarVisibility = async (productId: string, visible: boolean) => {
  try {
    if (!productId) {
      console.error('Missing productId for setting promo bar visibility');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Identifiant du produit manquant"
      });
      return { error: new Error('Missing productId') };
    }
    
    console.log('Setting promo bar visibility:', { productId, visible });
    
    const { data, error } = await supabase
      .from('products')
      .update({ 
        hide_promo_bar: !visible
      })
      .eq("id", productId);
    
    if (error) {
      console.error('Error setting promo bar visibility:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec lors de la mise à jour de la visibilité de la barre promotionnelle"
      });
      return { error };
    }

    toast({
      title: "Succès",
      description: `La barre promotionnelle est maintenant ${visible ? 'visible' : 'masquée'}`
    });
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception when setting promo bar visibility:', err);
    return { error: err };
  }
};

// Helper function to fetch all cart items for a specific cart ID
export const fetchAllCartItems = async (cartId: string) => {
  try {
    if (!cartId) {
      console.error('Missing cartId for fetching cart items');
      return { data: [], error: new Error('Missing cartId') };
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('hidden', false);
    
    if (error) {
      console.error('Error fetching cart items:', error);
      return { data: [], error };
    }
    
    // Process the options field for each item
    const processedData = data.map(item => ({
      ...item,
      options: typeof item.options === 'string' 
        ? JSON.parse(item.options) 
        : item.options || {}
    }));
    
    return { data: processedData, error: null };
  } catch (err) {
    console.error('Exception when fetching cart items:', err);
    return { data: [], error: err };
  }
};
