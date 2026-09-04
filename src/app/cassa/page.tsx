import { createClient } from "@/lib/supabase/server";
import type { MenuItem, OrderWithItems, RestaurantTable } from "@/lib/types";
import { CassaBoard } from "./CassaBoard";

export const metadata = { title: "Cassa" };

export default async function CassaPage() {
  const supabase = await createClient();

  const [{ data: tables }, { data: orders }, { data: menuItems }] = await Promise.all([
    supabase.from("restaurant_tables").select("*").eq("active", true).order("label"),
    supabase
      .from("orders")
      .select(
        "*, restaurant_tables(id, label), order_items(*, menu_items(id, name, photo_url, category_id))"
      )
      .in("status", ["aperto", "in_attesa_conto"]),
    supabase.from("menu_items").select("*"),
  ]);

  return (
    <CassaBoard
      tables={(tables as RestaurantTable[]) ?? []}
      initialOrders={(orders as OrderWithItems[]) ?? []}
      menuItems={(menuItems as MenuItem[]) ?? []}
    />
  );
}
