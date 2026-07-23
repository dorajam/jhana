import { requestMagicLink } from "@/lib/auth-actions";

const ERRORS: Record<string, string> = {
  email: "Please enter a valid email address.",
  token: "That login link was missing or malformed.",
  expired: "That login link has expired. Request a new one below.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invite?: string }>;
}) {
  const { error, invite } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-10">
      <div className="flex flex-col gap-2 text-center">
        <p className="font-serif text-3xl text-ink">Welcome</p>
        <p className="text-sm text-ink-soft">
          {invite
            ? "Sign in or create your account to accept the invitation."
            : "Enter your email and we’ll send you a link to sign in."}
        </p>
      </div>

      {error && ERRORS[error] && (
        <p className="rounded-lg border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
          {ERRORS[error]}
        </p>
      )}

      <form action={requestMagicLink} className="flex flex-col gap-4">
        {invite && <input type="hidden" name="invite" value={invite} />}
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="you@example.com"
          className="w-full rounded-lg border border-hairline bg-paper-raised px-4 py-3 text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-8 py-3 font-medium text-paper transition hover:opacity-90"
        >
          Send me a link
        </button>
      </form>

      <p className="text-center text-xs text-ink-faint">
        No password needed. The link signs you in and creates your account if
        you don’t have one yet.
      </p>
    </div>
  );
}
