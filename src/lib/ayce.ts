/**
 * Tariffe All You Can Eat MōMA (da leggimenu.it/menu/moma):
 * pranzo feriale 20,00€ · pranzo weekend/festivi 24,99€ + 2€ coperto ·
 * cena (tutti i giorni) 29,99€ + 2€ coperto.
 * Fascia pranzo/cena stimata sugli orari tipici del locale (11:00–16:29
 * pranzo, resto cena) in assenza di orari esatti pubblicati.
 */
export interface AyceRate {
  label: string;
  priceCents: number;
  coverCents: number;
}

const LUNCH_WEEKDAY: AyceRate = { label: "Pranzo", priceCents: 2000, coverCents: 0 };
const LUNCH_WEEKEND: AyceRate = { label: "Pranzo weekend", priceCents: 2499, coverCents: 200 };
const DINNER: AyceRate = { label: "Cena", priceCents: 2999, coverCents: 200 };

export function getCurrentAyceRate(date: Date = new Date()): AyceRate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    hour: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const isLunch = hour >= 11 && hour < 16;

  if (!isLunch) return DINNER;
  return isWeekend ? LUNCH_WEEKEND : LUNCH_WEEKDAY;
}
