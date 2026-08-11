"use server";

import { signIn, signOut as authSignOut } from "@/auth";

// Thin server-action wrappers around Auth.js, so UI can keep importing from
// a stable module path.

/** Start Google sign-in, returning to `next` (a same-origin path) afterward. */
export async function signInWithGoogle(next?: string): Promise<void> {
  const redirectTo = safeInternalPath(next) ?? "/";
  await signIn("google", { redirectTo });
}

/** Sign out and return to the login page. */
export async function signOut(): Promise<void> {
  await authSignOut({ redirectTo: "/login" });
}

/** Only allow same-origin, in-app redirect targets (guards open redirects). */
function safeInternalPath(raw: string | undefined | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  return v;
}
