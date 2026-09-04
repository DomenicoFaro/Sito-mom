import { createClient } from "@/lib/supabase/server";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { MenuBrowser } from "@/components/MenuBrowser";

export const metadata = { title: "Menù" };

async function getMenu() {
  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order"),
  ]);

  return {
    categories: (categories as MenuCategory[]) ?? [],
    items: (items as MenuItem[]) ?? [],
  };
}

export default async function MenuPage() {
  const { categories, items } = await getMenu();

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="kicker">Il nostro menù</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
        Nigiri, sashimi, uramaki &amp; tempura
      </h1>
      <p className="mt-4 max-w-2xl text-ink-dim">
        Disponibile alla carta e in formula All You Can Eat (pranzo e cena).
        Filtra per categoria o per esigenze alimentari.
      </p>

      <MenuBrowser categories={categories} items={items} />
    </section>
  );
}
