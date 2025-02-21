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
          id: string
          images: string[]
          is_visible: boolean
          name: string
          original_price: number
          theme_color: string
          updated_at: string
        }
        Insert: {
          button_text?: string
          cart_url: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description: string
          discounted_price: number
          id?: string
          images: string[]
          is_visible?: boolean
          name: string
          original_price: number
          theme_color?: string
          updated_at?: string
        }
        Update: {
          button_text?: string
          cart_url?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          discounted_price?: number
          id?: string
          images?: string[]
          is_visible?: boolean
          name?: string
          original_price?: number
          theme_color?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_product_click: {
        Args: {
          product_id_param: string
          click_date_param?: string
        }
        Returns: undefined
      }
      increment_product_view: {
        Args: {
          product_id_param: string
          view_date_param?: string
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
