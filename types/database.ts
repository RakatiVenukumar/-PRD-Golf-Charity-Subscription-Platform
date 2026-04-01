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
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          featured?: boolean
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
          created_at: string
        }
        Insert: {
          id?: string
          draw_numbers: number[]
          draw_date: string
          status?: Database["public"]["Enums"]["draw_status"]
          jackpot_rollover?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          draw_numbers?: number[]
          draw_date?: string
          status?: Database["public"]["Enums"]["draw_status"]
          jackpot_rollover?: boolean
          created_at?: string
        }
        Relationships: []
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
      draw_status: "draft" | "published"
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
