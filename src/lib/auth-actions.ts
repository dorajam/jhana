"use server";

import { db } from "./db";
import { destroySession } from "./auth";
import { sendMagicLink, emailConfigured } from "./email";
import { appBaseUrl } from "./app-url";
import { assertMagicLinkAllowed } from "./rate-limit";
import { redirect } from "next/navigation";

const TOKEN_MINUTES = 30;

/**
 * Request a magic link for an email. Creates a single-use token and either
 * emails it (when a provider is configured) or surfaces a dev link on-screen.
 */
export async function requestMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const inviteToken = String(formData.get("invite") ?? "").trim() || null;

  if (!email || !email.includes("@")) {
    redirect("/login?error=email");
  }

  // Abuse protection: cap how often links can be requested per email.
  const allowed = await assertMagicLinkAllowed(email);
  if (!allowed) {
    redirect("/login?error=rate");
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_MINUTES);

  const magic = await db.magicToken.create({
    data: { email, inviteToken, expiresAt },
  });

  const base = await appBaseUrl();
  const loginUrl = `${base}/auth/verify?token=${magic.token}`;

  const emailed = await sendMagicLink(email, loginUrl);

  // Reveal the clickable link on-screen ONLY in local development without a
  // provider. In production the link goes to the inbox only — never on-screen,
  // even if sending failed (leaking a login link on a page is unsafe).
  const isDev = process.env.NODE_ENV !== "production";
  const showDevLink = isDev && !emailConfigured();

  if (showDevLink) {
    redirect(`/login/sent?token=${magic.token}`);
  }
  // Production: if the email genuinely failed, tell the user to retry rather
  // than silently pretending it sent.
  if (!emailed) {
    redirect("/login?error=send");
  }
  redirect("/login/sent");
}

/** Sign out and return to the login page. */
export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/login");
}
