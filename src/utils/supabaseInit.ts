
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize Supabase with required functions and tables for the products page settings
 */
export const initSupabase = async () => {
  try {
    console.log("Initializing Supabase functions...");
    
    // Create a function to check if a table exists
    await supabase.rpc('create_check_table_exists_function', {}, {
      count: 'exact',
      head: true
    }).catch(async (error) => {
      if (error.message.includes('does not exist')) {
        // Create the function if it doesn't exist
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE OR REPLACE FUNCTION public.check_if_table_exists(table_name text)
            RETURNS boolean
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
              table_exists boolean;
            BEGIN
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = $1
              ) INTO table_exists;
              
              RETURN table_exists;
            END;
            $$;
            
            ALTER FUNCTION public.check_if_table_exists(text) OWNER TO postgres;
          `
        });
        
        if (createError) {
          console.error("Error creating check_if_table_exists function:", createError);
        } else {
          console.log("Created check_if_table_exists function");
        }
      } else {
        console.error("Error checking for function existence:", error);
      }
    });
    
    // Create a function to execute arbitrary SQL (needed for table creation)
    await supabase.rpc('create_exec_sql_function', {}, {
      count: 'exact',
      head: true
    }).catch(async (error) => {
      if (error.message.includes('does not exist')) {
        // Create the function if it doesn't exist
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
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
        });
        
        if (createError) {
          console.error("Error creating exec_sql function:", createError);
        } else {
          console.log("Created exec_sql function");
        }
      } else {
        console.error("Error checking for function existence:", error);
      }
    });
    
    // Create a function to create the products_page_settings table
    await supabase.rpc('create_products_page_settings_table_function', {}, {
      count: 'exact',
      head: true
    }).catch(async (error) => {
      if (error.message.includes('does not exist')) {
        // Create the function if it doesn't exist
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE OR REPLACE FUNCTION public.create_products_page_settings_table()
            RETURNS boolean
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
              table_exists boolean;
            BEGIN
              -- Check if table already exists
              SELECT check_if_table_exists('products_page_settings') INTO table_exists;
              
              IF NOT table_exists THEN
                -- Create the table
                CREATE TABLE public.products_page_settings (
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
                
                RETURN true;
              ELSE
                RETURN false;
              END IF;
            END;
            $$;
            
            ALTER FUNCTION public.create_products_page_settings_table() OWNER TO postgres;
          `
        });
        
        if (createError) {
          console.error("Error creating create_products_page_settings_table function:", createError);
        } else {
          console.log("Created create_products_page_settings_table function");
        }
      } else {
        console.error("Error checking for function existence:", error);
      }
    });
    
    console.log("Supabase initialization completed");
    return true;
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
};

export default initSupabase;
