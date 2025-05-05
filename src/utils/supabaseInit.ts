
import { initializeSupabase } from "@/integrations/supabase/client";

// A simple wrapper function to initialize Supabase
export const initSupabase = async (): Promise<boolean> => {
  return await initializeSupabase();
};
