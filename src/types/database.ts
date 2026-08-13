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
    PostgrestVersion: "14.15"
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
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          business_id: string | null
          domain: Database["public"]["Enums"]["audit_domain"]
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          occurred_at: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          business_id?: string | null
          domain?: Database["public"]["Enums"]["audit_domain"]
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          business_id?: string | null
          domain?: Database["public"]["Enums"]["audit_domain"]
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_memberships: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["business_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["business_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["business_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_memberships_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          registration_status: Database["public"]["Enums"]["business_registration_status"]
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name: string
          registration_status?: Database["public"]["Enums"]["business_registration_status"]
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          registration_status?: Database["public"]["Enums"]["business_registration_status"]
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          gross_amount: number
          id: string
          sales_date: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          gross_amount: number
          id?: string
          sales_date: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          gross_amount?: number
          id?: string
          sales_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracked_items: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          latest_unit_cost: number | null
          minimum_order_qty: number | null
          name: string
          pack_size: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          latest_unit_cost?: number | null
          minimum_order_qty?: number | null
          name: string
          pack_size?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          latest_unit_cost?: number | null
          minimum_order_qty?: number | null
          name?: string
          pack_size?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_business_with_owner: {
        Args: {
          p_is_operating?: boolean
          p_legal_name?: string
          p_name: string
          p_registration_status?: Database["public"]["Enums"]["business_registration_status"]
        }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          registration_status: Database["public"]["Enums"]["business_registration_status"]
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "businesses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_tracked_item: {
        Args: {
          p_business_id: string
          p_latest_unit_cost?: number
          p_minimum_order_qty?: number
          p_name: string
          p_pack_size?: number
          p_unit: string
        }
        Returns: {
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          latest_unit_cost: number | null
          minimum_order_qty: number | null
          name: string
          pack_size: number | null
          unit: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tracked_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      declare_business_status: {
        Args: {
          p_business_id: string
          p_status: Database["public"]["Enums"]["business_status"]
        }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          registration_status: Database["public"]["Enums"]["business_registration_status"]
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "businesses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_daily_sales: {
        Args: { p_id: string }
        Returns: {
          business_id: string
          created_at: string
          created_by: string | null
          gross_amount: number
          id: string
          sales_date: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "daily_sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_daily_sales: {
        Args: {
          p_business_id: string
          p_gross_amount: number
          p_sales_date?: string
        }
        Returns: {
          business_id: string
          created_at: string
          created_by: string | null
          gross_amount: number
          id: string
          sales_date: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "daily_sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_tracked_item: {
        Args: {
          p_is_active?: boolean
          p_item_id: string
          p_latest_unit_cost?: number
          p_minimum_order_qty?: number
          p_name?: string
          p_pack_size?: number
          p_unit?: string
        }
        Returns: {
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          latest_unit_cost: number | null
          minimum_order_qty: number | null
          name: string
          pack_size: number | null
          unit: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tracked_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      audit_domain: "shared" | "start_comply" | "operate_decide"
      business_registration_status:
        | "unknown"
        | "not_started"
        | "in_progress"
        | "complete"
      business_role: "owner"
      business_status: "draft" | "registering" | "operating" | "closed"
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
      audit_domain: ["shared", "start_comply", "operate_decide"],
      business_registration_status: [
        "unknown",
        "not_started",
        "in_progress",
        "complete",
      ],
      business_role: ["owner"],
      business_status: ["draft", "registering", "operating", "closed"],
    },
  },
} as const
