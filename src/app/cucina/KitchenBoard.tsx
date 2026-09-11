"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem, OrderItem, OrderItemStatus } from "@/lib/types";

const ACTIVE_STATUSES: OrderItemStatus[] = ["ricevuto", "in_preparazione", "pronto"];
const LATE_THRESHOLD_MS = 12 * 60 * 1000;
const AUTO_DISMISS_MS = 8000;

const NEXT_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  ricevuto: "in_preparazione",
  in_preparazione: "pronto",
};

const STATUS_LABEL: Record<OrderItemStatus, string> = {
  ricevuto: "Ricevuto",
  in_preparazione: "In preparazione",
  pronto: "Pronto",
  servito: "Servito",
  annullato: "Annullato",
};

export function KitchenBoard({
  menuItems,
  initialItems,
  initialTableByOrder,
}: {
  menuItems: MenuItem[];
  initialItems: OrderItem[];
  initialTableByOrder: Record<string, string>;
}) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [tableByOrder, setTableByOrder] = useState(initialTableByOrder);
  const [now, setNow] = useState(() => Date.now());
  const readyAt = useRef<Map<string, number>>(new Map());
  const supabase = useRef(createClient());

  const menuById = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const client = supabase.current;

    async function resolveTable(orderId: string) {
      const { data } = await client
        .from("orders")
        .select("id, restaurant_tables(label)")
        .eq("id", orderId)
        .maybeSingle<{ id: string; restaurant_tables: { label: string } | null }>();
      if (data) {
        setTableByOrder((prev) => ({ ...prev, [data.id]: data.restaurant_tables?.label ?? "Tavolo" }));
      }
    }

    const channel = client
      .channel("kitchen-order-items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as OrderItem;
            setItems((prev) => (prev.some((i) => i.id === row.id) ? prev : [...prev, row]));
            setTableByOrder((prev) => {
              if (prev[row.order_id]) return prev;
              resolveTable(row.order_id);
              return prev;
            });
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as OrderItem;
            setItems((prev) => prev.map((i) => (i.id === row.id ? row : i)));
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as OrderItem;
            setItems((prev) => prev.filter((i) => i.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const rawGroups = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    for (const item of items) {
      if (!ACTIVE_STATUSES.includes(item.status)) continue;
      const list = map.get(item.order_id) ?? [];
      list.push(item);
      map.set(item.order_id, list);
    }
    return [...map.entries()]
      .map(([orderId, list]) => ({
        orderId,
        tableLabel: tableByOrder[orderId] ?? "Tavolo",
        items: list.sort((a, b) => a.created_at.localeCompare(b.created_at)),
        earliest: Math.min(...list.map((i) => new Date(i.created_at).getTime())),
      }))
      .sort((a, b) => a.earliest - b.earliest);
  }, [items, tableByOrder]);

  // Quando tutti i piatti di un tavolo sono "Pronto", il riquadro sparisce
  // da solo dopo qualche secondo invece di restare finché sala/cassa non
  // segna il servito: la cucina ha finito il suo lavoro su quel giro.
  // `readyAt` traccia il momento in cui ogni ordine è diventato "tutto
  // pronto"; il tick di `now` ogni 2s rivaluta chi ha superato la soglia.
  for (const group of rawGroups) {
    const allReady = group.items.every((i) => i.status === "pronto");
    if (allReady) {
      if (!readyAt.current.has(group.orderId)) {
        readyAt.current.set(group.orderId, Date.now());
      }
    } else {
      readyAt.current.delete(group.orderId);
    }
  }
  for (const orderId of [...readyAt.current.keys()]) {
    if (!rawGroups.some((g) => g.orderId === orderId)) {
      readyAt.current.delete(orderId);
    }
  }

  const groups = rawGroups.filter((g) => {
    const readySince = readyAt.current.get(g.orderId);
    return !readySince || now - readySince < AUTO_DISMISS_MS;
  });

  async function advance(item: OrderItem) {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    await supabase.current.from("order_items").update({ status: next }).eq("id", item.id);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Cucina</h1>
        <span className="text-sm text-ink-dim">{groups.length} tavoli attivi</span>
      </div>

      {groups.length === 0 && (
        <p className="py-20 text-center text-ink-dim">Nessun ordine in coda al momento.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const isLate = now - group.earliest > LATE_THRESHOLD_MS;
          return (
            <div
              key={group.orderId}
              className={clsx(
                "rounded-2xl border bg-abyss-card p-4",
                isLate ? "border-lacquer" : "border-line/70"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg">{group.tableLabel}</h2>
                <span
                  className={clsx(
                    "flex items-center gap-1 text-xs",
                    isLate ? "text-lacquer-bright" : "text-ink-dim"
                  )}
                >
                  <Clock size={13} />
                  {Math.floor((now - group.earliest) / 60000)} min
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => {
                  const menuItem = menuById.get(item.menu_item_id);
                  const next = NEXT_STATUS[item.status];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line/60 bg-abyss px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {item.quantity}× {menuItem?.name ?? "Piatto"}
                        </p>
                        {item.notes && (
                          <p className="truncate text-xs text-gold">{item.notes}</p>
                        )}
                        <p className="text-[0.65rem] uppercase tracking-wide text-ink-dim">
                          {STATUS_LABEL[item.status]}
                        </p>
                      </div>
                      {next && (
                        <button
                          onClick={() => advance(item)}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-lacquer px-3 py-1.5 text-xs text-ink transition hover:bg-lacquer-bright"
                        >
                          {STATUS_LABEL[next]} <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
