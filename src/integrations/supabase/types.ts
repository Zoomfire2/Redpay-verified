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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          admin_label: string | null
          amount: number | null
          created_at: string
          details: Json | null
          id: string
          target_label: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          admin_label?: string | null
          amount?: number | null
          created_at?: string
          details?: Json | null
          id?: string
          target_label?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          admin_label?: string | null
          amount?: number | null
          created_at?: string
          details?: Json | null
          id?: string
          target_label?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          active: boolean
          body: string
          created_at: string
          id: string
          link: string | null
          target_user_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          id?: string
          link?: string | null
          target_user_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          target_user_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          charged_amount: number | null
          created_at: string
          credited: boolean
          currency: string
          customer_email: string | null
          customer_name: string | null
          expires_at: string | null
          failure_reason: string | null
          id: string
          last_checked_at: string | null
          purpose: string
          receipt_path: string | null
          receipt_submitted_at: string | null
          status: string
          tx_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          charged_amount?: number | null
          created_at?: string
          credited?: boolean
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          last_checked_at?: string | null
          purpose?: string
          receipt_path?: string | null
          receipt_submitted_at?: string | null
          status?: string
          tx_ref: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          charged_amount?: number | null
          created_at?: string
          credited?: boolean
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          last_checked_at?: string | null
          purpose?: string
          receipt_path?: string | null
          receipt_submitted_at?: string | null
          status?: string
          tx_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      private_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_claim_at: string | null
          last_seen_at: string | null
          phone: string | null
          referral_code: string
          referred_by: string | null
          signup_bonus_claimed: boolean
          status: string
          status_changed_at: string | null
          status_reason: string | null
          updated_at: string
          username: string
        }
        Insert: {
          balance?: number
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_claim_at?: string | null
          last_seen_at?: string | null
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          signup_bonus_claimed?: boolean
          status?: string
          status_changed_at?: string | null
          status_reason?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          balance?: number
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_claim_at?: string | null
          last_seen_at?: string | null
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          signup_bonus_claimed?: boolean
          status?: string
          status_changed_at?: string | null
          status_reason?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      public_payment_settings: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank: string
          instructions: string | null
          key: string
          original_amount: number | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank: string
          instructions?: string | null
          key: string
          original_amount?: number | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank?: string
          instructions?: string | null
          key?: string
          original_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rpc_intakes: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          platform: string
          reward: number
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          reward?: number
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          reward?: number
          title?: string
          url?: string
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
      withdrawal_attempts: {
        Row: {
          account_name: string | null
          account_number: string | null
          amount: number
          bank: string | null
          created_at: string
          id: string
          rpc_tried: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          amount: number
          bank?: string | null
          created_at?: string
          id?: string
          rpc_tried?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          amount?: number
          bank?: string | null
          created_at?: string
          id?: string
          rpc_tried?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
