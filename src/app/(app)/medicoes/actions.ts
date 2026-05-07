"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteMeasurement(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // RLS garante que só o dono pode deletar; o join valida ownership implicitamente
  const { error } = await supabase
    .from("measurements")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/medicoes");
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function addMeasurement(poolId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const poolVolumeRaw = formData.get("pool_volume") as string;
  const poolVolume = Number(poolVolumeRaw);
  if (!poolVolumeRaw || isNaN(poolVolume) || poolVolume <= 0) {
    return { error: "O volume da piscina deve ser maior que zero." };
  }

  const { error: poolError } = await supabase
    .from("pools")
    .update({ volume: poolVolume })
    .eq("id", poolId);

  if (poolError) return { error: poolError.message };

  const hardnessRaw = formData.get("hardness") as string;
  const measuredAtRaw = formData.get("measured_at") as string;

  const { error } = await supabase.from("measurements").insert({
    pool_id: poolId,
    ph: Number(formData.get("ph")),
    chlorine: Number(formData.get("chlorine")),
    alkalinity: Number(formData.get("alkalinity")),
    hardness: hardnessRaw !== "" ? Number(hardnessRaw) : null,
    notes: (formData.get("notes") as string) || null,
    ...(measuredAtRaw ? { measured_at: measuredAtRaw } : {}),
  });

  if (error) return { error: error.message };

  revalidatePath("/medicoes");
  revalidatePath("/");
  revalidatePath("/insights");
}
