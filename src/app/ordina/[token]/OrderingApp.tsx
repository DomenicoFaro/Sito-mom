"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { ShoppingBag, Minus, Plus, X, ReceiptText, UtensilsCrossed } from "lucide-react";
import { DishPhoto } from "@/components/DishPhoto";
import { useRealtimeOrderItems } from "@/lib/useRealtimeOrderItems";
import { useRealtimeOrder } from "@/lib/useRealtimeOrder";
import {
  formatPrice,
  type MenuCategory,
  type MenuItem,
  type Order,
  type OrderItem,
  type OrderItemStatus,
  type RestaurantTable,
} from "@/lib/types";
import { requestBill, submitOrderRound, type CartLine } from "./actions";

type CartMap = Record<string, { quantity: number; notes: string }>;

const STATUS_LABEL: Record<OrderItemStatus, string> = {
  ricevuto: "Ricevuto",
  in_preparazione: "In preparazione",
  pronto: "Pronto",
  servito: "Servito",
  annullato: "Annullato",
};

const STATUS_COLOR: Record<OrderItemStatus, string> = {
  ricevuto: "bg-wood/20 text-wood",
  in_preparazione: "bg-gold/20 text-gold",
  pronto: "bg-lacquer/20 text-lacquer-bright",
  servito: "bg-ink-dim/20 text-ink-dim",
  annullato: "bg-ink-dim/10 text-ink-dim/60",
};

export function OrderingApp({
  qrToken,
  table,
  order: initialOrder,
  categories,
  items,
  initialOrderItems,
}: {
  qrToken: string;
  table: RestaurantTable;
  order: Order;
  categories: MenuCategory[];
  items: MenuItem[];
  initialOrderItems: OrderItem[];
}) {
  const order = useRealtimeOrder(initialOrder.id, initialOrder);
  const orderItems = useRealtimeOrderItems(initialOrder.id, initialOrderItems);

  const [view, setView] = useState<"menu" | "ordine">("menu");
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const storageKey = `moma-cart-${order.id}`;

  const [cart, setCart] = useState<CartMap>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // ignorabile
    }
  }, [cart, storageKey]);

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, v]) => v.quantity > 0)
        .map(([menuItemId, v]) => ({ menuItemId, ...v, item: itemsById.get(menuItemId) })),
    [cart, itemsById]
  );

  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, l) => {
    if (!l.item) return sum;
    const unit =
      order.menu_mode === "ayce"
        ? l.item.price_cents + l.item.ayce_surcharge_cents
        : l.item.price_cents;
    return sum + unit * l.quantity;
  }, 0);

  const orderTotal = orderItems
    .filter((i) => i.status !== "annullato")
    .reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);

  const rounds = useMemo(() => {
    const map = new Map<number, OrderItem[]>();
    for (const oi of orderItems) {
      const list = map.get(oi.round) ?? [];
      list.push(oi);
      map.set(oi.round, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [orderItems]);

  const orderClosed = order.status === "chiuso" || order.status === "annullato";
  const awaitingBill = order.status === "in_attesa_conto";

  function updateQty(menuItemId: string, delta: number) {
    setCart((prev) => {
      const current = prev[menuItemId]?.quantity ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [menuItemId]: { quantity: next, notes: prev[menuItemId]?.notes ?? "" } };
    });
  }

  function updateNotes(menuItemId: string, notes: string) {
    setCart((prev) => ({
      ...prev,
      [menuItemId]: { quantity: prev[menuItemId]?.quantity ?? 0, notes },
    }));
  }

  function handleSubmit() {
    setError(null);
    const lines: CartLine[] = cartLines.map((l) => ({
      menuItemId: l.menuItemId,
      quantity: l.quantity,
      notes: l.notes,
    }));

    startTransition(async () => {
      const res = await submitOrderRound(order.id, qrToken, lines);
      if (!res.ok) {
        setError(res.error ?? "Errore durante l'invio.");
        return;
      }
      setCart({});
      setCartOpen(false);
      setConfirmed(true);
      setView("ordine");
      setTimeout(() => setConfirmed(false), 3500);
    });
  }

  function handleRequestBill() {
    startTransition(async () => {
      await requestBill(order.id, table.id, qrToken);
    });
  }

  const filteredItems =
    activeCategory === "all" ? items : items.filter((i) => i.category_id === activeCategory);

  return (
    <div className="min-h-screen bg-abyss pb-28 text-ink">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-abyss/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div>
            <div className="font-serif text-lg">MōMA</div>
            <div className="text-xs text-ink-dim">{table.label}</div>
          </div>
          <div className="flex overflow-hidden rounded-full border border-line text-xs">
            <TabButton active={view === "menu"} onClick={() => setView("menu")} icon={<UtensilsCrossed size={14} />}>
              Menù
            </TabButton>
            <TabButton active={view === "ordine"} onClick={() => setView("ordine")} icon={<ReceiptText size={14} />}>
              Il mio ordine
              {orderItems.length > 0 && (
                <span className="ml-1 text-gold">{orderItems.length}</span>
              )}
            </TabButton>
          </div>
        </div>
      </header>

      {confirmed && (
        <div className="mx-auto mt-4 max-w-2xl px-5">
          <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
            Ordine inviato, in preparazione!
          </div>
        </div>
      )}

      {view === "menu" ? (
        <div className="mx-auto max-w-2xl px-5 py-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <CategoryChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
              Tutti
            </CategoryChip>
            {categories.map((c) => (
              <CategoryChip key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)}>
                {c.name}
              </CategoryChip>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {filteredItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                menuMode={order.menu_mode}
                quantity={cart[item.id]?.quantity ?? 0}
                onIncrement={() => updateQty(item.id, 1)}
                onDecrement={() => updateQty(item.id, -1)}
              />
            ))}
            {filteredItems.length === 0 && (
              <p className="py-10 text-center text-ink-dim">Nessun piatto in questa categoria.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl px-5 py-6">
          {awaitingBill && (
            <div className="mb-5 rounded-lg border border-wood/40 bg-wood/10 px-4 py-3 text-sm text-wood">
              Conto richiesto. Il personale passerà a breve.
            </div>
          )}
          {orderClosed && (
            <div className="mb-5 rounded-lg border border-line bg-abyss-card px-4 py-3 text-sm text-ink-dim">
              Il conto è stato chiuso. Grazie della visita!
            </div>
          )}

          {rounds.length === 0 && (
            <p className="py-10 text-center text-ink-dim">
              Non hai ancora inviato ordini. Torna al menù per iniziare.
            </p>
          )}

          <div className="space-y-8">
            {rounds.map(([round, roundItems]) => (
              <div key={round}>
                <p className="kicker">Giro {round}</p>
                <div className="mt-3 space-y-2">
                  {roundItems.map((oi) => {
                    const item = itemsById.get(oi.menu_item_id);
                    return (
                      <div
                        key={oi.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-abyss-card px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">
                            {oi.quantity}× {item?.name ?? "Piatto"}
                          </p>
                          {oi.notes && (
                            <p className="truncate text-xs text-ink-dim">{oi.notes}</p>
                          )}
                        </div>
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-medium tracking-wide",
                            STATUS_COLOR[oi.status]
                          )}
                        >
                          {STATUS_LABEL[oi.status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {orderItems.length > 0 && (
            <div className="mt-10 border-t border-line/70 pt-5">
              <div className="flex justify-between text-sm text-ink-dim">
                <span>Totale ordine</span>
                <span className="text-gold">{formatPrice(orderTotal)}</span>
              </div>
              {!orderClosed && !awaitingBill && (
                <button
                  onClick={handleRequestBill}
                  disabled={pending}
                  className="mt-5 w-full rounded-full border border-line py-3.5 text-sm font-medium tracking-wide text-ink transition hover:border-gold hover:text-gold disabled:opacity-60"
                >
                  Richiedi il conto
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!orderClosed && cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-5 bottom-5 z-40 flex items-center justify-between rounded-full bg-lacquer px-6 py-4 text-ink shadow-xl transition hover:bg-lacquer-bright"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag size={18} />
            {cartCount} {cartCount === 1 ? "piatto" : "piatti"}
          </span>
          <span className="text-sm font-semibold">{formatPrice(cartTotal)}</span>
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-line bg-abyss-soft thin-scroll">
            <div className="sticky top-0 flex items-center justify-between border-b border-line/70 bg-abyss-soft px-5 py-4">
              <h2 className="font-serif text-lg">Il tuo carrello</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Chiudi">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {cartLines.map((line) =>
                line.item ? (
                  <div key={line.menuItemId} className="rounded-lg border border-line/70 bg-abyss-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{line.item.name}</p>
                        <p className="mt-0.5 text-xs text-gold">
                          {formatPrice(
                            (order.menu_mode === "ayce"
                              ? line.item.price_cents + line.item.ayce_surcharge_cents
                              : line.item.price_cents) * line.quantity
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(line.menuItemId, -1)}
                          className="rounded-full border border-line p-1.5"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQty(line.menuItemId, 1)}
                          className="rounded-full border border-line p-1.5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <input
                      value={line.notes}
                      onChange={(e) => updateNotes(line.menuItemId, e.target.value)}
                      placeholder="Note (es. senza wasabi)"
                      className="mt-3 w-full rounded-md border border-line bg-abyss-soft px-3 py-2 text-xs outline-none focus:border-gold"
                    />
                  </div>
                ) : null
              )}
            </div>

            {error && <p className="px-5 pb-2 text-sm text-lacquer-bright">{error}</p>}

            <div className="sticky bottom-0 border-t border-line/70 bg-abyss-soft px-5 py-4">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-ink-dim">Totale</span>
                <span className="text-gold">{formatPrice(cartTotal)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={pending || cartCount === 0}
                className="w-full rounded-full bg-lacquer py-3.5 text-sm font-medium tracking-wide text-ink transition hover:bg-lacquer-bright disabled:opacity-60"
              >
                {pending ? "Invio in corso…" : "Invia ordine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-4 py-2 transition",
        active ? "bg-lacquer text-ink" : "text-ink-dim hover:text-ink"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition",
        active ? "border-gold bg-gold text-abyss" : "border-line text-ink-dim"
      )}
    >
      {children}
    </button>
  );
}

function ItemRow({
  item,
  menuMode,
  quantity,
  onIncrement,
  onDecrement,
}: {
  item: MenuItem;
  menuMode: "carta" | "ayce";
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const unitPrice =
    menuMode === "ayce" ? item.price_cents + item.ayce_surcharge_cents : item.price_cents;

  return (
    <div className="flex gap-4 rounded-xl border border-line/70 bg-abyss-card p-3">
      <DishPhoto src={item.photo_url} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-dim">{item.description}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gold">{formatPrice(unitPrice)}</span>
          <div className="flex items-center gap-3">
            {quantity > 0 && (
              <>
                <button onClick={onDecrement} className="rounded-full border border-line p-1.5">
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm">{quantity}</span>
              </>
            )}
            <button onClick={onIncrement} className="rounded-full bg-lacquer p-1.5 text-ink">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
