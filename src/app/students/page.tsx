import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { currentStreak } from "@/lib/streak";

const GAP_DAYS = 4; // flag a student who hasn't sat in this many days

export default async function StudentsPage() {
  const user = await requireUser();

  // Active links where I am the facilitator → my students.
  const links = await db.link.findMany({
    where: { facilitatorId: user.id, status: "active" },
    include: {
      meditator: {
        include: {
          sits: {
            orderBy: { occurredAt: "desc" },
            select: { occurredAt: true },
          },
        },
      },
    },
  });

  const students = links.map((l) => {
    const dates = l.meditator.sits.map((s) => s.occurredAt);
    const lastSat = dates[0] ?? null;
    return {
      linkId: l.id,
      id: l.meditator.id,
      name: l.meditator.displayName,
      email: l.meditator.email,
      total: dates.length,
      streak: currentStreak(dates),
      lastSat,
      daysSince: lastSat ? daysBetween(lastSat, new Date()) : null,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-serif font-bold text-2xl text-ink">Students</p>
        <p className="text-sm text-ink-soft">
          The practitioners who’ve connected you as their teacher.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center">
          <p className="text-ink-soft">No students yet.</p>
          <p className="mt-2 text-sm text-ink-faint">
            When someone connects you as their teacher, they’ll appear here.
          </p>
          <Link
            href="/connections"
            className="mt-3 inline-block text-sm font-medium text-link hover:underline"
          >
            Go to Connections →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {students.map((s) => {
            const stale = s.daysSince != null && s.daysSince >= GAP_DAYS;
            return (
              <li key={s.linkId}>
                <Link
                  href={`/students/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-paper-raised px-5 py-4 transition hover:border-cobalt"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-ink-faint">{s.email}</p>
                  </div>
                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <div className="font-serif text-lg text-link tabular-nums">
                        {s.streak}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                        streak
                      </div>
                    </div>
                    <div>
                      <div className="font-serif text-lg text-ink tabular-nums">
                        {s.total}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                        sits
                      </div>
                    </div>
                    <div className="w-28">
                      {s.lastSat ? (
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs ${
                            stale
                              ? "bg-cobalt/15 text-cobalt"
                              : "bg-mist text-saffron-hover"
                          }`}
                        >
                          {lastSatLabel(s.daysSince!)}
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-hairline/60 px-2.5 py-1 text-xs text-ink-faint">
                          No sits yet
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function daysBetween(a: Date, b: Date): number {
  const day = 1000 * 60 * 60 * 24;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dbb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((dbb.getTime() - da.getTime()) / day);
}

function lastSatLabel(daysSince: number): string {
  if (daysSince <= 0) return "Sat today";
  if (daysSince === 1) return "Sat yesterday";
  return `${daysSince} days ago`;
}
