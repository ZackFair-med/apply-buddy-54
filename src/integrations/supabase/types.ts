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
      cvs: {
        Row: {
          category: string | null
          created_at: string
          file_name: string
          id: string
          label: string
          mime_type: string
          parse_error: string | null
          parsed_at: string | null
          parsed_text: string | null
          size_bytes: number
          storage_path: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name: string
          id?: string
          label: string
          mime_type: string
          parse_error?: string | null
          parsed_at?: string | null
          parsed_text?: string | null
          size_bytes: number
          storage_path: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string
          id?: string
          label?: string
          mime_type?: string
          parse_error?: string | null
          parsed_at?: string | null
          parsed_text?: string | null
          size_bytes?: number
          storage_path?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          country: string | null
          created_at: string
          cv_id: string | null
          deadline: string | null
          id: string
          job_description: string | null
          language: string | null
          notes: string | null
          source: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          company: string
          country?: string | null
          created_at?: string
          cv_id?: string | null
          deadline?: string | null
          id?: string
          job_description?: string | null
          language?: string | null
          notes?: string | null
          source?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string
          country?: string | null
          created_at?: string
          cv_id?: string | null
          deadline?: string | null
          id?: string
          job_description?: string | null
          language?: string | null
          notes?: string | null
          source?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
        ]
      }
      match_history: {
        Row: {
          company: string | null
          created_at: string
          cv_id: string | null
          id: string
          job_id: string | null
          job_title: string | null
          match_score: number
          strengths: string[]
          user_id: string
          weaknesses: string[]
        }
        Insert: {
          company?: string | null
          created_at?: string
          cv_id?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          match_score: number
          strengths?: string[]
          user_id: string
          weaknesses?: string[]
        }
        Update: {
          company?: string | null
          created_at?: string
          cv_id?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          match_score?: number
          strengths?: string[]
          user_id?: string
          weaknesses?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "match_history_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          plan: string
          target_date: string | null
          target_salary_currency: string | null
          target_salary_max: number | null
          target_salary_min: number | null
          target_title: string | null
          updated_at: string
          weekly_goal: number | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          plan?: string
          target_date?: string | null
          target_salary_currency?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          target_title?: string | null
          updated_at?: string
          weekly_goal?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan?: string
          target_date?: string | null
          target_salary_currency?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          target_title?: string | null
          updated_at?: string
          weekly_goal?: number | null
        }
        Relationships: []
      }
      tailor_sessions: {
        Row: {
          cover_letter: string | null
          created_at: string
          cv_id: string | null
          cv_suggestions: string[]
          id: string
          job_description: string
          job_id: string | null
          keyword_gaps: string[]
          match_score: number | null
          matched_keywords: string[]
          matched_skills: string[]
          missing_keywords: string[]
          missing_skills: string[]
          model: string | null
          provider: string | null
          strengths: string[]
          user_id: string
          weaknesses: string[]
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          cv_id?: string | null
          cv_suggestions?: string[]
          id?: string
          job_description: string
          job_id?: string | null
          keyword_gaps?: string[]
          match_score?: number | null
          matched_keywords?: string[]
          matched_skills?: string[]
          missing_keywords?: string[]
          missing_skills?: string[]
          model?: string | null
          provider?: string | null
          strengths?: string[]
          user_id: string
          weaknesses?: string[]
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          cv_id?: string | null
          cv_suggestions?: string[]
          id?: string
          job_description?: string
          job_id?: string | null
          keyword_gaps?: string[]
          match_score?: number | null
          matched_keywords?: string[]
          matched_skills?: string[]
          missing_keywords?: string[]
          missing_skills?: string[]
          model?: string | null
          provider?: string | null
          strengths?: string[]
          user_id?: string
          weaknesses?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tailor_sessions_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          created_at: string
          id: string
          task_type: Database["public"]["Enums"]["ai_task_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_type: Database["public"]["Enums"]["ai_task_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_type?: Database["public"]["Enums"]["ai_task_type"]
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
      ai_task_type: "match_score" | "keywords" | "cover_letter"
      job_status:
        | "saved"
        | "applied"
        | "screening"
        | "interview"
        | "offer"
        | "rejected"
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
      ai_task_type: ["match_score", "keywords", "cover_letter"],
      job_status: [
        "saved",
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
      ],
    },
  },
} as const
