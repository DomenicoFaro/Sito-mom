import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAyceRate } from "@/lib/ayce";
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

  const rate = getCurrentAyceRate();
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      table_id: table.id,
      status: "aperto",
      menu_mode: "ayce" as MenuType,
      guest_count: table.seats,
      ayce_price_cents: rate.priceCents,
      ayce_cover_cents: rate.coverCents,
    })
    .select("*")
    .single();

  if (error || !newOrder) {
    return { ok: false, reason: "not_found" };
  }

  if (table.status === "libero") {
    await supabase.rpc("mark_table_occupied", { p_table_id: table.id });
  }

  return { ok: true, table, order: newOrder as Order };
}
