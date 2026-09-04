import { QrCode } from "lucide-react";

export const metadata = { title: "Ordina al tavolo" };

export default function OrdinaLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-abyss px-6 text-center text-ink">
      <QrCode size={40} className="text-gold" />
      <h1 className="mt-5 font-serif text-2xl">Inquadra il QR del tuo tavolo</h1>
      <p className="mt-3 max-w-sm text-ink-dim">
        Per ordinare, scansiona il QR code presente sul tavolo con la
        fotocamera del tuo smartphone. Si aprirà il menù del tuo tavolo.
      </p>
    </div>
  );
}
