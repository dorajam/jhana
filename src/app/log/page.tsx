import Link from "next/link";
import { logSession } from "@/lib/actions";
import { LogForm } from "@/components/LogForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{
    seconds?: string;
    duration?: string;
    source?: string;
    object?: string;
    technique?: string;
  }>;
}) {
  const params = await searchParams;
  const fromTimer = params.source === "timer";

  // Timer path passes actual seconds sat (supports short test sits).
  // Manual path passes whole minutes. Fall back to a sensible default.
  const seconds = params.seconds
    ? Math.max(1, Math.round(Number(params.seconds)))
    : params.duration
      ? Math.max(1, Math.round(Number(params.duration))) * 60
      : 20 * 60;

  const user = await getCurrentUser();

  // Logged-out: don't lose the sit — invite sign-in and carry the sit data
  // back through login so it can be saved afterwards.
  if (!user) {
    // Carry the intentions through sign-in too, so they aren't lost.
    const back = new URLSearchParams({
      seconds: String(seconds),
      source: fromTimer ? "timer" : "manual",
    });
    if (params.object) back.set("object", params.object);
    if (params.technique) back.set("technique", params.technique);
    const next = encodeURIComponent(`/log?${back}`);
    return <SaveGate seconds={seconds} next={next} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-serif text-2xl text-ink">
          {fromTimer ? "How was your sit?" : "Log a sit"}
        </p>
        <p className="text-sm text-ink-soft">
          {fromTimer
            ? "Write while it’s fresh — even a line or two is enough."
            : "Record a sit you did away from the timer."}
        </p>
      </div>

      <LogForm
        action={logSession}
        defaultSeconds={seconds}
        fromTimer={fromTimer}
        defaults={{ object: params.object, technique: params.technique }}
      />
    </div>
  );
}

/** Shown to logged-out meditators after a sit: motivate signing in to save. */
function SaveGate({ seconds, next }: { seconds: number; next: string }) {
  const mins = Math.max(1, Math.round(seconds / 60));
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pt-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="font-serif text-2xl text-ink">Nicely done.</p>
        <p className="text-sm text-ink-soft">
          You just sat for {mins} {mins === 1 ? "minute" : "minutes"}. Sign in to
          save it to your practice.
        </p>
      </div>

      <div className="rounded-lg border border-hairline bg-paper-raised px-6 py-6 text-left">
        <p className="text-sm text-ink-soft">
          Creating an account lets you:
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink">
          <li className="flex gap-2">
            <span className="text-saffron">•</span>
            Build a streak and keep a regular practice
          </li>
          <li className="flex gap-2">
            <span className="text-saffron">•</span>
            Look back on your notes and how your sits evolve
          </li>
          <li className="flex gap-2">
            <span className="text-saffron">•</span>
            Share your practice with your teacher
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={`/login?next=${next}`}
          className="breath breath-saffron rounded-lg bg-saffron px-8 py-3 font-bold text-basalt hover:bg-saffron-hover"
        >
          Sign in to save this sit
        </Link>
        <Link
          href="/practice"
          className="text-sm text-ink-faint hover:text-link"
        >
          Not now — back to the timer
        </Link>
      </div>
    </div>
  );
}
