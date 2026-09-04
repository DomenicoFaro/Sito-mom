import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";

export const metadata = { title: "Backoffice · Statistiche" };

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const since = startOfToday();

  const [{ data: todayItems }, { data: allItems }, { data: menuItems }] = await Promise.all([
    supabase
      .from("order_items")
      .select("quantity, unit_price_cents, menu_item_id, created_at, status")
      .gte("created_at", since)
      .neq("status", "annullato"),
    supabase
      .from("order_items")
      .select("quantity, menu_item_id, status")
      .neq("status", "annullato")
      .limit(5000),
    supabase.from("menu_items").select("id, name"),
  ]);

  const menuById = new Map((menuItems ?? []).map((m) => [m.id, m.name]));

  const dailyRevenue = (todayItems ?? []).reduce(
    (sum, i) => sum + i.unit_price_cents * i.quantity,
    0
  );

  const byHour = new Array(24).fill(0) as number[];
  for (const i of todayItems ?? []) {
    const hour = new Date(i.created_at).getHours();
    byHour[hour] += i.quantity;
  }
  const maxHourCount = Math.max(1, ...byHour);

  const topDishesMap = new Map<string, number>();
  for (const i of allItems ?? []) {
    topDishesMap.set(i.menu_item_id, (topDishesMap.get(i.menu_item_id) ?? 0) + i.quantity);
  }
  const topDishes = [...topDishesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ name: menuById.get(id) ?? "Piatto", qty }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <h1 className="mb-6 font-serif text-2xl">Statistiche</h1>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line/70 bg-abyss-card p-6">
          <p className="kicker">Incasso di oggi</p>
          <p className="mt-3 font-serif text-4xl text-gold">{formatPrice(dailyRevenue)}</p>
        </div>

        <div className="rounded-2xl border border-line/70 bg-abyss-card p-6">
          <p className="kicker">Piatti più ordinati</p>
          <div className="mt-4 space-y-2">
            {topDishes.length === 0 && <p className="text-sm text-ink-dim">Nessun dato ancora.</p>}
            {topDishes.map((d) => (
              <div key={d.name} className="flex justify-between text-sm">
                <span>{d.name}</span>
                <span className="text-gold">{d.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line/70 bg-abyss-card p-6 sm:col-span-2">
          <p className="kicker">Ordini per fascia oraria (oggi)</p>
          <div className="mt-6 flex h-32 items-end gap-1">
            {byHour.map((count, hour) => (
              <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gold/70"
                  style={{ height: `${(count / maxHourCount) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                />
                {hour % 3 === 0 && <span className="text-[0.6rem] text-ink-dim">{hour}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
