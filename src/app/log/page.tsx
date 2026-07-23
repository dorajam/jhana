import { logSession } from "@/lib/actions";
import { LogForm } from "@/components/LogForm";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ seconds?: string; duration?: string; source?: string }>;
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
      />
    </div>
  );
}
