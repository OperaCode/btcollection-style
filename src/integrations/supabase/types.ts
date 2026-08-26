export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      custom_requests: {
        Row: {
          color_preference: string | null
          created_at: string
          customer_notification_error: string | null
          customer_notified_at: string | null
          deadline: string | null
          delivery_preference: string | null
          design_text: string | null
          email: string
          full_name: string
          id: string
          idea: string | null
          item_type: string | null
          media_details: string | null
          notification_error: string | null
          notification_sent_at: string | null
          occasion: string | null
          paid_at: string | null
          phone: string | null
          quantity: number | null
          quote_note: string | null
          quoted_price: number | null
          sample_image_path: string | null
          square_checkout_order_id: string | null
          square_payment_id: string | null
          status: string
          stripe_session_id: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          color_preference?: string | null
          created_at?: string
          customer_notification_error?: string | null
          customer_notified_at?: string | null
          deadline?: string | null
          delivery_preference?: string | null
          design_text?: string | null
          email: string
          full_name: string
          id?: string
          idea?: string | null
          item_type?: string | null
          media_details?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          occasion?: string | null
          paid_at?: string | null
          phone?: string | null
          quantity?: number | null
          quote_note?: string | null
          quoted_price?: number | null
          sample_image_path?: string | null
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          status?: string
          stripe_session_id?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          color_preference?: string | null
          created_at?: string
          customer_notification_error?: string | null
          customer_notified_at?: string | null
          deadline?: string | null
          delivery_preference?: string | null
          design_text?: string | null
          email?: string
          full_name?: string
          id?: string
          idea?: string | null
          item_type?: string | null
          media_details?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          occasion?: string | null
          paid_at?: string | null
          phone?: string | null
          quantity?: number | null
          quote_note?: string | null
          quoted_price?: number | null
          sample_image_path?: string | null
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          status?: string
          stripe_session_id?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          created_at: string
          delivery_method: string | null
          email: string
          id: string
          items: Json
          paid_at: string | null
          shipping: number
          shipping_address: Json
          square_checkout_order_id: string | null
          square_payment_id: string | null
          subtotal: number
          total: number
        }
        Insert: {
          created_at?: string
          delivery_method?: string | null
          email: string
          id?: string
          items: Json
          paid_at?: string | null
          shipping?: number
          shipping_address: Json
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          subtotal: number
          total: number
        }
        Update: {
          created_at?: string
          delivery_method?: string | null
          email?: string
          id?: string
          items?: Json
          paid_at?: string | null
          shipping?: number
          shipping_address?: Json
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          created_at: string
          gallery_project_id: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          gallery_project_id: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          gallery_project_id?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_project_id_fkey"
            columns: ["gallery_project_id"]
            isOneToOne: false
            referencedRelation: "gallery_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_projects: {
        Row: {
          colors: string[]
          created_at: string
          description: string | null
          featured: boolean
          id: string
          materials: string[]
          occasions: string[]
          product_id: string | null
          product_type: string | null
          published: boolean
          slug: string
          sort_order: number
          techniques: string[]
          title: string
          updated_at: string
        }
        Insert: {
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          materials?: string[]
          occasions?: string[]
          product_id?: string | null
          product_type?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          techniques?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          materials?: string[]
          occasions?: string[]
          product_id?: string | null
          product_type?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          techniques?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_projects_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          source: string
          status: string
          updated_at: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          source?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          source?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customization: Json | null
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          customization?: Json | null
          id?: string
          name: string
          order_id: string
          price: number
          product_id?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string
          customization?: Json | null
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_method: string | null
          email: string
          id: string
          label_purchased_at: string | null
          notes: string | null
          shipping: number
          shipping_address: Json | null
          shipping_label_url: string | null
          shippo_rate_id: string | null
          shippo_shipment_id: string | null
          square_checkout_order_id: string | null
          square_payment_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_method?: string | null
          email: string
          id?: string
          label_purchased_at?: string | null
          notes?: string | null
          shipping?: number
          shipping_address?: Json | null
          shipping_label_url?: string | null
          shippo_rate_id?: string | null
          shippo_shipment_id?: string | null
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_method?: string | null
          email?: string
          id?: string
          label_purchased_at?: string | null
          notes?: string | null
          shipping?: number
          shipping_address?: Json | null
          shipping_label_url?: string | null
          shippo_rate_id?: string | null
          shippo_shipment_id?: string | null
          square_checkout_order_id?: string | null
          square_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          best_seller: boolean
          category: string
          created_at: string
          customizable: boolean
          description: string | null
          featured: boolean
          hidden_from_shop: boolean
          id: string
          image_addon_price: number
          images: string[]
          in_stock: boolean
          name: string
          occasions: string[] | null
          sizes: string[] | null
          slug: string
          text_addon_price: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          best_seller?: boolean
          category: string
          created_at?: string
          customizable?: boolean
          description?: string | null
          featured?: boolean
          hidden_from_shop?: boolean
          id?: string
          image_addon_price?: number
          images?: string[]
          in_stock?: boolean
          name: string
          occasions?: string[] | null
          sizes?: string[] | null
          slug: string
          text_addon_price?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          best_seller?: boolean
          category?: string
          created_at?: string
          customizable?: boolean
          description?: string | null
          featured?: boolean
          hidden_from_shop?: boolean
          id?: string
          image_addon_price?: number
          images?: string[]
          in_stock?: boolean
          name?: string
          occasions?: string[] | null
          sizes?: string[] | null
          slug?: string
          text_addon_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string | null
          id: number
          parcel_height: string | null
          parcel_length: string | null
          parcel_weight: string | null
          parcel_width: string | null
          shippo_from_city: string | null
          shippo_from_company: string | null
          shippo_from_country: string | null
          shippo_from_email: string | null
          shippo_from_name: string | null
          shippo_from_phone: string | null
          shippo_from_state: string | null
          shippo_from_street1: string | null
          shippo_from_street2: string | null
          shippo_from_zip: string | null
          social_etsy: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_pinterest: string | null
          social_tiktok: string | null
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          contact_email?: string | null
          id?: number
          parcel_height?: string | null
          parcel_length?: string | null
          parcel_weight?: string | null
          parcel_width?: string | null
          shippo_from_city?: string | null
          shippo_from_company?: string | null
          shippo_from_country?: string | null
          shippo_from_email?: string | null
          shippo_from_name?: string | null
          shippo_from_phone?: string | null
          shippo_from_state?: string | null
          shippo_from_street1?: string | null
          shippo_from_street2?: string | null
          shippo_from_zip?: string | null
          social_etsy?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          contact_email?: string | null
          id?: number
          parcel_height?: string | null
          parcel_length?: string | null
          parcel_weight?: string | null
          parcel_width?: string | null
          shippo_from_city?: string | null
          shippo_from_company?: string | null
          shippo_from_country?: string | null
          shippo_from_email?: string | null
          shippo_from_name?: string | null
          shippo_from_phone?: string | null
          shippo_from_state?: string | null
          shippo_from_street1?: string | null
          shippo_from_street2?: string | null
          shippo_from_zip?: string | null
          social_etsy?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_admin_by_email: { Args: { _email: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
