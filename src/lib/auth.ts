import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

// --- Phase 2 auth ---
// Cookie-backed sessions. The cookie holds an AuthSession id; reading it in a
// Server Component is fine. Writing it (login/logout) happens only in Server
// Actions and Route Handlers, where setting cookies is allowed.

export const SESSION_COOKIE = "jhana_session";
export const SESSION_DAYS = 30;

/** Returns the signed-in user, or null if there is no valid session. */
export async function getCurrentUser() {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await db.authSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Like getCurrentUser but redirects to /login when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Create a session DB row and return its id + expiry. Does NOT touch cookies —
 * the caller sets the cookie (on a NextResponse in a Route Handler, or via the
 * cookie store in a Server Action). Splitting it this way is what lets the
 * magic-link route attach the cookie to its redirect response.
 */
export async function newSessionRecord(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  const session = await db.authSession.create({
    data: { userId, expiresAt },
  });
  return { id: session.id, expiresAt };
}

/**
 * Create a session for a user and set the cookie via the cookie store.
 * Safe from Server Actions (where the store is flushed onto the response).
 */
export async function createSession(userId: string) {
  const { id, expiresAt } = await newSessionRecord(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Destroy the current session and clear the cookie. */
export async function destroySession() {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.authSession.deleteMany({ where: { id: sessionId } });
  }
  jar.delete(SESSION_COOKIE);
}
