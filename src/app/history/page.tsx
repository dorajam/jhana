import Link from "next/link";
import type { Sit } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { currentStreak } from "@/lib/streak";

export default async function HistoryPage() {
  const user = await requireUser();
  const sessions = await db.sit.findMany({
    where: { meditatorId: user.id },
    orderBy: { occurredAt: "desc" },
  });

  const streak = currentStreak(sessions.map((s) => s.occurredAt));
  const totalSec = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const totalMin = Math.round(totalSec / 60);

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
            href="/practice"
            className="mt-3 inline-block text-sm font-medium text-link hover:underline"
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
                <span className="text-xs text-ink-faint tabular-nums">
                  {formatDuration(s.durationSec)}
                </span>
              </div>
              <SitReflection session={s} />
            </li>
          ))}
        </ul>
      )}

      <div>
        <Link
          href="/log"
          className="text-sm text-ink-soft underline-offset-4 hover:text-link hover:underline"
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
      <div className="font-serif text-3xl text-link tabular-nums">
        {value}
        <span className="ml-1 text-base text-ink-faint">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </div>
  );
}

const SHARED_FIELDS: { key: keyof Sit; label: string }[] = [
  { key: "object", label: "Object" },
  { key: "technique", label: "Technique" },
  { key: "distractions", label: "Distractions" },
  { key: "emotions", label: "Emotions" },
  { key: "other", label: "Anything else" },
];

/**
 * Renders a sit's reflection: the shared structured fields, then the
 * private notes (shown here because this is the meditator's own history;
 * the teacher's future view will omit privateNotes).
 */
function SitReflection({ session }: { session: Sit }) {
  const shared = SHARED_FIELDS.filter(
    (f) => String(session[f.key] ?? "").trim().length > 0
  );
  const hasPrivate = session.privateNotes.trim().length > 0;

  if (shared.length === 0 && !hasPrivate) {
    return (
      <p className="mt-2 text-sm italic text-ink-faint">
        No notes for this sit.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {shared.map((f) => (
        <div key={String(f.key)}>
          <div className="text-xs uppercase tracking-wider text-ink-faint">
            {f.label}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {String(session[f.key])}
          </p>
        </div>
      ))}

      {hasPrivate && (
        <div className="mt-1 rounded-md border border-clay/30 bg-clay/5 px-3 py-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-clay">
            Private notes
            <span className="rounded-full bg-clay/15 px-1.5 py-0.5 text-[10px] normal-case tracking-normal">
              Only you
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {session.privateNotes}
          </p>
        </div>
      )}
    </div>
  );
}

/** "0:20", "5:03", or "20 min" — honest for both short and long sits. */
function formatDuration(totalSec: number): string {
  if (totalSec >= 60 && totalSec % 60 === 0) {
    return `${totalSec / 60} min`;
  }
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
