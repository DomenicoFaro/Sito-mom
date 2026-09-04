import { DishPhoto } from "@/components/DishPhoto";

export const metadata = { title: "Galleria" };

const PLACEHOLDER_CAPTIONS = [
  "Sala principale",
  "Bancone sushi",
  "Nigiri assortiti",
  "Sashimi selezione",
  "Uramaki special",
  "Dettaglio tavolo",
  "Tempura mista",
  "Angolo lounge",
  "Ingresso",
];

export default function GalleriaPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="kicker">Galleria</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
        Il locale &amp; i piatti
      </h1>
      <p className="mt-4 max-w-2xl text-ink-dim">
        Le fotografie reali del locale e dei piatti verranno caricate qui.
        Nel frattempo, questa è la struttura della galleria fotografica.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PLACEHOLDER_CAPTIONS.map((caption, i) => (
          <DishPhoto
            key={caption}
            alt={caption}
            className={`rounded-xl border border-line/70 ${
              i % 5 === 0 ? "col-span-2 row-span-2 h-full min-h-72" : "h-40 sm:h-52"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
