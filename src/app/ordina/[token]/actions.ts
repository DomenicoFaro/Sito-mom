"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MenuItem, Order } from "@/lib/types";

export interface CartLine {
  menuItemId: string;
  quantity: number;
  notes: string;
}

interface SubmitResult {
  ok: boolean;
  error?: string;
}

export async function submitOrderRound(
  orderId: string,
  qrToken: string,
  lines: CartLine[]
): Promise<SubmitResult> {
  if (!lines.length) return { ok: false, error: "Il carrello è vuoto." };

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle<Order>();

  if (!order || order.status === "chiuso" || order.status === "annullato") {
    return { ok: false, error: "L'ordine non è più attivo." };
  }

  const menuItemIds = lines.map((l) => l.menuItemId);
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .in("id", menuItemIds);

  const menuItemsById = new Map(
    ((menuItems as MenuItem[]) ?? []).map((m) => [m.id, m])
  );

  const { data: existingRounds } = await supabase
    .from("order_items")
    .select("round")
    .eq("order_id", orderId)
    .order("round", { ascending: false })
    .limit(1);

  const nextRound = ((existingRounds?.[0]?.round as number | undefined) ?? 0) + 1;

  const rows = [];
  for (const line of lines) {
    const item = menuItemsById.get(line.menuItemId);
    if (!item || !item.available) continue;

    const unitPrice =
      order.menu_mode === "ayce"
        ? item.price_cents + item.ayce_surcharge_cents
        : item.price_cents;

    rows.push({
      order_id: orderId,
      menu_item_id: item.id,
      round: nextRound,
      quantity: line.quantity,
      unit_price_cents: unitPrice,
      notes: line.notes,
      status: "ricevuto" as const,
    });
  }

  if (!rows.length) {
    return { ok: false, error: "Nessun piatto disponibile nel carrello." };
  }

  const { error } = await supabase.from("order_items").insert(rows);

  if (error) {
    return { ok: false, error: "Invio non riuscito. Riprova." };
  }

  revalidatePath(`/ordina/${qrToken}`);
  return { ok: true };
}

export async function requestBill(
  orderId: string,
  tableId: string,
  qrToken: string
): Promise<SubmitResult> {
  const supabase = await createClient();

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "in_attesa_conto" })
    .eq("id", orderId);

  const { error: tableError } = await supabase
    .from("restaurant_tables")
    .update({ status: "in_attesa_conto" })
    .eq("id", tableId);

  if (orderError || tableError) {
    return { ok: false, error: "Impossibile richiedere il conto. Chiedi al personale." };
  }

  revalidatePath(`/ordina/${qrToken}`);
  return { ok: true };
}
