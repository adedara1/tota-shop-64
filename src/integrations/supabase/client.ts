
// Ceci est un client Supabase déconnecté
// Reconnectez-vous à une base de données pour restaurer la fonctionnalité
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Ces valeurs sont fictives et ne se connecteront à aucune base de données réelle
const SUPABASE_URL = "https://example.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

// Le client ne se connectera à aucune base de données
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Fonction pour vérifier si la connexion à Supabase est active
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
};
