
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize Supabase with required functions and tables for the products page settings
 */
export const initSupabase = async () => {
  try {
    console.log("Initializing Supabase...");
    
    // Check if the products_page_settings table exists
    try {
      const { count, error } = await supabase
        .from('products_page_settings')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // Table likely doesn't exist
        console.log("Creating products_page_settings table via an initial insert...");
        
        // Try to create the table by inserting default data
        // This is a workaround since we can't directly create tables via SQL without admin rights
        const { error: insertError } = await supabase
          .from('products_page_settings')
          .insert({
            background_color: '#f1eee9',
            hero_banner_title: 'Notre Collection',
            hero_banner_description: 'Découvrez nos nouveautés et best-sellers',
            section_titles: {
              new_arrivals: 'Nouveautés',
              best_sellers: 'Meilleures ventes',
              trending: 'Tendances',
              sales: 'Promotions',
              seasonal: 'Collection saisonnière'
            },
            categories: ['Tout', 'Parfums', 'Soins', 'Accessoires', 'Cadeaux'],
            show_search: true,
            show_categories: true,
            show_ratings: true,
            show_filters: false,
            items_per_page: 8
          });
        
        if (insertError) {
          // If we can't insert, the table really doesn't exist or we don't have permissions
          console.error("Error initializing products_page_settings:", insertError);
          return false;
        }
        
        console.log("Created products_page_settings table with default values");
      } else {
        console.log("Products page settings table already exists");
      }
    } catch (err) {
      console.error("Error checking products_page_settings table:", err);
      return false;
    }
    
    // Create/check product stats table
    await ensureProductStatsTable();
    
    console.log("Supabase initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
};

// Helper function to ensure product stats table exists
async function ensureProductStatsTable() {
  try {
    // Check if the product_stats table exists
    const { count, error } = await supabase
      .from('product_stats')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log("Need to create product_stats table");
      
      // Try a simple insert to create the table
      const { error: insertError } = await supabase
        .from('product_stats')
        .insert({
          product_id: '00000000-0000-0000-0000-000000000000',
          view_date: new Date().toISOString().split('T')[0],
          views_count: 0,
          clicks_count: 0
        });
      
      if (insertError) {
        console.error("Error initializing product_stats table:", insertError);
        return false;
      }
      
      console.log("Created product_stats table with default values");
    } else {
      console.log("Product stats table already exists");
    }
    
    return true;
  } catch (err) {
    console.error("Error ensuring product stats table:", err);
    return false;
  }
}

export default initSupabase;
