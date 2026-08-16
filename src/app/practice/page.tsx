import Link from "next/link";
import { SitTimer } from "@/components/SitTimer";
import { getCurrentUser } from "@/lib/auth";

// The timer is intentionally open to everyone — no login required to sit.
// Sign-in is only prompted when saving a sit (see /log).
export default async function SitPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center gap-2 pt-6">
      <p className="font-serif text-2xl text-ink">Sit</p>
      <p className="max-w-sm text-center text-sm text-ink-soft">
        Set a length, settle in, and begin. When the bell fades, you&rsquo;ll
        log the sit while it&rsquo;s still fresh.
      </p>
      <SitTimer />

      {/* A way back to the introduction for anyone who arrived here first. */}
      {!user && (
        <p className="pt-4 text-center text-sm text-ink-faint">
          New to this?{" "}
          <Link
            href="/"
            className="text-ink-soft underline underline-offset-4 hover:text-link"
          >
            Read what jhana is
          </Link>
        </p>
      )}
    </div>
  );
}
