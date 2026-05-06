export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
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
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
