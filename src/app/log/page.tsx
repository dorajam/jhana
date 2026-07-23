import { logSession } from "@/lib/actions";
import { LogForm } from "@/components/LogForm";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ duration?: string; source?: string }>;
}) {
  const params = await searchParams;
  const duration = Number(params.duration) || 20;
  const fromTimer = params.source === "timer";

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
        defaultDuration={duration}
        fromTimer={fromTimer}
      />
    </div>
  );
}
