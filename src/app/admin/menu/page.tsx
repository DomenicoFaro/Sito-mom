import { createClient } from "@/lib/supabase/server";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { MenuAdmin } from "./MenuAdmin";

export const metadata = { title: "Backoffice · Menù" };

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").order("sort_order"),
    supabase.from("menu_items").select("*").order("sort_order"),
  ]);

  return (
    <MenuAdmin
      categories={(categories as MenuCategory[]) ?? []}
      items={(items as MenuItem[]) ?? []}
    />
  );
}
