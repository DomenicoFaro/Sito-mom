import { MapPin, Phone, Clock } from "lucide-react";

export const metadata = { title: "Contatti" };

export default function ContattiPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
      <p className="kicker">Contatti</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Vieni a trovarci</h1>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div className="space-y-8">
          <div className="flex gap-4">
            <MapPin className="mt-1 shrink-0 text-gold" size={22} />
            <div>
              <h2 className="font-serif text-xl">Indirizzo</h2>
              <p className="mt-1 text-ink-dim">
                Via del Bosco 134, 95125 Catania (CT)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="mt-1 shrink-0 text-gold" size={22} />
            <div>
              <h2 className="font-serif text-xl">Telefono</h2>
              <a href="tel:+39095553679" className="mt-1 block text-ink-dim hover:text-ink">
                095 553679
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Clock className="mt-1 shrink-0 text-gold" size={22} />
            <div>
              <h2 className="font-serif text-xl">Orari</h2>
              <p className="mt-1 text-ink-dim">Pranzo · 12:30 – 14:30</p>
              <p className="text-ink-dim">Cena · 19:30 – 23:00</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line/70">
          <iframe
            title="Mappa MōMA Catania"
            className="h-80 w-full grayscale invert-[0.9] contrast-[0.9] md:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Via+del+Bosco+134,+95125+Catania+CT&output=embed"
          />
        </div>
      </div>
    </section>
  );
}
