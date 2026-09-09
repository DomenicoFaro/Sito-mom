"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-abyss px-6 text-center text-ink">
      <h1 className="font-serif text-2xl">Qualcosa è andato storto</h1>
      <p className="max-w-sm text-sm text-ink-dim">
        Si è verificato un errore imprevisto. Se il problema persiste,
        controlla che le variabili d&apos;ambiente Supabase siano configurate
        correttamente nel progetto.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-ink-dim/60">
          Codice errore: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-lacquer px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-lacquer-bright"
      >
        Riprova
      </button>
    </div>
  );
}
