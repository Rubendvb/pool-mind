"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parseOptionalNumber(raw: string | null): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw);
  return isNaN(n) ? null : n;
}

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name: (formData.get("name") as string).trim(),
    category: formData.get("category") as string,
    manufacturer: (formData.get("manufacturer") as string) || null,
    concentration: parseOptionalNumber(formData.get("concentration") as string),
    unit: formData.get("unit") as string,
    quantity: parseOptionalNumber(formData.get("quantity") as string),
    expiration_date: (formData.get("expiration_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
    is_active: true,
    dosage_reference_amount: parseOptionalNumber(formData.get("dosage_reference_amount") as string),
    dosage_reference_liters: parseOptionalNumber(formData.get("dosage_reference_liters") as string),
    dosage_effect_value: parseOptionalNumber(formData.get("dosage_effect_value") as string),
    dosage_effect_type: (formData.get("dosage_effect_type") as string) || null,
    price: parseOptionalNumber(formData.get("price") as string),
    price_unit: (formData.get("price_unit") as string) || null,
    package_quantity: parseOptionalNumber(formData.get("package_quantity") as string),
  });

  if (error) return { error: error.message };
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("products")
    .update({
      name: (formData.get("name") as string).trim(),
      category: formData.get("category") as string,
      manufacturer: (formData.get("manufacturer") as string) || null,
      concentration: parseOptionalNumber(formData.get("concentration") as string),
      unit: formData.get("unit") as string,
      quantity: parseOptionalNumber(formData.get("quantity") as string),
      expiration_date: (formData.get("expiration_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
      dosage_reference_amount: parseOptionalNumber(formData.get("dosage_reference_amount") as string),
      dosage_reference_liters: parseOptionalNumber(formData.get("dosage_reference_liters") as string),
      dosage_effect_value: parseOptionalNumber(formData.get("dosage_effect_value") as string),
      dosage_effect_type: (formData.get("dosage_effect_type") as string) || null,
      price: parseOptionalNumber(formData.get("price") as string),
      price_unit: (formData.get("price_unit") as string) || null,
      package_quantity: parseOptionalNumber(formData.get("package_quantity") as string),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/produtos");
  revalidatePath("/");
}
