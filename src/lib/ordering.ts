import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MenuType, Order, RestaurantTable } from "@/lib/types";

export type ResolveResult =
  | { ok: true; table: RestaurantTable; order: Order }
  | { ok: false; reason: "not_found" | "inactive" };

/**
 * Risolve il tavolo dal token del QR code e trova (o crea) l'ordine aperto
 * per quella sessione. Non richiede login: il token stesso è la chiave di
 * accesso pubblica del tavolo.
 */
export async function resolveTableAndOrder(
  qrToken: string
): Promise<ResolveResult> {
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (!table) return { ok: false, reason: "not_found" };
  if (!table.active) return { ok: false, reason: "inactive" };

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("*")
    .eq("table_id", table.id)
    .in("status", ["aperto", "in_attesa_conto"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOrder) {
    return { ok: true, table, order: existingOrder as Order };
  }

  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({ table_id: table.id, status: "aperto", menu_mode: "ayce" as MenuType })
    .select("*")
    .single();

  if (error || !newOrder) {
    return { ok: false, reason: "not_found" };
  }

  if (table.status === "libero") {
    await supabase
      .from("restaurant_tables")
      .update({ status: "occupato" })
      .eq("id", table.id);
  }

  return { ok: true, table, order: newOrder as Order };
}
