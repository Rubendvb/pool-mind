"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteMeasurement(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("measurements")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/medicoes");
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function editMeasurement(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const poolVolumeRaw = formData.get("pool_volume") as string;
  const poolVolume = Number(poolVolumeRaw);
  if (!poolVolumeRaw || isNaN(poolVolume) || poolVolume <= 0) {
    return { error: "O volume da piscina deve ser maior que zero." };
  }

  const hardnessRaw = formData.get("hardness") as string;
  const measuredAtRaw = formData.get("measured_at") as string;

  const { error: mError } = await supabase
    .from("measurements")
    .update({
      ph: Number(formData.get("ph")),
      chlorine: Number(formData.get("chlorine")),
      alkalinity: Number(formData.get("alkalinity")),
      hardness: hardnessRaw !== "" ? Number(hardnessRaw) : null,
      notes: (formData.get("notes") as string) || null,
      ...(measuredAtRaw ? { measured_at: measuredAtRaw } : {}),
    })
    .eq("id", id);

  if (mError) return { error: mError.message };

  // Update pool volume from measurement edit form
  const { data: measurement } = await supabase
    .from("measurements")
    .select("pool_id")
    .eq("id", id)
    .single();

  if (measurement) {
    await supabase.from("pools").update({ volume: poolVolume }).eq("id", measurement.pool_id);
  }

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
