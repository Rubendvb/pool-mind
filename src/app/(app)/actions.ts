"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function confirmProductApplication(
  productId: string,
  quantityUsed: number,
  unit: string,
  cost: number | null,
  measurementId: string | null,
  notes: string | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.rpc("apply_product_usage", {
    p_user_id: user.id,
    p_product_id: productId,
    p_quantity_used: quantityUsed,
    p_unit: unit,
    p_cost: cost,
    p_measurement_id: measurementId,
    p_notes: notes,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/insights");
  revalidatePath("/produtos");
}

export async function updatePoolVolume(poolId: string, volume: number) {
  if (!volume || volume <= 0 || isNaN(volume)) {
    return { error: "O volume deve ser maior que zero" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("pools")
    .update({ volume })
    .eq("id", poolId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/insights");
  revalidatePath("/medicoes");
}

export async function createPool(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("pools").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    volume: Number(formData.get("volume")),
    type: formData.get("type") as "vinil" | "fibra" | "alvenaria",
  });

  if (error) return { error: error.message };
  revalidatePath("/");
}
