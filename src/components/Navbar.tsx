"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menù" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/galleria", label: "Galleria" },
  { href: "/prenotazioni", label: "Prenotazioni" },
  { href: "/contatti", label: "Contatti" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-abyss/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-serif text-xl tracking-wide">
          MōMA
          <span className="ml-2 hidden text-[0.65rem] font-sans font-normal tracking-[0.3em] text-gold sm:inline">
            CATANIA
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm tracking-wide transition-colors hover:text-gold",
                pathname === link.href ? "text-gold" : "text-ink-dim"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="text-ink md:hidden"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line/70 bg-abyss px-5 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "rounded px-2 py-3 text-sm",
                pathname === link.href
                  ? "text-gold"
                  : "text-ink-dim hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
