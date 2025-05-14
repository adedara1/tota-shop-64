
import { supabase } from "./client";
import { toast as sonnerToast } from "sonner";

// Helper to check if Supabase is connected
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    // Perform a simple query to check connection
    const { error } = await supabase.from('stores').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
};

// Error handling helper
export const handleSupabaseError = (error: any, toast: any): void => {
  console.error("Supabase Error:", error);
  toast({
    title: "Error",
    description: error?.message || "An unexpected error occurred",
    variant: "destructive"
  });
};

// Store related types
export interface StoreData {
  id?: string;
  name: string;
  products: string[];
  media_url?: string;
  media_type?: string;
  show_media?: boolean;
  description?: string;
  contact?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

// Store related functions
export const createStore = async (storeData: StoreData): Promise<StoreData> => {
  const { data, error } = await supabase
    .from('stores')
    .insert(storeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchStores = async (): Promise<StoreData[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchStoreById = async (id: string): Promise<StoreData | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }

  return data;
};

export const updateStore = async (id: string, storeData: Partial<StoreData>): Promise<StoreData> => {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteStore = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
