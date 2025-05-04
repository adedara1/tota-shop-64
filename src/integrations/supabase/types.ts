export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      button_stats: {
        Row: {
          button_name: string
          click_date: string | null
          clicks_count: number | null
          created_at: string
          id: string
          page_name: string
          updated_at: string
        }
        Insert: {
          button_name: string
          click_date?: string | null
          clicks_count?: number | null
          created_at?: string
          id?: string
          page_name: string
          updated_at?: string
        }
        Update: {
          button_name?: string
          click_date?: string | null
          clicks_count?: number | null
          created_at?: string
          id?: string
          page_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string
          hidden: boolean | null
          id: string
          image: string | null
          name: string
          options: Json | null
          price: number
          processed: boolean | null
          product_id: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          hidden?: boolean | null
          id?: string
          image?: string | null
          name: string
          options?: Json | null
          price: number
          processed?: boolean | null
          product_id?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          hidden?: boolean | null
          id?: string
          image?: string | null
          name?: string
          options?: Json | null
          price?: number
          processed?: boolean | null
          product_id?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          label: string | null
          label_color: string | null
          processed: boolean | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          label?: string | null
          label_color?: string | null
          processed?: boolean | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          label?: string | null
          label_color?: string | null
          processed?: boolean | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      popo_settings: {
        Row: {
          button1_text: string
          button1_url: string
          button2_text: string
          button2_url: string
          created_at: string
          id: string
          title1: string
          title2: string
          updated_at: string
        }
        Insert: {
          button1_text?: string
          button1_url?: string
          button2_text?: string
          button2_url?: string
          created_at?: string
          id?: string
          title1?: string
          title2?: string
          updated_at?: string
        }
        Update: {
          button1_text?: string
          button1_url?: string
          button2_text?: string
          button2_url?: string
          created_at?: string
          id?: string
          title1?: string
          title2?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_stats: {
        Row: {
          clicks_count: number
          created_at: string
          id: string
          product_id: string | null
          updated_at: string
          view_date: string
          views_count: number
        }
        Insert: {
          clicks_count?: number
          created_at?: string
          id?: string
          product_id?: string | null
          updated_at?: string
          view_date?: string
          views_count?: number
        }
        Update: {
          clicks_count?: number
          created_at?: string
          id?: string
          product_id?: string | null
          updated_at?: string
          view_date?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_stats_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          button_text: string
          cart_url: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          discounted_price: number
          discounted_price_color: string | null
          hide_promo_bar: boolean | null
          id: string
          images: string[]
          is_visible: boolean
          name: string
          option_title_color: string | null
          option_value_color: string | null
          options: Json | null
          original_price: number
          original_price_color: string | null
          product_name_color: string | null
          product_trademark_color: string | null
          quantity_text_color: string | null
          review_count: number | null
          secondary_button: Json | null
          show_product_trademark: boolean | null
          show_similar_products: boolean | null
          show_star_reviews: boolean | null
          show_stock_status: boolean | null
          similar_products: string[] | null
          similar_products_title_color: string | null
          star_count: number | null
          star_reviews_color: string | null
          stock_status_color: string | null
          stock_status_text: string | null
          theme_color: string
          updated_at: string
          use_internal_cart: boolean | null
        }
        Insert: {
          button_text?: string
          cart_url: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description: string
          discounted_price: number
          discounted_price_color?: string | null
          hide_promo_bar?: boolean | null
          id?: string
          images: string[]
          is_visible?: boolean
          name: string
          option_title_color?: string | null
          option_value_color?: string | null
          options?: Json | null
          original_price: number
          original_price_color?: string | null
          product_name_color?: string | null
          product_trademark_color?: string | null
          quantity_text_color?: string | null
          review_count?: number | null
          secondary_button?: Json | null
          show_product_trademark?: boolean | null
          show_similar_products?: boolean | null
          show_star_reviews?: boolean | null
          show_stock_status?: boolean | null
          similar_products?: string[] | null
          similar_products_title_color?: string | null
          star_count?: number | null
          star_reviews_color?: string | null
          stock_status_color?: string | null
          stock_status_text?: string | null
          theme_color?: string
          updated_at?: string
          use_internal_cart?: boolean | null
        }
        Update: {
          button_text?: string
          cart_url?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          discounted_price?: number
          discounted_price_color?: string | null
          hide_promo_bar?: boolean | null
          id?: string
          images?: string[]
          is_visible?: boolean
          name?: string
          option_title_color?: string | null
          option_value_color?: string | null
          options?: Json | null
          original_price?: number
          original_price_color?: string | null
          product_name_color?: string | null
          product_trademark_color?: string | null
          quantity_text_color?: string | null
          review_count?: number | null
          secondary_button?: Json | null
          show_product_trademark?: boolean | null
          show_similar_products?: boolean | null
          show_star_reviews?: boolean | null
          show_stock_status?: boolean | null
          similar_products?: string[] | null
          similar_products_title_color?: string | null
          star_count?: number | null
          star_reviews_color?: string | null
          stock_status_color?: string | null
          stock_status_text?: string | null
          theme_color?: string
          updated_at?: string
          use_internal_cart?: boolean | null
        }
        Relationships: []
      }
      products_page_settings: {
        Row: {
          background_color: string
          banner_message: string | null
          categories: string[]
          created_at: string
          description: string | null
          hero_banner_description: string
          hero_banner_image: string
          hero_banner_title: string
          id: string
          items_per_page: number
          mobile_hero_image: string | null
          section_titles: Json
          show_banner: boolean | null
          show_categories: boolean
          show_filters: boolean
          show_ratings: boolean
          show_search: boolean
          updated_at: string
        }
        Insert: {
          background_color?: string
          banner_message?: string | null
          categories?: string[]
          created_at?: string
          description?: string | null
          hero_banner_description: string
          hero_banner_image: string
          hero_banner_title: string
          id: string
          items_per_page?: number
          mobile_hero_image?: string | null
          section_titles: Json
          show_banner?: boolean | null
          show_categories?: boolean
          show_filters?: boolean
          show_ratings?: boolean
          show_search?: boolean
          updated_at?: string
        }
        Update: {
          background_color?: string
          banner_message?: string | null
          categories?: string[]
          created_at?: string
          description?: string | null
          hero_banner_description?: string
          hero_banner_image?: string
          hero_banner_title?: string
          id?: string
          items_per_page?: number
          mobile_hero_image?: string | null
          section_titles?: Json
          show_banner?: boolean | null
          show_categories?: boolean
          show_filters?: boolean
          show_ratings?: boolean
          show_search?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_button_click: {
        Args: {
          button_name_param: string
          page_name_param: string
          click_date_param?: string
        }
        Returns: undefined
      }
      increment_product_click: {
        Args: { product_id_param: string; click_date_param?: string }
        Returns: undefined
      }
      increment_product_view: {
        Args: { product_id_param: string; view_date_param?: string }
        Returns: undefined
      }
      table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
    }
    Enums: {
      currency_code:
        | "XOF"
        | "XAF"
        | "ZAR"
        | "MAD"
        | "EGP"
        | "NGN"
        | "KES"
        | "TND"
        | "UGX"
        | "GHS"
        | "USD"
        | "EUR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      currency_code: [
        "XOF",
        "XAF",
        "ZAR",
        "MAD",
        "EGP",
        "NGN",
        "KES",
        "TND",
        "UGX",
        "GHS",
        "USD",
        "EUR",
      ],
    },
  },
} as const
