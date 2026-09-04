import Link from "next/link";
import { ChefHat, LayoutDashboard, ReceiptText, LogOut } from "lucide-react";
import { signOut } from "@/app/staff/login/actions";
import type { StaffProfile } from "@/lib/types";

const NAV = [
  { href: "/cucina", label: "Cucina", icon: ChefHat, roles: ["cucina", "admin"] },
  { href: "/cassa", label: "Cassa / Sala", icon: ReceiptText, roles: ["sala", "cassa", "admin"] },
  { href: "/admin", label: "Backoffice", icon: LayoutDashboard, roles: ["admin"] },
];

export function StaffHeader({ profile }: { profile: StaffProfile }) {
  const visible = NAV.filter((n) => n.roles.includes(profile.role));

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-abyss-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <span className="font-serif text-lg text-ink">MōMA</span>
          <nav className="flex gap-1">
            {visible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-dim transition hover:bg-abyss-card hover:text-ink"
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-dim">
            {profile.full_name}{" "}
            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold">
              {profile.role}
            </span>
          </span>
          <form action={signOut}>
            <button
              className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-lacquer-bright"
              aria-label="Esci"
            >
              <LogOut size={14} /> Esci
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
