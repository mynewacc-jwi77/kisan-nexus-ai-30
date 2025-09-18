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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_logs: {
        Row: {
          created_at: string | null
          farmer_id: string
          id: string
          language: string
          message: string
          response: string
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          farmer_id: string
          id?: string
          language: string
          message: string
          response: string
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          farmer_id?: string
          id?: string
          language?: string
          message?: string
          response?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string | null
          crop_type: string
          disease_history: Json | null
          farmer_id: string
          id: string
          planting_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_type: string
          disease_history?: Json | null
          farmer_id: string
          id?: string
          planting_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_type?: string
          disease_history?: Json | null
          farmer_id?: string
          id?: string
          planting_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      disease_reports: {
        Row: {
          confidence_score: number
          created_at: string | null
          detected_disease: string
          farmer_id: string
          id: string
          image_url: string
          timestamp: string | null
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          detected_disease: string
          farmer_id: string
          id?: string
          image_url: string
          timestamp?: string | null
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          detected_disease?: string
          farmer_id?: string
          id?: string
          image_url?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disease_reports_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          availability: boolean
          created_at: string | null
          id: string
          image_url: string
          location: string
          owner_id: string
          rent_price: number
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: boolean
          created_at?: string | null
          id?: string
          image_url: string
          location: string
          owner_id: string
          rent_price: number
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: boolean
          created_at?: string | null
          id?: string
          image_url?: string
          location?: string
          owner_id?: string
          rent_price?: number
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          created_at: string | null
          id: string
          land_size: number
          languages: string[]
          location: string
          name: string
          shc_details: string | null
          soil_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          land_size: number
          languages?: string[]
          location: string
          name: string
          shc_details?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          land_size?: number
          languages?: string[]
          location?: string
          name?: string
          shc_details?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          gateway_payment_id: string | null
          gateway_transaction_id: string | null
          id: string
          payee_id: string
          payer_id: string
          payment_gateway: string
          payment_method: string
          refunded_at: string | null
          rental_id: string
          status: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          gateway_payment_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payee_id: string
          payer_id: string
          payment_gateway?: string
          payment_method?: string
          refunded_at?: string | null
          rental_id: string
          status?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          gateway_payment_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payee_id?: string
          payer_id?: string
          payment_gateway?: string
          payment_method?: string
          refunded_at?: string | null
          rental_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          farm_size: number | null
          id: string
          languages: string[] | null
          location: string
          name: string
          phone: string | null
          soil_type: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          farm_size?: number | null
          id: string
          languages?: string[] | null
          location: string
          name: string
          phone?: string | null
          soil_type?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          farm_size?: number | null
          id?: string
          languages?: string[] | null
          location?: string
          name?: string
          phone?: string | null
          soil_type?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      rentals: {
        Row: {
          created_at: string | null
          equipment_id: string
          id: string
          rental_date: string
          renter_id: string
          return_date: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          id?: string
          rental_date: string
          renter_id: string
          return_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          id?: string
          rental_date?: string
          renter_id?: string
          return_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rentals_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_info: {
        Row: {
          created_at: string | null
          description: string
          eligibility: string
          id: string
          link: string
          scheme_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          eligibility: string
          id?: string
          link: string
          scheme_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          eligibility?: string
          id?: string
          link?: string
          scheme_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weather_logs: {
        Row: {
          created_at: string | null
          forecast_date: string
          id: string
          location: string
          updated_at: string | null
          weather_data: Json
        }
        Insert: {
          created_at?: string | null
          forecast_date: string
          id?: string
          location: string
          updated_at?: string | null
          weather_data: Json
        }
        Update: {
          created_at?: string | null
          forecast_date?: string
          id?: string
          location?: string
          updated_at?: string | null
          weather_data?: Json
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
