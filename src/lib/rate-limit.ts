import { db } from "./db";

// Simple DB-backed rate limiting for magic-link requests, so a public signup
// form can't be used to spam an inbox or flood token creation. Counts recent
// tokens issued for an email; no extra infrastructure (Redis) needed for
// launch scale. Can be swapped for an IP-aware limiter later.

const WINDOW_MINUTES = 15;
const MAX_PER_WINDOW = 5;

/**
 * Returns true if a new magic link may be issued for this email right now.
 * Returns false when the recent-request cap has been hit.
 */
export async function assertMagicLinkAllowed(email: string): Promise<boolean> {
  const since = new Date();
  since.setMinutes(since.getMinutes() - WINDOW_MINUTES);

  const recent = await db.magicToken.count({
    where: { email, createdAt: { gt: since } },
  });

  return recent < MAX_PER_WINDOW;
}
