import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isActiveLink } from "@/lib/connections";
import { currentStreak } from "@/lib/streak";

const SHARED_FIELDS: { key: string; label: string }[] = [
  { key: "object", label: "Your anchor" },
  { key: "technique", label: "Practising" },
  { key: "distractions", label: "Distractions" },
  { key: "emotions", label: "How they felt" },
  { key: "sensations", label: "Physical sensations" },
  { key: "jhana", label: "Jhana reached" },
  { key: "other", label: "Anything else" },
];

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: studentId } = await params;

  // THE authorization rule: only proceed if an active link exists.
  const allowed = await isActiveLink(user.id, studentId);
  if (!allowed) notFound();

  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) notFound();

  // Read sessions with an explicit select that OMITS privateNotes entirely —
  // the field never leaves the database on the facilitator's behalf.
  const sessions = await db.sit.findMany({
    where: { meditatorId: studentId },
    orderBy: { occurredAt: "desc" },
    select: {
      id: true,
      occurredAt: true,
      durationSec: true,
      object: true,
      technique: true,
      distractions: true,
      emotions: true,
      sensations: true,
      jhana: true,
      other: true,
      // privateNotes intentionally excluded.
    },
  });

  const streak = currentStreak(sessions.map((s) => s.occurredAt));
  const totalMin = Math.round(
    sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/students"
          className="text-sm text-ink-faint hover:text-link"
        >
          ← All students
        </Link>
        <p className="font-serif font-bold text-2xl text-ink">
          {student.displayName}
        </p>
        <p className="text-sm text-ink-soft">{student.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          value={String(streak)}
          unit={streak === 1 ? "day" : "days"}
          label="Current streak"
          tone="text-jade"
        />
        <Stat
          value={String(sessions.length)}
          unit={sessions.length === 1 ? "sit" : "sits"}
          label="Total logged"
          tone="text-saffron-hover"
        />
        <Stat
          value={String(totalMin)}
          unit="min"
          label="Time on the cushion"
          tone="text-cobalt"
        />
      </div>

      <div className="rounded-md border border-hairline bg-paper px-4 py-2 text-xs text-ink-faint">
        You’re seeing this student’s shared reflections. Notes they marked
        private are never shown here.
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center text-ink-soft">
          No sits logged yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => {
            const shared = SHARED_FIELDS.filter(
              (f) =>
                String((s as Record<string, unknown>)[f.key] ?? "").trim()
                  .length > 0,
            );
            return (
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
                {shared.length === 0 ? (
                  <p className="mt-2 text-sm italic text-ink-faint">
                    No shared notes for this sit.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2.5">
                    {shared.map((f) => (
                      <div key={f.key}>
                        <div className="text-xs uppercase tracking-wider text-ink-faint">
                          {f.label}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                          {String((s as Record<string, unknown>)[f.key])}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  value,
  unit,
  label,
  tone = "text-cobalt",
}: {
  value: string;
  unit: string;
  label: string;
  /** Each stat gets its own hue so the row reads at a glance. */
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-paper-raised px-4 py-4 text-center">
      <div className={`font-serif font-bold text-3xl tabular-nums ${tone}`}>
        {value}
        <span className="ml-1 text-base text-ink-faint">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </div>
  );
}

function formatDuration(totalSec: number): string {
  if (totalSec >= 60 && totalSec % 60 === 0) return `${totalSec / 60} min`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return (
    d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}
