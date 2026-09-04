import { createClient } from "@/lib/supabase/server";
import type { MenuItem, OrderItem } from "@/lib/types";
import { KitchenBoard } from "./KitchenBoard";

export const metadata = { title: "Cucina" };

export default async function CucinaPage() {
  const supabase = await createClient();

  const [{ data: menuItems }, { data: rows }] = await Promise.all([
    supabase.from("menu_items").select("*"),
    supabase
      .from("order_items")
      .select("*, orders!inner(id, status, table_id, restaurant_tables(label))")
      .in("status", ["ricevuto", "in_preparazione", "pronto"])
      .in("orders.status", ["aperto", "in_attesa_conto"])
      .order("created_at", { ascending: true }),
  ]);

  const tableByOrder: Record<string, string> = {};
  for (const row of rows ?? []) {
    const orders = (row as { orders?: { id: string; restaurant_tables?: { label: string } } })
      .orders;
    if (orders) {
      tableByOrder[orders.id] = orders.restaurant_tables?.label ?? "Tavolo";
    }
  }

  return (
    <KitchenBoard
      menuItems={(menuItems as MenuItem[]) ?? []}
      initialItems={(rows as OrderItem[]) ?? []}
      initialTableByOrder={tableByOrder}
    />
  );
}
