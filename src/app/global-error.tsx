"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0b0b0a",
          color: "#f5f1e8",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: "1.4rem", margin: 0 }}>MōMA — Errore critico</h1>
        <p style={{ maxWidth: 360, color: "#cfc9ba", fontSize: "0.9rem" }}>
          L&apos;applicazione non è riuscita a caricarsi. Controlla la
          configurazione del progetto (variabili d&apos;ambiente Supabase) e
          riprova.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            borderRadius: 999,
            background: "#a8322a",
            color: "#f5f1e8",
            border: "none",
            padding: "10px 24px",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Riprova
        </button>
      </body>
    </html>
  );
}
