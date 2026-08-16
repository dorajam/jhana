import type { Metadata } from "next";
import Link from "next/link";
import { Lora, Mulish } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { ModeNav } from "@/components/ModeNav";

// Brand typefaces: Lora for display/headings, Mulish for body and UI.
// next/font self-hosts these, so there's no render-blocking request to Google.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jhana — a space for your practice",
  description: "Time a sit, log it honestly, let your teacher read.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`h-full ${lora.variable} ${mulish.variable}`}
    >
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
                    <Link href="/connections" className="hover:text-link">
                      Connections
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="text-ink-faint underline-offset-4 hover:text-link hover:underline"
                        title={user.email ?? undefined}
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                }
              />
            ) : (
              <div className="ml-auto flex items-center gap-5 text-sm">
                <Link
                  href="/practice"
                  className="breath breath-saffron rounded-lg bg-saffron px-4 py-2 font-bold text-basalt hover:bg-saffron-hover active:bg-[#c8910e]"
                >
                  Start your sit
                </Link>
                <Link
                  href="/login"
                  className="text-ink-soft hover:text-link"
                >
                  Sign in
                </Link>
              </div>
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
