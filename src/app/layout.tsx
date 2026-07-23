import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jhana — a quiet ledger for your practice",
  description: "Time a sit, log it honestly, let your teacher read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-hairline">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="font-serif text-lg tracking-tight text-ink"
            >
              Jhana
            </Link>
            <div className="flex gap-6 text-sm text-ink-soft">
              <Link href="/" className="hover:text-accent">
                Sit
              </Link>
              <Link href="/history" className="hover:text-accent">
                History
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
