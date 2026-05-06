import { cache } from "react";
import { createClient } from "./server";
import type { Database } from "./types";
import type { Product, ProductApplication } from "@/types";

type MeasurementInsert = Database["public"]["Tables"]["measurements"]["Insert"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

// cache() deduplica chamadas idênticas dentro do mesmo request —
// getPool() pode ser chamado em vários Server Components sem custo extra.
export const getPool = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pools")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data;
});

export const getMeasurements = cache(async (poolId: string, limit = 10) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("measurements")
    .select("*")
    .eq("pool_id", poolId)
    .order("measured_at", { ascending: false })
    .limit(limit);
  return data ?? [];
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as Product[];
});

export const getTasks = cache(async () => {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("next_due", { ascending: true });

  return (data ?? []).map((t) => ({
    ...t,
    status:
      t.status === "pendente" && t.next_due < today
        ? ("atrasada" as const)
        : t.status,
  }));
});

export const getApplications = cache(async (limit = 20): Promise<ProductApplication[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_applications")
    .select("*")
    .order("applied_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProductApplication[];
});

export async function completeTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "concluida" })
    .eq("id", taskId);
  if (error) throw error;
}

export async function insertMeasurement(
  measurement: Omit<MeasurementInsert, "id" | "measured_at">
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("measurements")
    .insert(measurement)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertTask(
  task: Omit<TaskInsert, "id" | "user_id" | "created_at" | "status">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...task, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
