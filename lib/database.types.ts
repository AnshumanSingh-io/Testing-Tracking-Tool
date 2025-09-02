export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      test_cases: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          priority: string
          status: string
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string
          priority?: string
          status?: string
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string
          priority?: string
          status?: string
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      test_case_versions: {
        Row: {
          id: string
          test_case_id: string
          version: number
          title: string
          description: string
          priority: string
          status: string
          changed_at: string
        }
        Insert: {
          id?: string
          test_case_id: string
          version: number
          title: string
          description?: string
          priority: string
          status: string
          changed_at?: string
        }
        Update: {
          id?: string
          test_case_id?: string
          version?: number
          title?: string
          description?: string
          priority?: string
          status?: string
          changed_at?: string
        }
      }
      test_runs: {
        Row: {
          id: string
          project_id: string
          name: string
          tester: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          tester: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          tester?: string
          status?: string
          created_at?: string
        }
      }
      test_run_entries: {
        Row: {
          id: string
          test_run_id: string
          test_case_id: string
          status: string
          comments: string
          executed_at: string | null
        }
        Insert: {
          id?: string
          test_run_id: string
          test_case_id: string
          status?: string
          comments?: string
          executed_at?: string | null
        }
        Update: {
          id?: string
          test_run_id?: string
          test_case_id?: string
          status?: string
          comments?: string
          executed_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          message: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}