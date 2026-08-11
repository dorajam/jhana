import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { ModeNav } from "@/components/ModeNav";

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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <header className="border-b border-hairline">
          <nav className="mx-auto flex max-w-3xl items-center gap-6 px-5 py-4">
            <Link
              href="/"
              className="font-serif text-lg tracking-tight text-ink"
            >
              Jhana
            </Link>

            {user ? (
              <ModeNav
                trailing={
                  <>
                    <Link href="/connections" className="hover:text-accent">
                      Connections
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="text-ink-faint underline-offset-4 hover:text-accent hover:underline"
                        title={user.email ?? undefined}
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                }
              />
            ) : (
              <Link
                href="/login"
                className="ml-auto text-sm text-ink-soft hover:text-accent"
              >
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
