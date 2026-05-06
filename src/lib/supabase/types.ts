export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          manufacturer: string | null;
          concentration: number | null;
          unit: string;
          quantity: number | null;
          expiration_date: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          dosage_reference_amount: number | null;
          dosage_reference_liters: number | null;
          dosage_effect_value: number | null;
          dosage_effect_type: string | null;
          price: number | null;
          price_unit: string | null;
          package_quantity: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          manufacturer?: string | null;
          concentration?: number | null;
          unit: string;
          quantity?: number | null;
          expiration_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          dosage_reference_amount?: number | null;
          dosage_reference_liters?: number | null;
          dosage_effect_value?: number | null;
          dosage_effect_type?: string | null;
          price?: number | null;
          price_unit?: string | null;
          package_quantity?: number | null;
        };
        Update: {
          name?: string;
          category?: string;
          manufacturer?: string | null;
          concentration?: number | null;
          unit?: string;
          quantity?: number | null;
          expiration_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
          dosage_reference_amount?: number | null;
          dosage_reference_liters?: number | null;
          dosage_effect_value?: number | null;
          dosage_effect_type?: string | null;
          price?: number | null;
          price_unit?: string | null;
          package_quantity?: number | null;
        };
        Relationships: [];
      };
      product_applications: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          product_name: string;
          measurement_id: string | null;
          quantity_used: number;
          unit: string;
          cost: number | null;
          applied_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id?: string | null;
          product_name: string;
          measurement_id?: string | null;
          quantity_used: number;
          unit: string;
          cost?: number | null;
          applied_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Record<never, never>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
        };
        Relationships: [];
      };
      pools: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          volume: number;
          type: "vinil" | "fibra" | "alvenaria";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          volume: number;
          type: "vinil" | "fibra" | "alvenaria";
          created_at?: string;
        };
        Update: {
          name?: string;
          volume?: number;
          type?: "vinil" | "fibra" | "alvenaria";
        };
        Relationships: [];
      };
      measurements: {
        Row: {
          id: string;
          pool_id: string;
          ph: number;
          chlorine: number;
          alkalinity: number;
          hardness: number | null;
          notes: string | null;
          image_url: string | null;
          measured_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          ph: number;
          chlorine: number;
          alkalinity: number;
          hardness?: number | null;
          notes?: string | null;
          image_url?: string | null;
          measured_at?: string;
        };
        Update: {
          ph?: number;
          chlorine?: number;
          alkalinity?: number;
          hardness?: number | null;
          notes?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: "piscina" | "casa" | "jardim";
          frequency: "diaria" | "semanal" | "quinzenal" | "mensal";
          next_due: string;
          status: "pendente" | "concluida" | "atrasada";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: "piscina" | "casa" | "jardim";
          frequency: "diaria" | "semanal" | "quinzenal" | "mensal";
          next_due: string;
          status?: "pendente" | "concluida" | "atrasada";
          created_at?: string;
        };
        Update: {
          title?: string;
          category?: "piscina" | "casa" | "jardim";
          frequency?: "diaria" | "semanal" | "quinzenal" | "mensal";
          next_due?: string;
          status?: "pendente" | "concluida" | "atrasada";
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      apply_product_usage: {
        Args: {
          p_user_id: string;
          p_product_id: string;
          p_quantity_used: number;
          p_unit: string;
          p_cost: number | null;
          p_measurement_id: string | null;
          p_notes: string | null;
        };
        Returns: string;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
