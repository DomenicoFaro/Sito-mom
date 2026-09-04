import { ReservationForm } from "./ReservationForm";

export const metadata = { title: "Prenotazioni" };

export default function PrenotazioniPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
      <p className="kicker">Prenota un tavolo</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Prenotazioni</h1>
      <p className="mt-4 text-ink-dim">
        Invia una richiesta di prenotazione: ti contatteremo per confermare
        disponibilità, data e ora.
      </p>

      <div className="mt-12">
        <ReservationForm />
      </div>
    </section>
  );
}
