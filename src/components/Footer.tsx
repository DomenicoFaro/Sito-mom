import Link from "next/link";
import { AtSign, Share2, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-abyss-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="font-serif text-2xl">MōMA</div>
          <p className="mt-3 max-w-xs text-sm text-ink-dim">
            Japanese Cuisine Gourmet nel cuore di Catania. Sushi All You Can
            Eat e alla carta, in un ambiente elegante e contemporaneo.
          </p>
          <div className="mt-5 flex gap-4 text-ink-dim">
            <Link href="#" aria-label="Instagram" className="hover:text-gold">
              <AtSign size={18} />
            </Link>
            <Link href="#" aria-label="Facebook" className="hover:text-gold">
              <Share2 size={18} />
            </Link>
          </div>
        </div>

        <div className="text-sm text-ink-dim">
          <div className="kicker mb-4">Contatti</div>
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
            Via del Bosco 134, 95125 Catania (CT)
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Phone size={16} className="shrink-0 text-gold" />
            <a href="tel:+39095553679" className="hover:text-ink">
              095 553679
            </a>
          </p>
        </div>

        <div className="text-sm text-ink-dim">
          <div className="kicker mb-4">Orari</div>
          <p>Pranzo · 12:30 – 14:30</p>
          <p>Cena · 19:30 – 23:00</p>
          <p className="mt-2 text-ink-dim/70">
            Orari indicativi, da confermare con il locale.
          </p>
        </div>
      </div>

      <div className="border-t border-line/70 px-5 py-6 text-center text-xs text-ink-dim/60 sm:px-8">
        © {new Date().getFullYear()} MōMA Catania. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
