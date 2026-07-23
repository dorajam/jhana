"use client";

import { useEffect, useRef, useState } from "react";

// The shared, structured reflection prompts. All optional.
const FIELDS: { name: string; label: string; placeholder: string }[] = [
  {
    name: "object",
    label: "Object",
    placeholder: "What was the object of your meditation?",
  },
  {
    name: "technique",
    label: "Technique",
    placeholder: "What technique did you practice?",
  },
  {
    name: "distractions",
    label: "Distractions",
    placeholder: "What distractions showed up?",
  },
  {
    name: "emotions",
    label: "Emotions",
    placeholder: "What emotions did you experience?",
  },
  {
    name: "other",
    label: "Anything else",
    placeholder: "Anything else worth noting?",
  },
];

export function LogForm({
  action,
  defaultSeconds,
  fromTimer,
}: {
  action: (formData: FormData) => void;
  defaultSeconds: number;
  fromTimer: boolean;
}) {
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  // Manual path lets you edit minutes; timer path is fixed to what you sat.
  const [minutes, setMinutes] = useState(
    Math.max(1, Math.round(defaultSeconds / 60))
  );

  // Drop the cursor straight into the first prompt so logging flows.
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const durationSec = fromTimer ? defaultSeconds : minutes * 60;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="durationSec" value={durationSec} />
      <input
        type="hidden"
        name="source"
        value={fromTimer ? "timer" : "manual"}
      />

      {/* Duration: honest elapsed time from the timer, editable when manual. */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-ink-soft">Duration</label>
        {fromTimer ? (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent tabular-nums">
            {formatDuration(defaultSeconds)}
          </span>
        ) : (
          <>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(1, Math.round(Number(e.target.value) || 1)))
              }
              className="w-24 rounded-md border border-hairline bg-paper-raised px-3 py-1.5 text-sm text-ink tabular-nums focus:border-accent focus:outline-none"
            />
            <span className="text-sm text-ink-faint">min</span>
          </>
        )}
      </div>

      {!fromTimer && (
        <input
          type="datetime-local"
          name="occurredAt"
          className="w-full max-w-xs rounded-md border border-hairline bg-paper-raised px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
          defaultValue={toLocalInput(new Date())}
        />
      )}

      {/* Structured, shared reflection. Each prompt its own field. */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-xs uppercase tracking-wider text-ink-faint">
          Shared with your teacher
        </legend>
        {FIELDS.map((f, i) => (
          <label key={f.name} className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">{f.label}</span>
            <textarea
              ref={i === 0 ? firstFieldRef : undefined}
              name={f.name}
              rows={2}
              placeholder={f.placeholder}
              className="w-full resize-y rounded-lg border border-hairline bg-paper-raised px-4 py-2.5 text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
            />
          </label>
        ))}
      </fieldset>

      {/* Private notes — always just for the meditator. Visually set apart. */}
      <label className="flex flex-col gap-1.5 rounded-lg border border-clay/40 bg-clay/5 p-4">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          Private notes
          <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-normal text-clay">
            Only you
          </span>
        </span>
        <span className="text-xs text-ink-soft">
          Never shared with your teacher — a place for anything you want to keep
          to yourself.
        </span>
        <textarea
          name="privateNotes"
          rows={3}
          placeholder="For your eyes only…"
          className="mt-1 w-full resize-y rounded-lg border border-hairline bg-paper-raised px-4 py-2.5 text-ink placeholder:text-ink-faint/70 focus:border-clay focus:outline-none"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-accent px-8 py-2.5 font-medium text-paper transition hover:opacity-90"
        >
          Save sit
        </button>
      </div>
    </form>
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

/** Format a Date for a datetime-local input in the user's local zone. */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
