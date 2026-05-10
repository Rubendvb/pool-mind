"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    category: formData.get("category") as "piscina" | "casa" | "jardim",
    frequency: formData.get("frequency") as "diaria" | "semanal" | "quinzenal" | "mensal",
    next_due: formData.get("next_due") as string,
  });

  if (error) return { error: error.message };
  revalidatePath("/tarefas");
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tasks")
    .update({
      title: formData.get("title") as string,
      category: formData.get("category") as "piscina" | "casa" | "jardim",
      frequency: formData.get("frequency") as "diaria" | "semanal" | "quinzenal" | "mensal",
      next_due: formData.get("next_due") as string,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tarefas");
  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tarefas");
  revalidatePath("/");
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tasks")
    .update({ status: "concluida" })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tarefas");
  revalidatePath("/");
}
