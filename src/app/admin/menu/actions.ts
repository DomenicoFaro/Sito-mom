"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MenuType } from "@/lib/types";

export async function upsertCategory(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const sort_order = Number(formData.get("sort_order") ?? 0);
  if (!name) return;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (id) {
    await supabase.from("menu_categories").update({ name, sort_order, slug }).eq("id", id);
  } else {
    await supabase.from("menu_categories").insert({ name, sort_order, slug });
  }
  revalidatePath("/admin/menu");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("menu_categories").delete().eq("id", id);
  revalidatePath("/admin/menu");
}

export async function upsertMenuItem(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();

  const payload = {
    category_id: String(formData.get("category_id")),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
    menu_type: String(formData.get("menu_type") ?? "ayce") as MenuType,
    ayce_surcharge_cents: Math.round(Number(formData.get("surcharge") ?? 0) * 100),
    photo_url: String(formData.get("photo_url") ?? "") || null,
    allergens: String(formData.get("allergens") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tags: formData.getAll("tags").map(String),
    available: formData.get("available") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (!payload.name || !payload.category_id) return;

  if (id) {
    await supabase.from("menu_items").update(payload).eq("id", id);
  } else {
    await supabase.from("menu_items").insert(payload);
  }
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient();
  await supabase.from("menu_items").delete().eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function toggleAvailability(id: string, available: boolean) {
  const supabase = await createClient();
  await supabase.from("menu_items").update({ available }).eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}
