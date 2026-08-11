import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "./db";

// App-facing auth helpers, now backed by Auth.js (Google OAuth).
// getCurrentUser returns the full DB user (with displayName etc.), or null.

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}

/** Like getCurrentUser but redirects to /login when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
