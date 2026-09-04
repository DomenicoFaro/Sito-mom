import { DishPhoto } from "@/components/DishPhoto";

export const metadata = { title: "Chi siamo" };

export default function ChiSiamoPage() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
      <p className="kicker">La nostra filosofia</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
        Tradizione giapponese, cuore siciliano.
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-dim">
        <p>
          MōMA nasce a Catania con un&apos;idea semplice: portare la cucina
          giapponese gourmet in un ambiente elegante e accogliente, dove la
          qualità della materia prima non è mai un compromesso.
        </p>
        <p>
          Ogni giorno selezioniamo pesce fresco per comporre nigiri, sashimi
          e uramaki secondo le tecniche tradizionali, affiancati da una
          formula All You Can Eat pensata per chi vuole scoprire l&apos;intero
          menù senza rinunciare a nulla.
        </p>
        <p>
          Il nostro spazio unisce linee minimali e materiali naturali — legno
          chiaro, pietra, luce calda — per un&apos;esperienza che è tanto
          visiva quanto gustativa.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {["L'ambiente", "Lo staff", "La materia prima"].map((label) => (
          <DishPhoto
            key={label}
            alt={label}
            className="h-56 rounded-2xl border border-line/70"
          />
        ))}
      </div>
    </section>
  );
}
