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
  alkalinity: number; // alcalinidade total (mg/L)
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

export interface DosageRecommendation {
  product: string;
  amount: number;
  unit: string;
  action: "add" | "reduce" | "none";
  priority: "urgent" | "soon" | "ok";
}
