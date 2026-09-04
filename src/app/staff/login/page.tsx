import { LoginForm } from "./LoginForm";

export const metadata = { title: "Accesso staff" };

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-6 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-2xl">MōMA</div>
          <p className="mt-1 text-xs tracking-[0.28em] text-gold">
            AREA STAFF
          </p>
        </div>

        {error === "not_authorized" && (
          <p className="mb-5 rounded-lg border border-lacquer/40 bg-lacquer/10 px-4 py-3 text-sm text-lacquer-bright">
            Il tuo account non è autorizzato per l&apos;area staff.
          </p>
        )}

        <LoginForm next={next} />
      </div>
    </div>
  );
}
