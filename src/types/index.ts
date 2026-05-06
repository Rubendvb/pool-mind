export type PoolType = "vinil" | "fibra" | "alvenaria";

export interface Pool {
  id: string;
  user_id: string;
  name: string;
  volume: number; // litros
  type: PoolType;
  created_at: string;
}

export type ParameterStatus = "ok" | "warning" | "danger" | "unknown";

export interface ChemicalParameter {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  ideal: { min: number; max: number };
  status: ParameterStatus;
}

export interface Measurement {
  id: string;
  pool_id: string;
  measured_at: string; // ISO string
  ph: number;
  chlorine: number; // cloro livre (mg/L)
  alkalinity: number; // alcalinidade total (ppm)
  hardness: number | null; // dureza (mg/L) — opcional
  notes?: string | null;
  image_url?: string | null;
}

export type TaskCategory = "piscina" | "casa" | "jardim";
export type TaskFrequency = "diaria" | "semanal" | "quinzenal" | "mensal";
export type TaskStatus = "pendente" | "concluida" | "atrasada";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  next_due: string; // date string YYYY-MM-DD
  status: TaskStatus;
  created_at: string;
}

export type ProductCategory =
  | "chlorine"
  | "ph_up"
  | "ph_down"
  | "alkalinity_up"
  | "algaecide"
  | "clarifier"
  | "stabilizer"
  | "hardness_up"
  | "other";

export type ProductUnit = "g" | "kg" | "ml" | "L";

export type DosageEffectType =
  | "ph_delta"
  | "chlorine_ppm"
  | "alkalinity_ppm"
  | "hardness_ppm";

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  manufacturer: string | null;
  concentration: number | null; // percentual, ex: 90 para 90%
  unit: ProductUnit;
  quantity: number | null; // disponível; null = ilimitado
  expiration_date: string | null; // YYYY-MM-DD
  notes: string | null;
  is_active: boolean;
  created_at: string;
  // Phase 2: custom dosage formula
  dosage_reference_amount: number | null;
  dosage_reference_liters: number | null;
  dosage_effect_value: number | null;
  dosage_effect_type: DosageEffectType | null;
  // Phase 3: financial
  price: number | null;            // package price in BRL
  price_unit: ProductUnit | null;  // unit of package_quantity
  package_quantity: number | null; // quantity per package in price_unit
}

export interface DosageRecommendation {
  product: string;
  amount: number;
  unit: string;
  action: "add" | "reduce" | "none";
  priority: "urgent" | "soon" | "ok";
  productId?: string; // ID of the user's product when matched; undefined for generic fallbacks
}

export interface ProductApplication {
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
}
