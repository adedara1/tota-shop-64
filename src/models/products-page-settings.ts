
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
  mobile_hero_image?: string;
  banner_message?: string;
  description?: string;
  show_banner?: boolean;
}

export const defaultSettings: ProductsPageSettings = {
  hero_banner_image: "https://images.unsplash.com/photo-1525904097878-94fb15835963?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  hero_banner_title: "Collection Nouvelle Saison",
  hero_banner_description: "Découvrez notre sélection de parfums et cosmétiques pour cette saison",
  section_titles: {
    new_arrivals: "Nouveautés",
    best_sellers: "Meilleures Ventes",
    trending: "Tendances",
    sales: "Promotions",
    seasonal: "Sélection Automne & Hiver"
  },
  items_per_page: 8,
  show_ratings: true,
  show_search: true,
  show_categories: true,
  show_filters: false,
  background_color: "#fdf7f7",
  categories: ["Tout", "Parfums", "Soins", "Accessoires", "Cadeaux"]
};
