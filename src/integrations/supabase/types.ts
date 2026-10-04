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
      deferral_record: {
        Row: {
          dispatcher_note: string | null
          id: string
          notified_at: string | null
          order_id: string
          plan_id: string
          priority_score: number
          reason_code: string
          score_breakdown: Json
          unavoidable: boolean
        }
        Insert: {
          dispatcher_note?: string | null
          id?: string
          notified_at?: string | null
          order_id: string
          plan_id: string
          priority_score: number
          reason_code: string
          score_breakdown: Json
          unavoidable: boolean
        }
        Update: {
          dispatcher_note?: string | null
          id?: string
          notified_at?: string | null
          order_id?: string
          plan_id?: string
          priority_score?: number
          reason_code?: string
          score_breakdown?: Json
          unavoidable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "deferral_record_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deferral_record_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "dispatch_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      depot: {
        Row: {
          active: boolean
          district_id: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          district_id?: string | null
          id: string
          name: string
        }
        Update: {
          active?: boolean
          district_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      dispatch_plan: {
        Row: {
          created_at: string
          created_by: string | null
          depot_id: string
          edit_version: number
          id: string
          plan_date: string
          published_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          depot_id: string
          edit_version?: number
          id?: string
          plan_date: string
          published_at?: string | null
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          depot_id?: string
          edit_version?: number
          id?: string
          plan_date?: string
          published_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_plan_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depot"
            referencedColumns: ["id"]
          },
        ]
      }
      district: {
        Row: {
          depot_id: string
          depot_to_district_freeflow_min: number
          depot_to_district_km: number
          id: string
          inter_stop_freeflow_min: number
          inter_stop_km: number
          name: string
        }
        Insert: {
          depot_id: string
          depot_to_district_freeflow_min: number
          depot_to_district_km: number
          id: string
          inter_stop_freeflow_min: number
          inter_stop_km: number
          name: string
        }
        Update: {
          depot_id?: string
          depot_to_district_freeflow_min?: number
          depot_to_district_km?: number
          id?: string
          inter_stop_freeflow_min?: number
          inter_stop_km?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depot"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_fine_report: {
        Row: {
          amount: number
          created_at: string
          currency: string
          driver_id: string
          id: string
          issued_at: string
          location: string | null
          reason: string
          status: string
          stop_id: string | null
          ticket_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          driver_id: string
          id?: string
          issued_at?: string
          location?: string | null
          reason: string
          status?: string
          stop_id?: string | null
          ticket_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          driver_id?: string
          id?: string
          issued_at?: string
          location?: string | null
          reason?: string
          status?: string
          stop_id?: string | null
          ticket_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_fine_report_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stop"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_fuel_log: {
        Row: {
          client_event_id: string | null
          cost: number | null
          created_at: string
          currency: string
          driver_id: string
          fuel_date: string
          id: string
          litres: number
          odometer_km: number
          receipt_reference: string | null
          station: string
          vehicle_id: string | null
        }
        Insert: {
          client_event_id?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          driver_id: string
          fuel_date: string
          id?: string
          litres: number
          odometer_km: number
          receipt_reference?: string | null
          station: string
          vehicle_id?: string | null
        }
        Update: {
          client_event_id?: string | null
          cost?: number | null
          created_at?: string
          currency?: string
          driver_id?: string
          fuel_date?: string
          id?: string
          litres?: number
          odometer_km?: number
          receipt_reference?: string | null
          station?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_fuel_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_incident_report: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          location: string | null
          notes: string | null
          reported_at: string
          status: string
          stop_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          location?: string | null
          notes?: string | null
          reported_at?: string
          status?: string
          stop_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          reported_at?: string
          status?: string
          stop_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_incident_report_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stop"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_usage: {
        Row: {
          id: string
          litres_used: number
          vehicle_id: string
          week_start: string
        }
        Insert: {
          id?: string
          litres_used?: number
          vehicle_id: string
          week_start: string
        }
        Update: {
          id?: string
          litres_used?: number
          vehicle_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_usage_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle"
            referencedColumns: ["id"]
          },
        ]
      }
      loading_defect: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          issue_type: string
          notes: string
          severity: string
          status: string
          stop_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          issue_type: string
          notes?: string
          severity: string
          status?: string
          stop_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          issue_type?: string
          notes?: string
          severity?: string
          status?: string
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loading_defect_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stop"
            referencedColumns: ["id"]
          },
        ]
      }
      loading_missing: {
        Row: {
          created_at: string
          id: string
          status: string
          stop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          stop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loading_missing_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stop"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          after_cutoff: boolean
          created_by: string | null
          days_since_last_served: number
          deferred_yesterday: boolean
          id: string
          item_description: string
          order_date: string
          order_ref: string
          order_units: number
          order_volume_m3: number
          order_weight_kg: number
          outlet_id: string
          placed_at: string
          product_brand: string
          status: string
          temp_requirement: string
        }
        Insert: {
          after_cutoff?: boolean
          created_by?: string | null
          days_since_last_served?: number
          deferred_yesterday?: boolean
          id?: string
          item_description: string
          order_date: string
          order_ref: string
          order_units: number
          order_volume_m3: number
          order_weight_kg: number
          outlet_id: string
          placed_at?: string
          product_brand: string
          status: string
          temp_requirement: string
        }
        Update: {
          after_cutoff?: boolean
          created_by?: string | null
          days_since_last_served?: number
          deferred_yesterday?: boolean
          id?: string
          item_description?: string
          order_date?: string
          order_ref?: string
          order_units?: number
          order_volume_m3?: number
          order_weight_kg?: number
          outlet_id?: string
          placed_at?: string
          product_brand?: string
          status?: string
          temp_requirement?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlet"
            referencedColumns: ["id"]
          },
        ]
      }
      outlet: {
        Row: {
          active: boolean
          address: string | null
          brand: string
          depot_id: string
          district_id: string
          dock_type: string
          id: string
          latitude: number | null
          longitude: number | null
          mall_window_end: string | null
          mall_window_start: string | null
          name: string
          parking_constraint: string
          window_close: string
          window_open: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          brand: string
          depot_id: string
          district_id: string
          dock_type: string
          id: string
          latitude?: number | null
          longitude?: number | null
          mall_window_end?: string | null
          mall_window_start?: string | null
          name: string
          parking_constraint: string
          window_close: string
          window_open: string
        }
        Update: {
          active?: boolean
          address?: string | null
          brand?: string
          depot_id?: string
          district_id?: string
          dock_type?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          mall_window_end?: string | null
          mall_window_start?: string | null
          name?: string
          parking_constraint?: string
          window_close?: string
          window_open?: string
        }
        Relationships: [
          {
            foreignKeyName: "outlet_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outlet_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "district"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          depot_id: string | null
          display_name: string | null
          email: string
          id: string
          outlet_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          depot_id?: string | null
          display_name?: string | null
          email: string
          id: string
          outlet_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          depot_id?: string | null
          display_name?: string | null
          email?: string
          id?: string
          outlet_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_of_delivery: {
        Row: {
          client_event_id: string | null
          condition_notes: string | null
          created_at: string
          delivered_units: number | null
          driver_id: string
          event_time: string
          id: string
          outcome: string
          photo_reference: string | null
          receiver_name: string | null
          short_units: number | null
          signature_reference: string | null
          stop_id: string
        }
        Insert: {
          client_event_id?: string | null
          condition_notes?: string | null
          created_at?: string
          delivered_units?: number | null
          driver_id: string
          event_time?: string
          id?: string
          outcome: string
          photo_reference?: string | null
          receiver_name?: string | null
          short_units?: number | null
          signature_reference?: string | null
          stop_id: string
        }
        Update: {
          client_event_id?: string | null
          condition_notes?: string | null
          created_at?: string
          delivered_units?: number | null
          driver_id?: string
          event_time?: string
          id?: string
          outcome?: string
          photo_reference?: string | null
          receiver_name?: string | null
          short_units?: number | null
          signature_reference?: string | null
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_of_delivery_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stop"
            referencedColumns: ["id"]
          },
        ]
      }
      service_allowance: {
        Row: {
          brand: string
          dock_type: string
          minutes: number
        }
        Insert: {
          brand: string
          dock_type: string
          minutes: number
        }
        Update: {
          brand?: string
          dock_type?: string
          minutes?: number
        }
        Relationships: []
      }
      trip: {
        Row: {
          brand: string
          district_id: string
          est_fuel_l: number
          est_km: number
          id: string
          plan_id: string
          planned_minutes: number
          started_at: string | null
          status: string
          temp_class: string
          total_volume_m3: number
          total_weight_kg: number
          trip_no: number
          vehicle_id: string
        }
        Insert: {
          brand: string
          district_id: string
          est_fuel_l: number
          est_km: number
          id?: string
          plan_id: string
          planned_minutes: number
          started_at?: string | null
          status?: string
          temp_class: string
          total_volume_m3: number
          total_weight_kg: number
          trip_no: number
          vehicle_id: string
        }
        Update: {
          brand?: string
          district_id?: string
          est_fuel_l?: number
          est_km?: number
          id?: string
          plan_id?: string
          planned_minutes?: number
          started_at?: string | null
          status?: string
          temp_class?: string
          total_volume_m3?: number
          total_weight_kg?: number
          trip_no?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "district"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "dispatch_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stop: {
        Row: {
          handling_allowance_min: number
          id: string
          loading_status: string
          note: string | null
          order_id: string
          planned_arrival: string | null
          seq: number
          status: string
          trip_id: string
        }
        Insert: {
          handling_allowance_min: number
          id?: string
          loading_status?: string
          note?: string | null
          order_id: string
          planned_arrival?: string | null
          seq: number
          status?: string
          trip_id: string
        }
        Update: {
          handling_allowance_min?: number
          id?: string
          loading_status?: string
          note?: string | null
          order_id?: string
          planned_arrival?: string | null
          seq?: number
          status?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stop_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stop_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle: {
        Row: {
          home_depot_id: string
          id: string
          km_per_l: number
          status: string
          temp: string
          type: string
          volume_cap_m3: number
          weekly_fuel_quota_l: number
          weight_cap_kg: number
        }
        Insert: {
          home_depot_id: string
          id: string
          km_per_l: number
          status: string
          temp: string
          type: string
          volume_cap_m3: number
          weekly_fuel_quota_l: number
          weight_cap_kg: number
        }
        Update: {
          home_depot_id?: string
          id?: string
          km_per_l?: number
          status?: string
          temp?: string
          type?: string
          volume_cap_m3?: number
          weekly_fuel_quota_l?: number
          weight_cap_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_home_depot_id_fkey"
            columns: ["home_depot_id"]
            isOneToOne: false
            referencedRelation: "depot"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_dispatch_draft_edit: {
        Args: {
          p_deferrals: Json
          p_expected_version: number
          p_plan_id: string
          p_trips: Json
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      my_outlet: { Args: never; Returns: string }
      my_vehicle: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "ADMIN" | "DISPATCHER" | "STOREKEEPER" | "LOADER" | "DRIVER"
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
      app_role: ["ADMIN", "DISPATCHER", "STOREKEEPER", "LOADER", "DRIVER"],
    },
  },
} as const
