
import { Json } from "@/integrations/supabase/types";

export interface ProductsPageSettings {
  id?: string;
  hero_banner_image: string;
  hero_banner_title: string;
  hero_banner_description: string;
  section_titles: Record<string, string>;
  items_per_page: number;
  show_ratings: boolean;
  show_search: boolean;
  show_categories: boolean;
  show_filters: boolean;
  background_color: string;
  categories: string[];
  created_at?: string;
  updated_at?: string;
}

export const defaultSettings: ProductsPageSettings = {
  hero_banner_image: "/lovable-uploads/88668931-9bc2-4d50-b115-231ec9516b1e.png",
  hero_banner_title: "Luxury Fragrance Collection",
  hero_banner_description: "Discover our exquisite collection of premium fragrances",
  section_titles: {
    new_arrivals: "New Arrivals",
    best_sellers: "Best Sellers",
    trending: "Trending Now",
    sales: "On Sale",
    seasonal: "Fall & Winter Fragrances"
  },
  items_per_page: 8,
  show_ratings: true,
  show_search: true,
  show_categories: true,
  show_filters: false,
  background_color: "#fdf7f7",
  categories: ["Tout", "Parfums", "Soins", "Accessoires", "Cadeaux"],
};
