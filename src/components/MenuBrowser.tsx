"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { DishPhoto } from "@/components/DishPhoto";
import { formatPrice, type MenuCategory, type MenuItem } from "@/lib/types";

const TAG_LABELS: Record<string, string> = {
  piccante: "Piccante",
  vegetariano: "Vegetariano",
  gluten_free: "Gluten Free",
  nuovo: "Novità",
  best_seller: "Best seller",
};

export function MenuBrowser({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== "all" && item.category_id !== activeCategory) {
        return false;
      }
      if (activeTag && !item.tags.includes(activeTag)) {
        return false;
      }
      return true;
    });
  }, [items, activeCategory, activeTag]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category_id) ?? [];
      list.push(item);
      map.set(item.category_id, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          Tutte le categorie
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(TAG_LABELS).map(([tag, label]) => (
          <FilterChip
            key={tag}
            variant="gold"
            active={activeTag === tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-14 space-y-16">
        {categories
          .filter((cat) => grouped.has(cat.id))
          .map((cat) => (
            <div key={cat.id}>
              <h2 className="font-serif text-2xl text-gold">{cat.name}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.get(cat.id)!.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}

        {filtered.length === 0 && (
          <p className="text-ink-dim">
            Nessun piatto trovato con questi filtri.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "gold";
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition",
        active
          ? variant === "gold"
            ? "border-gold bg-gold text-abyss"
            : "border-lacquer bg-lacquer text-ink"
          : "border-line text-ink-dim hover:border-gold hover:text-gold"
      )}
    >
      {children}
    </button>
  );
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-abyss-card transition hover:border-gold/50">
      <DishPhoto src={item.photo_url} alt={item.name} className="h-48 w-full" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
          {item.price_cents > 0 && (
            <span className="shrink-0 text-sm text-gold">
              {formatPrice(item.price_cents)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-ink-dim">{item.description}</p>
        )}
        {item.ayce_surcharge_cents > 0 && (
          <p className="mt-2 text-xs text-wood">
            + {formatPrice(item.ayce_surcharge_cents)} supplemento in formula
            AYCE
          </p>
        )}
        {(item.tags.length > 0 || item.allergens.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gold/10 px-2.5 py-1 text-[0.65rem] tracking-wide text-gold"
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
            {item.allergens.map((a) => (
              <span
                key={a}
                className="rounded-full bg-abyss-soft px-2.5 py-1 text-[0.65rem] tracking-wide text-ink-dim"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
