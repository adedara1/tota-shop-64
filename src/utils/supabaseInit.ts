
import { initializeSupabase } from "@/integrations/supabase/client";

// A simple wrapper function to initialize Supabase
export const initSupabase = async (): Promise<boolean> => {
  try {
    console.log("Initialisation de Supabase...");
    const success = await initializeSupabase();
    console.log("Résultat de l'initialisation de Supabase:", success ? "réussie" : "échouée");
    return success;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Supabase:", error);
    return false;
  }
};
