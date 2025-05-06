import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const initSupabase = async () => {
  try {
    // Check if the 'products' table exists
    const { data: productsTable, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.error("Error checking 'products' table:", productsError);
      return false;
    }

    // Check if the 'product_stats' table exists
    const { data: productStatsTable, error: productStatsError } = await supabase
      .from('product_stats')
      .select('*')
      .limit(1);

    if (productStatsError) {
      console.warn("The 'product_stats' table does not exist. It's okay if you don't need it.");
    }

    // Check if the 'button_stats' table exists
    const { data: buttonStatsTable, error: buttonStatsError } = await supabase
      .from('button_stats')
      .select('*')
      .limit(1);

    if (buttonStatsError) {
      console.warn("The 'button_stats' table does not exist. It's okay if you don't need it.");
    }

    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    return false;
  }
};

export interface StoreData {
  id: string;
  name: string;
  products: string[];
  address?: string;
  contact?: string;
  description?: string;
  media_url?: string;
  media_type?: "image" | "video";
  show_media?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const createStore = async (storeData: Omit<StoreData, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: storeData.name,
        products: storeData.products,
        media_url: storeData.media_url,
        media_type: storeData.media_type,
        show_media: storeData.show_media
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

export const fetchStores = async (): Promise<StoreData[]> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

export const deleteStore = async (storeId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

export const updateStore = async (storeId: string, storeData: Partial<Omit<StoreData, "id" | "created_at" | "updated_at">>) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: storeData.name,
        products: storeData.products,
        media_url: storeData.media_url,
        media_type: storeData.media_type,
        show_media: storeData.show_media,
        address: storeData.address,
        contact: storeData.contact,
        description: storeData.description
      })
      .eq('id', storeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

export const fetchStoreById = async (storeId: string): Promise<StoreData | null> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (error) {
      console.error('Error fetching store by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    return null;
  }
};
