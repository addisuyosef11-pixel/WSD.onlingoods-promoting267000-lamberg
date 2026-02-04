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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_user: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_user?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_user?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method_id: string
          proof_url: string
          sender_name: string
          status: string
          transaction_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method_id: string
          proof_url: string
          sender_name: string
          status?: string
          transaction_ref: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method_id?: string
          proof_url?: string
          sender_name?: string
          status?: string
          transaction_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_codes: {
        Row: {
          amount: number
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_used: boolean | null
        }
        Insert: {
          amount: number
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_holder_name: string | null
          account_number: string
          branch_name: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number: string
          branch_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string
          branch_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          current_vip_level: number | null
          has_made_first_deposit: boolean | null
          id: string
          name: string
          phone: string
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
          withdrawable_balance: number
          withdrawal_password: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          current_vip_level?: number | null
          has_made_first_deposit?: boolean | null
          id?: string
          name: string
          phone: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
          withdrawable_balance?: number
          withdrawal_password?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          current_vip_level?: number | null
          has_made_first_deposit?: boolean | null
          id?: string
          name?: string
          phone?: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
          withdrawable_balance?: number
          withdrawal_password?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          price: number
          profit: number
          task_order: number
          title: string
          vip_level: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          profit: number
          task_order: number
          title: string
          vip_level: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          profit?: number
          task_order?: number
          title?: string
          vip_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_vip_level_fkey"
            columns: ["vip_level"]
            isOneToOne: false
            referencedRelation: "vip_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_income: {
        Row: {
          created_at: string
          id: string
          last_claim_date: string | null
          last_income_transfer_at: string | null
          last_order_claim_at: string | null
          last_yesterday_claim_at: string | null
          today_income: number
          updated_at: string
          user_id: string
          yesterday_income: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_claim_date?: string | null
          last_income_transfer_at?: string | null
          last_order_claim_at?: string | null
          last_yesterday_claim_at?: string | null
          today_income?: number
          updated_at?: string
          user_id: string
          yesterday_income?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_claim_date?: string | null
          last_income_transfer_at?: string | null
          last_order_claim_at?: string | null
          last_yesterday_claim_at?: string | null
          today_income?: number
          updated_at?: string
          user_id?: string
          yesterday_income?: number
        }
        Relationships: []
      }
      user_product_claims: {
        Row: {
          created_at: string
          id: string
          last_claim_at: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_claim_at?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_claim_at?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_task_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          task_id: string
          user_id: string
          vip_level: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          task_id: string
          user_id: string
          vip_level: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
          vip_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_progress_vip_level_fkey"
            columns: ["vip_level"]
            isOneToOne: false
            referencedRelation: "vip_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_levels: {
        Row: {
          created_at: string
          cycle_days: number | null
          daily_income: number | null
          description: string | null
          id: number
          image_url: string | null
          name: string
          price: number
          purchase_limit: number | null
          series: string | null
          sold_out_time: string | null
          total_income: number | null
        }
        Insert: {
          created_at?: string
          cycle_days?: number | null
          daily_income?: number | null
          description?: string | null
          id: number
          image_url?: string | null
          name: string
          price: number
          purchase_limit?: number | null
          series?: string | null
          sold_out_time?: string | null
          total_income?: number | null
        }
        Update: {
          created_at?: string
          cycle_days?: number | null
          daily_income?: number | null
          description?: string | null
          id?: number
          image_url?: string | null
          name?: string
          price?: number
          purchase_limit?: number | null
          series?: string | null
          sold_out_time?: string | null
          total_income?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_profit_to_balance: {
        Args: { p_profit: number; p_user_id: string }
        Returns: undefined
      }
      add_profit_to_withdrawable: {
        Args: { p_profit: number; p_user_id: string }
        Returns: undefined
      }
      claim_gift_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: {
          amount: number
          message: string
          success: boolean
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      process_vip_purchase: {
        Args: { p_amount: number; p_user_id: string; p_vip_level: number }
        Returns: boolean
      }
      process_withdrawal: {
        Args: { p_amount: number; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
