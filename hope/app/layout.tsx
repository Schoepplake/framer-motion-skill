import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/layout/AppProvider";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "HOPE — Gewinnspiel-Missionen",
  description:
    "Konfiguration und Steuerung von Gewinnspiel-Missionen für die PENNY App.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AppProvider>
          <AppHeader />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
