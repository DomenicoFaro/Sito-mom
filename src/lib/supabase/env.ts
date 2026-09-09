const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

/**
 * @supabase/ssr lancia un'eccezione hard (non un errore React gestibile) se
 * URL/Key sono assenti. Su Vercel, dimenticare di impostare le variabili
 * d'ambiente manda in crash ogni pagina con un errore 500 generico. Usando
 * dei placeholder quando mancano, il client si crea comunque: le query
 * falliranno normalmente (data null + error), permettendo all'app di
 * renderizzare un avviso invece di un crash totale.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: url && url.length > 0 ? url : PLACEHOLDER_URL,
    anonKey: anonKey && anonKey.length > 0 ? anonKey : PLACEHOLDER_KEY,
    isConfigured: Boolean(url && anonKey),
  };
}
