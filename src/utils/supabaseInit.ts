
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "@/integrations/supabase/utils";

// A simple wrapper function to initialize Supabase
export const initSupabase = async (): Promise<boolean> => {
  try {
    console.log("Initialisation de Supabase...");
    // Use the isSupabaseConnected function to check connectivity
    const connected = await isSupabaseConnected();
    
    console.log("Résultat de l'initialisation de Supabase:", connected ? "réussie" : "échouée");
    return connected;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Supabase:", error);
    return false;
  }
};
