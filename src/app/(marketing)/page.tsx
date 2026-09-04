import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DishPhoto } from "@/components/DishPhoto";
import { formatPrice, type MenuItem } from "@/lib/types";

async function getSignatureDishes(): Promise<MenuItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("available", true)
    .contains("tags", ["best_seller"])
    .limit(4);
  return (data as MenuItem[]) ?? [];
}

export default async function HomePage() {
  const dishes = await getSignatureDishes();

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden border-b border-line/70">
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/70 to-abyss" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(201,163,90,0.12),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-40 sm:px-8">
          <p className="kicker fade-in">Catania · Japanese Cuisine Gourmet</p>
          <h1 className="fade-in mt-5 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-7xl">
            L&apos;arte del sushi,{" "}
            <span className="italic text-gold">servita al tavolo.</span>
          </h1>
          <p className="fade-in mt-6 max-w-xl text-base text-ink-dim sm:text-lg">
            Nigiri, sashimi e uramaki preparati con pesce fresco selezionato.
            Menù All You Can Eat e alla carta, in un ambiente elegante nel
            cuore di Catania.
          </p>
          <div className="fade-in mt-9 flex flex-wrap gap-4">
            <Link
              href="/prenotazioni"
              className="rounded-full bg-lacquer px-7 py-3.5 text-sm font-medium tracking-wide text-ink transition hover:bg-lacquer-bright"
            >
              Prenota un tavolo
            </Link>
            <Link
              href="/menu"
              className="group flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-medium tracking-wide text-ink transition hover:border-gold hover:text-gold"
            >
              Scopri il menù
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="border-b border-line/70 bg-abyss-soft">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-sm text-ink-dim sm:px-8 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-gold" />
            Via del Bosco 134, 95125 Catania (CT)
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gold" />
            Pranzo 12:30–14:30 · Cena 19:30–23:00
          </div>
        </div>
      </section>

      {/* SIGNATURE DISHES */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="kicker">Selezione dello chef</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              I piatti signature
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden items-center gap-2 text-sm text-gold hover:underline sm:flex"
          >
            Menù completo <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(dishes.length
            ? dishes
            : Array.from({ length: 4 }).map((_, i) => ({
                id: String(i),
                name: "Piatto signature",
                price_cents: 0,
                photo_url: null,
              }))
          ).map((dish) => (
            <div
              key={dish.id}
              className="group overflow-hidden rounded-2xl border border-line/70 bg-abyss-card"
            >
              <DishPhoto
                src={dish.photo_url}
                alt={dish.name}
                className="h-56 w-full transition duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <h3 className="font-serif text-lg">{dish.name}</h3>
                {"price_cents" in dish && dish.price_cents > 0 && (
                  <p className="mt-1 text-sm text-gold">
                    {formatPrice(dish.price_cents)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QR ORDERING TEASER */}
      <section className="border-y border-line/70 bg-abyss-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <p className="kicker">Al tuo tavolo</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Ordina dal tuo smartphone, senza app.
            </h2>
            <p className="mt-4 max-w-md text-ink-dim">
              Inquadra il QR code sul tavolo per sfogliare il menù fotografico
              completo, comporre il tuo ordine e inviarlo direttamente in
              cucina, in tempo reale.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="flex h-52 w-52 items-center justify-center rounded-3xl border border-gold/30 bg-abyss-card">
              <span className="font-serif text-sm text-ink-dim">
                QR al tavolo
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
