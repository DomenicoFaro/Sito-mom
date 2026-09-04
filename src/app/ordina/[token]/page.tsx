import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveTableAndOrder } from "@/lib/ordering";
import type { MenuCategory, MenuItem, OrderItem } from "@/lib/types";
import { OrderingApp } from "./OrderingApp";

export const metadata = { title: "Ordina al tavolo" };

export default async function OrdinaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await resolveTableAndOrder(token);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-abyss px-6 text-center text-ink">
        <h1 className="font-serif text-2xl">Tavolo non disponibile</h1>
        <p className="mt-3 max-w-sm text-ink-dim">
          Questo tavolo non è al momento attivo. Chiedi al personale di sala
          di assisterti.
        </p>
      </div>
    );
  }

  const { table, order } = result;
  const supabase = await createClient();

  const [{ data: categories }, { data: items }, { data: orderItems }] =
    await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase
        .from("menu_items")
        .select("*")
        .eq("available", true)
        .order("sort_order"),
      supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("round", { ascending: true }),
    ]);

  return (
    <OrderingApp
      qrToken={token}
      table={table}
      order={order}
      categories={(categories as MenuCategory[]) ?? []}
      items={(items as MenuItem[]) ?? []}
      initialOrderItems={(orderItems as OrderItem[]) ?? []}
    />
  );
}
