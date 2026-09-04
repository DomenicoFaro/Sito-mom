"use client";

import { useActionState } from "react";
import { submitReservation, type ReservationFormState } from "./actions";

const initialState: ReservationFormState = { ok: false };

export function ReservationForm() {
  const [state, formAction, pending] = useActionState(
    submitReservation,
    initialState
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-abyss-card p-8 text-center">
        <h2 className="font-serif text-2xl text-gold">Richiesta inviata</h2>
        <p className="mt-3 text-ink-dim">
          Grazie! Ti contatteremo al più presto per confermare la
          prenotazione.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nome e cognome *" name="full_name" required />
      <Field label="Telefono *" name="phone" type="tel" required />
      <Field label="Email" name="email" type="email" className="sm:col-span-2" />
      <Field label="Numero persone *" name="party_size" type="number" min={1} required />
      <div className="grid grid-cols-2 gap-5">
        <Field label="Data *" name="requested_date" type="date" required />
        <Field label="Ora *" name="requested_time" type="time" required />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">
          Note
        </label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-3 text-sm text-ink outline-none focus:border-gold"
          placeholder="Allergie, occasioni speciali, richieste particolari..."
        />
      </div>

      {state.error && (
        <p className="text-sm text-lacquer-bright sm:col-span-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-lacquer px-8 py-3.5 text-sm font-medium tracking-wide text-ink transition hover:bg-lacquer-bright disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {pending ? "Invio in corso…" : "Invia richiesta"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-3 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
