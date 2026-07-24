/**
 * Current streak = number of consecutive days (ending today or yesterday)
 * on which at least one session was logged. A gap of a full day breaks it.
 *
 * We count "yesterday" as still-alive so you don't lose a streak just
 * because you haven't sat *yet* today.
 */
export function currentStreak(occurredDates: Date[]): number {
  if (occurredDates.length === 0) return 0;

  // Collect the distinct local calendar days that have a sit.
  const days = new Set(occurredDates.map(toDayKey));

  const today = new Date();
  const todayKey = toDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDayKey(yesterday);

  // The streak is only "alive" if there's a sit today or yesterday.
  let cursor: Date;
  if (days.has(todayKey)) {
    cursor = today;
  } else if (days.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Local-day key (YYYY-MM-DD) so sits are grouped by calendar day, not UTC. */
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
