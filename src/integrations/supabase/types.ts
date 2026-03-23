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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_date: string
          id: string
          interview_result: string | null
          job_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_date?: string
          id?: string
          interview_result?: string | null
          job_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_date?: string
          id?: string
          interview_result?: string | null
          job_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string
          created_at: string
          id: string
          job_description: string | null
          job_role: string
          location: string | null
          recruiter_id: string
          required_skills: string[] | null
          salary_offered: number | null
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          job_description?: string | null
          job_role: string
          location?: string | null
          recruiter_id: string
          required_skills?: string[] | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          job_description?: string | null
          job_role?: string
          location?: string | null
          recruiter_id?: string
          required_skills?: string[] | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      placement_stats: {
        Row: {
          category: string
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          category?: string
          id?: string
          metric_name: string
          metric_value: number
          updated_at?: string
        }
        Update: {
          category?: string
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      placements: {
        Row: {
          company_name: string
          department: string | null
          id: string
          job_id: string | null
          placed_date: string
          role: string
          salary: number
          student_id: string
        }
        Insert: {
          company_name: string
          department?: string | null
          id?: string
          job_id?: string | null
          placed_date?: string
          role: string
          salary?: number
          student_id: string
        }
        Update: {
          company_name?: string
          department?: string | null
          id?: string
          job_id?: string | null
          placed_date?: string
          role?: string
          salary?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          career_readiness_score: number | null
          certifications_count: number | null
          cgpa: number | null
          created_at: string
          department: string | null
          extracted_resume_text: string | null
          full_name: string | null
          id: string
          mock_interview_score: number | null
          organization: string | null
          phone_number: string | null
          placement_score: number | null
          placement_status: string | null
          projects_count: number | null
          resume_url: string | null
          role: string
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          career_readiness_score?: number | null
          certifications_count?: number | null
          cgpa?: number | null
          created_at?: string
          department?: string | null
          extracted_resume_text?: string | null
          full_name?: string | null
          id?: string
          mock_interview_score?: number | null
          organization?: string | null
          phone_number?: string | null
          placement_score?: number | null
          placement_status?: string | null
          projects_count?: number | null
          resume_url?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          career_readiness_score?: number | null
          certifications_count?: number | null
          cgpa?: number | null
          created_at?: string
          department?: string | null
          extracted_resume_text?: string | null
          full_name?: string | null
          id?: string
          mock_interview_score?: number | null
          organization?: string | null
          phone_number?: string | null
          placement_score?: number | null
          placement_status?: string | null
          projects_count?: number | null
          resume_url?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analysis: {
        Row: {
          created_at: string
          detected_skills: string[] | null
          id: string
          improvement_suggestions: Json | null
          projects: Json | null
          resume_score: number | null
          resume_url: string | null
          strengths: string[] | null
          student_id: string
          suggested_projects: string[] | null
          suggested_skills: string[] | null
          summary: string | null
          updated_at: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string
          detected_skills?: string[] | null
          id?: string
          improvement_suggestions?: Json | null
          projects?: Json | null
          resume_score?: number | null
          resume_url?: string | null
          strengths?: string[] | null
          student_id: string
          suggested_projects?: string[] | null
          suggested_skills?: string[] | null
          summary?: string | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string
          detected_skills?: string[] | null
          id?: string
          improvement_suggestions?: Json | null
          projects?: Json | null
          resume_score?: number | null
          resume_url?: string | null
          strengths?: string[] | null
          student_id?: string
          suggested_projects?: string[] | null
          suggested_skills?: string[] | null
          summary?: string | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          device_info: string | null
          id: string
          ip_address: string | null
          last_active_time: string
          login_time: string
          logout_time: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active_time?: string
          login_time?: string
          logout_time?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active_time?: string
          login_time?: string
          logout_time?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
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
