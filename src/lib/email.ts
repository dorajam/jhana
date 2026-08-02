// Magic-link delivery. Sends via Resend when configured; otherwise falls back
// to a dev link surfaced on-screen and in the console. This lets local dev run
// with no email service while production emails for real.

const DEFAULT_FROM = "Jhana <onboarding@resend.dev>";

// Read env at call time (not module load) and treat blank/whitespace-only
// values as unset. A Vercel env var can exist but be an EMPTY STRING, which
// `??` does NOT fall back on — that empty `from` is what Resend rejects.
function envOr(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

/** True when a real email provider is configured (non-blank key). */
export function emailConfigured(): boolean {
  return Boolean(envOr("RESEND_API_KEY"));
}

/**
 * Deliver a magic link. Returns whether it was actually emailed.
 * When not configured, logs the link and returns false so the caller can show
 * the dev link on-screen.
 */
export async function sendMagicLink(
  email: string,
  loginUrl: string
): Promise<boolean> {
  const apiKey = envOr("RESEND_API_KEY");
  const from = envOr("EMAIL_FROM", DEFAULT_FROM);

  if (!apiKey) {
    console.log(`\n🔑 Magic link for ${email}:\n   ${loginUrl}\n`);
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Jhana sign-in link",
      html: emailHtml(loginUrl),
      text: `Sign in to Jhana:\n\n${loginUrl}\n\nThis link expires in 30 minutes. If you didn't request it, you can ignore this email.`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Resend send failed (${res.status}): ${detail}`);
    // Fall back to the dev link rather than losing the login entirely.
    console.log(`\n🔑 Magic link for ${email}:\n   ${loginUrl}\n`);
    return false;
  }

  return true;
}

function emailHtml(loginUrl: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2a2c;">
    <h1 style="font-size: 20px; font-weight: 600;">Sign in to Jhana</h1>
    <p style="color: #4b5a5c; line-height: 1.6;">
      Click below to sign in. This link expires in 30 minutes.
    </p>
    <p style="margin: 28px 0;">
      <a href="${loginUrl}"
         style="display: inline-block; background: #17b3a6; color: #ffffff;
                text-decoration: none; padding: 12px 28px; border-radius: 999px;
                font-weight: 500;">
        Sign in &rarr;
      </a>
    </p>
    <p style="color: #8a9698; font-size: 13px; line-height: 1.6;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>`;
}
