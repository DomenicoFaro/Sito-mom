"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTable(formData: FormData) {
  const supabase = await createClient();
  const label = String(formData.get("label") ?? "").trim();
  const seats = Number(formData.get("seats") ?? 2);
  if (!label) return;
  await supabase.from("restaurant_tables").insert({ label, seats });
  revalidatePath("/admin/tavoli");
}

export async function renameTable(id: string, label: string, seats: number) {
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ label, seats }).eq("id", id);
  revalidatePath("/admin/tavoli");
}

export async function toggleTableActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ active }).eq("id", id);
  revalidatePath("/admin/tavoli");
}

export async function regenerateQr(id: string) {
  const supabase = await createClient();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  await supabase.from("restaurant_tables").update({ qr_token: token }).eq("id", id);
  revalidatePath("/admin/tavoli");
}

export async function resetTableToFree(id: string) {
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ status: "libero" }).eq("id", id);
  revalidatePath("/admin/tavoli");
}
