import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MōMA · Japanese Cuisine Gourmet — Catania",
    template: "%s · MōMA Catania",
  },
  description:
    "MōMA, cucina giapponese gourmet a Catania. Sushi All You Can Eat e alla carta, nigiri, sashimi, uramaki e tempura. Via del Bosco 134, Catania.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-abyss text-ink">
        <SupabaseSetupNotice />
        {children}
      </body>
    </html>
  );
}
