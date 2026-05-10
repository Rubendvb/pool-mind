import { cache } from "react";
import { createClient } from "./server";
import type { Product, ProductApplication, ProductDosageRule } from "@/types";
import { getTodayBrazil } from "@/lib/utils/date";

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
    .is("deleted_at", null)
    .order("measured_at", { ascending: false })
    .limit(limit);
  return data ?? [];
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });
  return (data ?? []) as Product[];
});

export const getTasks = cache(async () => {
  const supabase = await createClient();
  const today = getTodayBrazil();

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

export const getDosageRules = cache(async (): Promise<ProductDosageRule[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_dosage_rules")
    .select("*")
    .eq("is_active", true);
  return (data ?? []) as ProductDosageRule[];
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

