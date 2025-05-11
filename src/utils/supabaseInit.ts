
import { supabase } from "@/integrations/supabase/client";

// A simple wrapper function to initialize Supabase
export const initSupabase = async (): Promise<boolean> => {
  try {
    console.log("Initialisation de Supabase...");
    // Simple check to see if we can connect to Supabase
    const { data, error } = await supabase.from('whatsapp_redirects').select('count');
    
    if (error) {
      console.error("Erreur lors de l'initialisation de Supabase:", error);
      return false;
    }
    
    console.log("Résultat de l'initialisation de Supabase:", data ? "réussie" : "échouée");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Supabase:", error);
    return false;
  }
};
