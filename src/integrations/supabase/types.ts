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
  public: {
    Tables: {
      assessment_leads: {
        Row: {
          answers: Json
          consent_newsletter: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          plan: Json
          recommended_tier: string | null
          user_agent: string | null
        }
        Insert: {
          answers: Json
          consent_newsletter?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          plan: Json
          recommended_tier?: string | null
          user_agent?: string | null
        }
        Update: {
          answers?: Json
          consent_newsletter?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          plan?: Json
          recommended_tier?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      coach_applications: {
        Row: {
          agree_background_check: boolean
          agree_terms: boolean
          approach: string | null
          areas_of_expertise: string[]
          availability: string | null
          clients_capacity: number | null
          coaching_experience: string | null
          compensation_expectations: string | null
          conflicts_disclosure: string | null
          created_at: string
          current_position: string | null
          education: string | null
          email: string
          full_name: string
          hours_per_week: number | null
          id: string
          languages: string[]
          linkedin_url: string | null
          location: string | null
          motivation: string
          notable_experience: string | null
          phone: string | null
          preferred_client_levels: string[]
          referral_source: string | null
          resume_path: string | null
          start_date: string | null
          status: string
          timezone: string | null
          years_experience: number | null
        }
        Insert: {
          agree_background_check?: boolean
          agree_terms?: boolean
          approach?: string | null
          areas_of_expertise?: string[]
          availability?: string | null
          clients_capacity?: number | null
          coaching_experience?: string | null
          compensation_expectations?: string | null
          conflicts_disclosure?: string | null
          created_at?: string
          current_position?: string | null
          education?: string | null
          email: string
          full_name: string
          hours_per_week?: number | null
          id?: string
          languages?: string[]
          linkedin_url?: string | null
          location?: string | null
          motivation: string
          notable_experience?: string | null
          phone?: string | null
          preferred_client_levels?: string[]
          referral_source?: string | null
          resume_path?: string | null
          start_date?: string | null
          status?: string
          timezone?: string | null
          years_experience?: number | null
        }
        Update: {
          agree_background_check?: boolean
          agree_terms?: boolean
          approach?: string | null
          areas_of_expertise?: string[]
          availability?: string | null
          clients_capacity?: number | null
          coaching_experience?: string | null
          compensation_expectations?: string | null
          conflicts_disclosure?: string | null
          created_at?: string
          current_position?: string | null
          education?: string | null
          email?: string
          full_name?: string
          hours_per_week?: number | null
          id?: string
          languages?: string[]
          linkedin_url?: string | null
          location?: string | null
          motivation?: string
          notable_experience?: string | null
          phone?: string | null
          preferred_client_levels?: string[]
          referral_source?: string | null
          resume_path?: string | null
          start_date?: string | null
          status?: string
          timezone?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          institution: string | null
          last_name: string
          message: string
          phone: string | null
          practice: string | null
          timeline: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          institution?: string | null
          last_name: string
          message: string
          phone?: string | null
          practice?: string | null
          timeline?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          institution?: string | null
          last_name?: string
          message?: string
          phone?: string | null
          practice?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          service_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          service_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          service_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ats_issues: Json
          category_scores: Json
          created_at: string
          experience_level: string | null
          formatting_notes: Json
          id: string
          keyword_gaps: Json
          overall_score: number | null
          priority_fixes: Json
          resume_id: string
          summary: string | null
          target_field: string | null
          updated_at: string
          user_id: string
          wording_suggestions: Json
        }
        Insert: {
          ats_issues?: Json
          category_scores?: Json
          created_at?: string
          experience_level?: string | null
          formatting_notes?: Json
          id?: string
          keyword_gaps?: Json
          overall_score?: number | null
          priority_fixes?: Json
          resume_id: string
          summary?: string | null
          target_field?: string | null
          updated_at?: string
          user_id: string
          wording_suggestions?: Json
        }
        Update: {
          ats_issues?: Json
          category_scores?: Json
          created_at?: string
          experience_level?: string | null
          formatting_notes?: Json
          id?: string
          keyword_gaps?: Json
          overall_score?: number | null
          priority_fixes?: Json
          resume_id?: string
          summary?: string | null
          target_field?: string | null
          updated_at?: string
          user_id?: string
          wording_suggestions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_reviews: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          environment: string
          id: string
          notes: string | null
          resume_path: string
          reviewed_resume_path: string | null
          status: Database["public"]["Enums"]["review_status"]
          stripe_session_id: string | null
          target_role: string
          updated_at: string
          user_id: string
          visible_to_coaches: boolean
          visible_to_employers: boolean
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          notes?: string | null
          resume_path: string
          reviewed_resume_path?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          stripe_session_id?: string | null
          target_role: string
          updated_at?: string
          user_id: string
          visible_to_coaches?: boolean
          visible_to_employers?: boolean
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          notes?: string | null
          resume_path?: string
          reviewed_resume_path?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          stripe_session_id?: string | null
          target_role?: string
          updated_at?: string
          user_id?: string
          visible_to_coaches?: boolean
          visible_to_employers?: boolean
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content_type: string | null
          created_at: string
          extracted_text: string | null
          file_path: string
          id: string
          original_filename: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          extracted_text?: string | null
          file_path: string
          id?: string
          original_filename?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          extracted_text?: string | null
          file_path?: string
          id?: string
          original_filename?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      admin_set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      sync_user_service_tier: {
        Args: { _env?: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "coach" | "employer" | "member"
      review_status:
        | "pending_payment"
        | "paid"
        | "in_review"
        | "completed"
        | "canceled"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "coach", "employer", "member"],
      review_status: [
        "pending_payment",
        "paid",
        "in_review",
        "completed",
        "canceled",
      ],
    },
  },
} as const
