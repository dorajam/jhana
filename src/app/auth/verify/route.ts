import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_DAYS, newSessionRecord } from "@/lib/auth";
import { acceptInviteForUser } from "@/lib/connections";

// Clicking a magic link lands here. We validate the single-use token, find or
// create the user, start a session, accept any carried invite, and redirect.
//
// The session cookie is set directly on the redirect response: cookies set via
// the next/headers store are NOT carried onto a `NextResponse.redirect`, which
// is why an earlier version left users apparently logged out after clicking.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const base = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=token", base));
  }

  const magic = await db.magicToken.findUnique({ where: { token } });

  if (!magic || magic.usedAt || magic.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", base));
  }

  // Find or create the user for this email.
  let user = await db.user.findUnique({ where: { email: magic.email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: magic.email,
        displayName: magic.email.split("@")[0],
      },
    });
  }

  // Burn the token (single use).
  await db.magicToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // Create the session record (cookie is set on the response below).
  const { id: sessionId, expiresAt } = await newSessionRecord(user.id);

  // Decide where to land after sign-in:
  // 1. A carried redirect (e.g. back to /log to save a sit) wins.
  // 2. Else an accepted invite goes to /connections.
  // 3. Else home.
  let dest = "/";
  if (magic.inviteToken) {
    const result = await acceptInviteForUser(magic.inviteToken, user.id);
    if (result.ok) dest = "/connections";
  }
  // redirectTo was validated as a same-origin path when the token was created.
  if (magic.redirectTo && magic.redirectTo.startsWith("/")) {
    dest = magic.redirectTo;
  }

  const res = NextResponse.redirect(new URL(dest, base));
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  return res;
}
