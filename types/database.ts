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
      charities: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          featured: boolean
          country_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          featured?: boolean
          country_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          featured?: boolean
          country_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      campaigns: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          country_code: string
          starts_at: string | null
          ends_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          settings: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          country_code: string
          starts_at?: string | null
          ends_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          settings?: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          country_code?: string
          starts_at?: string | null
          ends_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          settings?: Json
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charity_events: {
        Row: {
          id: string
          charity_id: string
          title: string
          description: string | null
          event_date: string
          location: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          charity_id: string
          title: string
          description?: string | null
          event_date: string
          location?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          charity_id?: string
          title?: string
          description?: string | null
          event_date?: string
          location?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charity_events_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          name: string
          currency_code: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          code: string
          name: string
          currency_code: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          currency_code?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      draws: {
        Row: {
          id: string
          draw_numbers: number[]
          draw_date: string
          status: Database["public"]["Enums"]["draw_status"]
          jackpot_rollover: boolean
          rollover_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          draw_numbers: number[]
          draw_date: string
          status?: Database["public"]["Enums"]["draw_status"]
          jackpot_rollover?: boolean
          rollover_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          draw_numbers?: number[]
          draw_date?: string
          status?: Database["public"]["Enums"]["draw_status"]
          jackpot_rollover?: boolean
          rollover_amount?: number
          created_at?: string
        }
        Relationships: []
      }
      independent_donations: {
        Row: {
          id: string
          user_id: string | null
          charity_id: string
          amount: number
          donor_name: string | null
          donor_email: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          charity_id: string
          amount: number
          donor_name?: string | null
          donor_email?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          charity_id?: string
          amount?: number
          donor_name?: string | null
          donor_email?: string | null
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "independent_donations_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "independent_donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: Database["public"]["Enums"]["organization_member_role"]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: Database["public"]["Enums"]["organization_member_role"]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["organization_member_role"]
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          account_type: Database["public"]["Enums"]["account_type"]
          country_code: string
          billing_email: string | null
          external_ref: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          account_type?: Database["public"]["Enums"]["account_type"]
          country_code: string
          billing_email?: string | null
          external_ref?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          country_code?: string
          billing_email?: string | null
          external_ref?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: Database["public"]["Enums"]["payment_status"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status?: Database["public"]["Enums"]["payment_status"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: Database["public"]["Enums"]["payment_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          charity_id: string | null
          charity_percentage: number
          country_code: string
          organization_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          renewal_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          charity_id?: string | null
          charity_percentage?: number
          country_code?: string
          organization_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          renewal_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          charity_id?: string | null
          charity_percentage?: number
          country_code?: string
          organization_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          renewal_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          renewal_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          renewal_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          renewal_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      winners: {
        Row: {
          id: string
          user_id: string
          draw_id: string
          match_count: number
          prize_amount: number
          status: Database["public"]["Enums"]["winner_status"]
          proof_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draw_id: string
          match_count: number
          prize_amount?: number
          status?: Database["public"]["Enums"]["winner_status"]
          proof_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draw_id?: string
          match_count?: number
          prize_amount?: number
          status?: Database["public"]["Enums"]["winner_status"]
          proof_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_user_id_fkey"
            columns: ["user_id"]
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
      [_ in never]: never
    }
    Enums: {
      account_type: "individual" | "team" | "corporate"
      campaign_status: "draft" | "scheduled" | "active" | "completed" | "archived"
      draw_status: "draft" | "published"
      organization_member_role: "owner" | "admin" | "member"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      plan_type: "monthly" | "yearly"
      subscription_status: "active" | "inactive" | "lapsed" | "canceled"
      winner_status: "pending" | "approved" | "paid" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type InsertDto<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

export type UpdateDto<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]
