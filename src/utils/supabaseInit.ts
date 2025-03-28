
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize Supabase with required functions and tables for the products page settings
 */
export const initSupabase = async () => {
  try {
    console.log("Initializing Supabase...");
    
    // Check if the products_page_settings table exists, if not create it
    const { data, error } = await supabase
      .from('products_page_settings')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, so create it
      console.log("Creating products_page_settings table...");
      
      // Create the table using direct SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.products_page_settings (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            background_color text NOT NULL DEFAULT '#f1eee9',
            hero_banner_image text,
            hero_banner_title text,
            hero_banner_description text,
            section_titles jsonb NOT NULL DEFAULT '{"new_arrivals":"Nouveautés","best_sellers":"Meilleures ventes","trending":"Tendances","sales":"Promotions","seasonal":"Collection saisonnière"}'::jsonb,
            categories text[] NOT NULL DEFAULT '{"Tout","Parfums","Soins","Accessoires","Cadeaux"}'::text[],
            show_search boolean NOT NULL DEFAULT true,
            show_categories boolean NOT NULL DEFAULT true,
            show_ratings boolean NOT NULL DEFAULT true,
            show_filters boolean NOT NULL DEFAULT false,
            items_per_page integer NOT NULL DEFAULT 8,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
          );
          
          -- Set up RLS
          ALTER TABLE public.products_page_settings ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Enable read access for all users" ON public.products_page_settings
            FOR SELECT USING (true);
            
          CREATE POLICY "Enable insert for authenticated users only" ON public.products_page_settings
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
          CREATE POLICY "Enable update for authenticated users only" ON public.products_page_settings
            FOR UPDATE USING (auth.role() = 'authenticated');
        `
      });
      
      if (createError) {
        // If exec_sql function doesn't exist yet, we need to create it first
        if (createError.message.includes('does not exist')) {
          console.log("Creating exec_sql function...");
          
          // Create the exec_sql function directly using REST API
          const res = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              query: `
                CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
                RETURNS void
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                BEGIN
                  EXECUTE sql_query;
                END;
                $$;
                
                ALTER FUNCTION public.exec_sql(text) OWNER TO postgres;
              `
            })
          });
          
          if (!res.ok) {
            console.error("Failed to create exec_sql function:", await res.text());
          } else {
            console.log("Created exec_sql function");
            
            // Try creating the table again
            const { error: retryError } = await supabase.rpc('exec_sql', {
              sql_query: `
                CREATE TABLE IF NOT EXISTS public.products_page_settings (
                  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                  background_color text NOT NULL DEFAULT '#f1eee9',
                  hero_banner_image text,
                  hero_banner_title text,
                  hero_banner_description text,
                  section_titles jsonb NOT NULL DEFAULT '{"new_arrivals":"Nouveautés","best_sellers":"Meilleures ventes","trending":"Tendances","sales":"Promotions","seasonal":"Collection saisonnière"}'::jsonb,
                  categories text[] NOT NULL DEFAULT '{"Tout","Parfums","Soins","Accessoires","Cadeaux"}'::text[],
                  show_search boolean NOT NULL DEFAULT true,
                  show_categories boolean NOT NULL DEFAULT true,
                  show_ratings boolean NOT NULL DEFAULT true,
                  show_filters boolean NOT NULL DEFAULT false,
                  items_per_page integer NOT NULL DEFAULT 8,
                  created_at timestamp with time zone NOT NULL DEFAULT now(),
                  updated_at timestamp with time zone NOT NULL DEFAULT now()
                );
                
                -- Set up RLS
                ALTER TABLE public.products_page_settings ENABLE ROW LEVEL SECURITY;
                
                -- Create policies
                CREATE POLICY "Enable read access for all users" ON public.products_page_settings
                  FOR SELECT USING (true);
                  
                CREATE POLICY "Enable insert for authenticated users only" ON public.products_page_settings
                  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
                  
                CREATE POLICY "Enable update for authenticated users only" ON public.products_page_settings
                  FOR UPDATE USING (auth.role() = 'authenticated');
              `
            });
            
            if (retryError) {
              console.error("Failed to create table on retry:", retryError);
              return false;
            }
          }
        } else {
          console.error("Error creating table:", createError);
          return false;
        }
      } else {
        console.log("Created products_page_settings table");
      }
    } else if (error) {
      console.error("Error checking for table:", error);
      return false;
    } else {
      console.log("Products page settings table already exists");
    }
    
    // Create functions for incrementing product stats if they don't exist
    await ensureProductStatsFunction();
    
    console.log("Supabase initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
};

// Helper function to ensure product stats functions exist
async function ensureProductStatsFunction() {
  try {
    // Check if the function exists by trying to call it with invalid params
    const { error } = await supabase.rpc('increment_product_view', {
      product_id_param: '00000000-0000-0000-0000-000000000000'
    });
    
    // If function doesn't exist, create it
    if (error && error.message.includes('does not exist')) {
      console.log("Creating product stats functions...");
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Function to increment product views
          CREATE OR REPLACE FUNCTION public.increment_product_view(product_id_param UUID, view_date_param DATE DEFAULT CURRENT_DATE)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            stats_record_id UUID;
          BEGIN
            -- Check if record exists for this product and date
            SELECT id INTO stats_record_id 
            FROM public.product_stats 
            WHERE product_id = product_id_param AND view_date = view_date_param;
            
            IF stats_record_id IS NULL THEN
              -- Create new record
              INSERT INTO public.product_stats (product_id, view_date, views_count, clicks_count)
              VALUES (product_id_param, view_date_param, 1, 0);
            ELSE
              -- Update existing record
              UPDATE public.product_stats
              SET views_count = views_count + 1,
                  updated_at = NOW()
              WHERE id = stats_record_id;
            END IF;
          END;
          $$;
          
          -- Function to increment product clicks
          CREATE OR REPLACE FUNCTION public.increment_product_click(product_id_param UUID, click_date_param DATE DEFAULT CURRENT_DATE)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            stats_record_id UUID;
          BEGIN
            -- Check if record exists for this product and date
            SELECT id INTO stats_record_id 
            FROM public.product_stats 
            WHERE product_id = product_id_param AND view_date = click_date_param;
            
            IF stats_record_id IS NULL THEN
              -- Create new record
              INSERT INTO public.product_stats (product_id, view_date, views_count, clicks_count)
              VALUES (product_id_param, click_date_param, 0, 1);
            ELSE
              -- Update existing record
              UPDATE public.product_stats
              SET clicks_count = clicks_count + 1,
                  updated_at = NOW()
              WHERE id = stats_record_id;
            END IF;
          END;
          $$;
        `
      });
      
      if (createError) {
        console.error("Error creating product stats functions:", createError);
      } else {
        console.log("Created product stats functions");
      }
    }
  } catch (error) {
    console.error("Error ensuring product stats functions:", error);
  }
}

export default initSupabase;
