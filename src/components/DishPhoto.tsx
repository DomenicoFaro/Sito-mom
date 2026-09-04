import clsx from "clsx";

/**
 * Nessuna foto reale dei piatti è ancora disponibile (vedi PRD §8).
 * Questo placeholder mantiene la griglia fotografica coerente finché
 * l'admin non carica gli scatti reali da Supabase Storage.
 */
export function DishPhoto({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={clsx("object-cover", className)} />;
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center bg-gradient-to-br from-abyss-card via-abyss-soft to-abyss text-center",
        className
      )}
      role="img"
      aria-label={alt}
    >
      <span className="font-serif text-ink-dim/60 text-sm px-4 leading-snug">
        {alt}
      </span>
    </div>
  );
}
