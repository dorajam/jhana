import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Jhana — a quiet ledger for your practice",
  description: "Time a sit, log it honestly, let your teacher read.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-hairline">
          <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
            <Link
              href="/"
              className="font-serif text-lg tracking-tight text-ink"
            >
              Jhana
            </Link>

            {user ? (
              <div className="flex items-center gap-5 text-sm text-ink-soft">
                <Link href="/" className="hover:text-accent">
                  Sit
                </Link>
                <Link href="/history" className="hover:text-accent">
                  History
                </Link>
                <Link href="/students" className="hover:text-accent">
                  Students
                </Link>
                <Link href="/connections" className="hover:text-accent">
                  Connections
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-ink-faint underline-offset-4 hover:text-clay hover:underline"
                    title={user.email}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm text-ink-soft hover:text-accent">
                Sign in
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
