/**
 * Types for the tables and functions created in supabase/migrations.
 *
 * REGENERATE, do not hand-edit, once a local stack is available:
 *
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * This file is written to match the generator's output shape so that
 * regenerating it is a clean overwrite. It exists ahead of the generated
 * version so queries and RPC calls are type-checked from the first slice
 * rather than silently typed as `any`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        // No INSERT grant for `authenticated`: rows come from the
        // on_auth_user_created trigger.
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      business_memberships: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["business_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["business_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: Database["public"]["Enums"]["business_role"];
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: number;
          business_id: string | null;
          actor_user_id: string | null;
          domain: Database["public"]["Enums"]["audit_domain"];
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          occurred_at: string;
        };
        Insert: {
          business_id?: string | null;
          actor_user_id?: string | null;
          domain?: Database["public"]["Enums"]["audit_domain"];
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        // Append-only. There is no UPDATE grant and no UPDATE policy.
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_business_with_owner: {
        Args: { p_name: string };
        Returns: Database["public"]["Tables"]["businesses"]["Row"];
      };
    };
    Enums: {
      audit_domain: "shared" | "start_comply" | "operate_decide";
      business_role: "owner";
    };
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
