"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMeasurement(poolId: string, formData: FormData) {
  const supabase = await createClient();

  const hardnessRaw = formData.get("hardness") as string;

  const { error } = await supabase.from("measurements").insert({
    pool_id: poolId,
    ph: Number(formData.get("ph")),
    chlorine: Number(formData.get("chlorine")),
    alkalinity: Number(formData.get("alkalinity")),
    hardness: hardnessRaw !== "" ? Number(hardnessRaw) : null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/medicoes");
  revalidatePath("/");
}
