import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Banner globale mostrato quando NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY non sono impostate nell'ambiente di deploy
 * (tipicamente dimenticate nelle Environment Variables di Vercel). Senza
 * queste variabili tutte le pagine restano vuote perché ogni query al
 * database fallisce silenziosamente.
 */
export function SupabaseSetupNotice() {
  const { isConfigured } = getSupabaseEnv();
  if (isConfigured) return null;

  return (
    <div className="sticky top-0 z-[100] border-b border-lacquer/40 bg-lacquer/95 px-4 py-2.5 text-center text-xs text-ink sm:text-sm">
      <strong>Configurazione mancante:</strong> imposta{" "}
      <code className="rounded bg-black/20 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
      <code className="rounded bg-black/20 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
      nelle variabili d&apos;ambiente del progetto (su Vercel: Settings →
      Environment Variables) e rifai il deploy — vedi il README.
    </div>
  );
}
