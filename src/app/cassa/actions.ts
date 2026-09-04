"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function closeBill(orderId: string, tableId: string) {
  const supabase = await createClient();

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "chiuso", closed_at: new Date().toISOString() })
    .eq("id", orderId);

  const { error: tableError } = await supabase
    .from("restaurant_tables")
    .update({ status: "libero" })
    .eq("id", tableId);

  revalidatePath("/cassa");
  return { ok: !orderError && !tableError };
}
