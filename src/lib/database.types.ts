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
      objectives: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          category: string
          start_date: string
          end_date: string
          progress: number
          user_id: string
          status: string
        }
        Insert: Omit<Database['public']['Tables']['objectives']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['objectives']['Row']>
      }
      key_results: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          description: string
          target_value: number
          current_value: number
          unit: string
          start_date: string
          end_date: string
          progress: number
          objective_id: string
          status: string
        }
        Insert: Omit<Database['public']['Tables']['key_results']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['key_results']['Row']>
      }
      user_categories: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
        }
        Insert: Omit<Database['public']['Tables']['user_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_categories']['Row']>
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
  }
}
