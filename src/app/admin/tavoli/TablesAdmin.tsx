"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import clsx from "clsx";
import { Download, RefreshCcw, Plus } from "lucide-react";
import type { RestaurantTable, TableStatus } from "@/lib/types";
import { createTable, regenerateQr, resetTableToFree, toggleTableActive } from "./actions";

const STATUS_LABEL: Record<TableStatus, string> = {
  libero: "Libero",
  occupato: "Occupato",
  in_attesa_conto: "Attesa conto",
};

const STATUS_COLOR: Record<TableStatus, string> = {
  libero: "text-ink-dim",
  occupato: "text-gold",
  in_attesa_conto: "text-lacquer-bright",
};

export function TablesAdmin({ tables }: { tables: RestaurantTable[] }) {
  const [origin] = useState(() => {
    const fixed = process.env.NEXT_PUBLIC_SITE_URL;
    if (fixed) return fixed.replace(/\/$/, "");
    return typeof window !== "undefined" ? window.location.origin : "";
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Tavoli &amp; QR code</h1>
      </div>

      <form action={createTable} className="mb-8 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Nome tavolo</label>
          <input
            name="label"
            required
            placeholder="Tavolo 9"
            className="rounded-lg border border-line bg-abyss-soft px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Posti</label>
          <input
            name="seats"
            type="number"
            defaultValue={2}
            min={1}
            className="w-20 rounded-lg border border-line bg-abyss-soft px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full bg-lacquer px-4 py-2 text-sm text-ink hover:bg-lacquer-bright"
        >
          <Plus size={15} /> Aggiungi tavolo
        </button>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} origin={origin} />
        ))}
      </div>
    </div>
  );
}

function TableCard({ table, origin }: { table: RestaurantTable; origin: string }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const url = origin ? `${origin}/ordina/${table.qr_token}` : "";

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#0b0b0a", light: "#f5f1e8" } }).then(
      setQrDataUrl
    );
  }, [url]);

  function download() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${table.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className={clsx("rounded-2xl border border-line/70 bg-abyss-card p-5", !table.active && "opacity-50")}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-lg">{table.label}</h2>
          <p className={clsx("text-xs", STATUS_COLOR[table.status])}>{STATUS_LABEL[table.status]}</p>
          <p className="text-xs text-ink-dim">{table.seats} posti</p>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-ink-dim">
          <input
            type="checkbox"
            checked={table.active}
            onChange={(e) => toggleTableActive(table.id, e.target.checked)}
          />
          Attivo
        </label>
      </div>

      <div className="mt-4 flex justify-center rounded-xl bg-ink p-3">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`QR ${table.label}`} className="h-40 w-40" />
        ) : (
          <div className="h-40 w-40 animate-pulse bg-ink-dim/20" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={download}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim hover:border-gold hover:text-gold"
        >
          <Download size={13} /> Scarica QR
        </button>
        <button
          onClick={() => {
            if (confirm("Rigenerare il QR? Il link precedente non funzionerà più.")) regenerateQr(table.id);
          }}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim hover:border-gold hover:text-gold"
        >
          <RefreshCcw size={13} /> Rigenera
        </button>
        {table.status !== "libero" && (
          <button
            onClick={() => {
              if (confirm("Forzare il tavolo a libero? Usare solo se il conto è già stato chiuso manualmente.")) {
                resetTableToFree(table.id);
              }
            }}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim hover:border-gold hover:text-gold"
          >
            Forza libero
          </button>
        )}
      </div>
    </div>
  );
}
