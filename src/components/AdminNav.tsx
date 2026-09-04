"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/admin", label: "Statistiche" },
  { href: "/admin/menu", label: "Menù" },
  { href: "/admin/tavoli", label: "Tavoli & QR" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-line/70 bg-abyss">
      <div className="mx-auto flex max-w-6xl gap-1 px-5 sm:px-8">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "border-b-2 px-3 py-3 text-sm transition",
              pathname === link.href
                ? "border-gold text-gold"
                : "border-transparent text-ink-dim hover:text-ink"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
