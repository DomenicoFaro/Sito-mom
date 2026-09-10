"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { X, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatPrice,
  type MenuItem,
  type OrderWithItems,
  type RestaurantTable,
  type TableStatus,
} from "@/lib/types";
import { closeBill } from "./actions";

const STATUS_LABEL: Record<TableStatus, string> = {
  libero: "Libero",
  occupato: "Occupato",
  in_attesa_conto: "Attesa conto",
};

const STATUS_COLOR: Record<TableStatus, string> = {
  libero: "border-line/70 bg-abyss-card text-ink-dim",
  occupato: "border-gold/40 bg-gold/10 text-gold",
  in_attesa_conto: "border-lacquer/50 bg-lacquer/10 text-lacquer-bright",
};

function orderTotal(order: OrderWithItems) {
  const itemsTotal = order.order_items
    .filter((i) => i.status !== "annullato")
    .reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);
  const ayceTotal = (order.ayce_price_cents + order.ayce_cover_cents) * order.guest_count;
  return itemsTotal + ayceTotal;
}

export function CassaBoard({
  tables,
  initialOrders,
  menuItems,
}: {
  tables: RestaurantTable[];
  initialOrders: OrderWithItems[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 400);
    }

    const channel = supabase
      .channel("cassa-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, scheduleRefresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_tables" },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [router]);

  const orderByTable = new Map(initialOrders.map((o) => [o.table_id, o]));
  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;
  const selectedOrder = selectedTableId ? orderByTable.get(selectedTableId) ?? null : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <h1 className="mb-6 font-serif text-2xl">Cassa &amp; Sala</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => {
          const order = orderByTable.get(table.id);
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTableId(table.id)}
              className={clsx(
                "rounded-2xl border p-4 text-left transition hover:border-gold",
                STATUS_COLOR[table.status]
              )}
            >
              <p className="font-serif text-lg text-ink">{table.label}</p>
              <p className="mt-1 text-xs">{STATUS_LABEL[table.status]}</p>
              {order && (
                <p className="mt-3 text-sm font-medium text-ink">
                  {formatPrice(orderTotal(order))}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <TableDetail
          table={selectedTable}
          order={selectedOrder}
          menuItems={menuItems}
          onClose={() => setSelectedTableId(null)}
        />
      )}
    </div>
  );
}

function TableDetail({
  table,
  order,
  menuItems,
  onClose,
}: {
  table: RestaurantTable;
  order: OrderWithItems | null;
  menuItems: MenuItem[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const menuById = new Map(menuItems.map((m) => [m.id, m]));

  async function markServed(itemId: string) {
    const supabase = createClient();
    await supabase.from("order_items").update({ status: "servito" }).eq("id", itemId);
  }

  function handleClose() {
    if (!order) return;
    if (!confirm(`Chiudere il conto per ${table.label}?`)) return;
    startTransition(async () => {
      await closeBill(order.id, table.id);
      onClose();
    });
  }

  const rounds = new Map<number, OrderWithItems["order_items"]>();
  for (const item of order?.order_items ?? []) {
    const list = rounds.get(item.round) ?? [];
    list.push(item);
    rounds.set(item.round, list);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-line bg-abyss-soft thin-scroll">
        <div className="sticky top-0 flex items-center justify-between border-b border-line/70 bg-abyss-soft px-5 py-4">
          <h2 className="font-serif text-xl">{table.label}</h2>
          <button onClick={onClose} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {!order && <p className="text-ink-dim">Nessun ordine attivo per questo tavolo.</p>}

          {[...rounds.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([round, items]) => (
              <div key={round}>
                <p className="kicker">Giro {round}</p>
                <div className="mt-2 space-y-2">
                  {items.map((item) => {
                    const menuItem = menuById.get(item.menu_item_id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-abyss-card px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">
                            {item.quantity}× {menuItem?.name ?? "Piatto"}
                          </p>
                          {item.notes && (
                            <p className="truncate text-xs text-gold">{item.notes}</p>
                          )}
                          <p className="text-[0.65rem] uppercase tracking-wide text-ink-dim">
                            {item.status}
                          </p>
                        </div>
                        {item.status === "pronto" && (
                          <button
                            onClick={() => markServed(item.id)}
                            className="flex shrink-0 items-center gap-1 rounded-full border border-gold px-3 py-1.5 text-xs text-gold"
                          >
                            <CheckCircle2 size={13} /> Servito
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {order && (
          <div className="sticky bottom-0 border-t border-line/70 bg-abyss-soft px-5 py-4">
            <div className="mb-2 space-y-1 text-xs text-ink-dim">
              <div className="flex justify-between">
                <span>
                  AYCE × {order.guest_count} {order.guest_count === 1 ? "persona" : "persone"}
                </span>
                <span>{formatPrice(order.ayce_price_cents * order.guest_count)}</span>
              </div>
              {order.ayce_cover_cents > 0 && (
                <div className="flex justify-between">
                  <span>Coperto × {order.guest_count}</span>
                  <span>{formatPrice(order.ayce_cover_cents * order.guest_count)}</span>
                </div>
              )}
            </div>
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-ink-dim">Totale conto</span>
              <span className="text-lg text-gold">{formatPrice(orderTotal(order))}</span>
            </div>
            <button
              onClick={handleClose}
              disabled={pending}
              className="w-full rounded-full bg-lacquer py-3.5 text-sm font-medium tracking-wide text-ink transition hover:bg-lacquer-bright disabled:opacity-60"
            >
              {pending ? "Chiusura…" : "Chiudi conto"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
