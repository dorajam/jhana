import Link from "next/link";

// Dev "check your link" screen. Because we don't send real email in dev, we
// show the magic link right here so you can click it. In production this page
// would simply say "check your inbox" with no link.
export default async function LinkSentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const loginUrl = token ? `/auth/verify?token=${token}` : null;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-10 text-center">
      <p className="font-serif text-3xl text-ink">Check your email</p>
      <p className="text-sm text-ink-soft">
        We’ve sent you a link to sign in. It expires in 30 minutes.
      </p>

      {loginUrl && (
        <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent-soft px-5 py-5">
          <p className="text-xs uppercase tracking-wider text-accent">
            Dev mode — no email sent
          </p>
          <p className="text-sm text-ink-soft">
            Click your magic link directly:
          </p>
          <Link
            href={loginUrl}
            className="break-all rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper transition hover:opacity-90"
          >
            Sign in →
          </Link>
        </div>
      )}

      <Link href="/login" className="text-sm text-ink-faint hover:text-accent">
        Use a different email
      </Link>
    </div>
  );
}
