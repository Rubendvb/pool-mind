"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";

export async function deleteMeasurement(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // measurements don't have user_id — ownership is verified through the pool
  const { data: pool } = await supabase
    .from("pools")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pool) return { error: "Piscina não encontrada" };

  const { error } = await supabase
    .from("measurements")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("pool_id", pool.id);

  if (error) {
    log({ level: "error", action: "deleteMeasurement", userId: user.id, measurementId: id, error: error.message });
    return { error: error.message };
  }

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

  // Verify pool ownership first — measurements don't have user_id directly.
  // This also avoids the extra post-update query that used to fetch pool_id.
  const { data: pool } = await supabase
    .from("pools")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pool) return { error: "Piscina não encontrada" };

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
    .eq("id", id)
    .eq("pool_id", pool.id);

  if (mError) {
    log({ level: "error", action: "editMeasurement", userId: user.id, measurementId: id, error: mError.message });
    return { error: mError.message };
  }

  await supabase.from("pools").update({ volume: poolVolume }).eq("id", pool.id);

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

  if (error) {
    log({ level: "error", action: "addMeasurement", userId: user.id, poolId, error: error.message });
    return { error: error.message };
  }

  revalidatePath("/medicoes");
  revalidatePath("/");
  revalidatePath("/insights");
}
