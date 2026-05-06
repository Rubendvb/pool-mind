"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
