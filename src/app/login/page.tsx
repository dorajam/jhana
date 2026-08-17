import { signInWithGoogle } from "@/lib/auth-actions";

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already linked to a different sign-in method.",
  AccessDenied: "Sign-in was cancelled or denied. Please try again.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invite?: string; next?: string }>;
}) {
  const { error, invite, next } = await searchParams;

  // Preserve the return-to path (e.g. back to /log to save a sit) through login.
  const signIn = signInWithGoogle.bind(null, next);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="font-serif text-3xl text-ink">Welcome</p>
        <p className="text-sm text-ink-soft">
          {invite
            ? "Sign in to accept the invitation and connect."
            : "Sign in to save your practice and track your progress."}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
          {ERRORS[error] ??
            "Something went wrong signing in. Please try again."}
        </p>
      )}

      <form action={signIn}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-full border border-hairline bg-paper-raised px-6 py-3 font-medium text-ink transition hover:border-accent hover:bg-accent-soft"
        >
          <GoogleMark />
          Continue with Google
        </button>
      </form>

      <p className="text-xs text-ink-faint">
        We only use your Google account to sign you in. No password to remember.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
