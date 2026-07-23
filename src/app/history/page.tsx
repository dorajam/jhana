import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { currentStreak } from "@/lib/streak";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const sessions = await db.session.findMany({
    where: { meditatorId: user.id },
    orderBy: { occurredAt: "desc" },
  });

  const streak = currentStreak(sessions.map((s) => s.occurredAt));
  const totalMin = sessions.reduce((sum, s) => sum + s.durationMin, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-serif text-2xl text-ink">History</p>
        <p className="text-sm text-ink-soft">Your practice, sit by sit.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        <Stat value={String(streak)} unit={streak === 1 ? "day" : "days"} label="Current streak" />
        <Stat value={String(sessions.length)} unit={sessions.length === 1 ? "sit" : "sits"} label="Total logged" />
        <Stat value={String(totalMin)} unit="min" label="Time on the cushion" />
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center">
          <p className="text-ink-soft">No sits yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            Start your first sit →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-hairline bg-paper-raised px-5 py-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink">
                  {formatDate(s.occurredAt)}
                </span>
                <span className="flex items-center gap-2 text-xs text-ink-faint tabular-nums">
                  {s.isPrivate && (
                    <span className="rounded-full bg-clay/15 px-2 py-0.5 text-clay">
                      Private
                    </span>
                  )}
                  {s.durationMin} min
                </span>
              </div>
              {s.note ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {s.note}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-ink-faint">
                  No note for this sit.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <Link
          href="/log"
          className="text-sm text-ink-soft underline-offset-4 hover:text-accent hover:underline"
        >
          + Log a past sit
        </Link>
      </div>
    </div>
  );
}

function Stat({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-paper-raised px-4 py-4 text-center">
      <div className="font-serif text-3xl text-accent tabular-nums">
        {value}
        <span className="ml-1 text-base text-ink-faint">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
