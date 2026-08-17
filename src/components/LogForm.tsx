"use client";

import { Fragment, useEffect, useRef, useState } from "react";

// The shared, structured reflection prompts. All optional.
const FIELDS: { name: string; label: string; placeholder: string }[] = [
  {
    name: "object",
    label: "Your anchor",
    placeholder: "What did your attention rest on?",
  },
  {
    name: "technique",
    label: "Practising",
    placeholder: "What were you exploring in this sit?",
  },
  {
    name: "distractions",
    label: "What distractions showed up?",
    placeholder: "Thoughts, sounds, restlessness…",
  },
  {
    name: "emotions",
    label: "How did they make you feel?",
    placeholder: "What emotions came with them?",
  },
  {
    name: "sensations",
    label: "What physical sensations did you feel during your sit?",
    placeholder: "Warmth, tingling, lightness, pressure…",
  },
  {
    name: "other",
    label: "Anything else",
    placeholder: "Anything else worth noting?",
  },
];

// The eight jhanas, with a few keywords as a reminder of what each involves.
// Kept in step with the descriptions on the introduction page.
const JHANAS: { value: string; label: string; hint: string }[] = [
  {
    value: "Jhana 1",
    label: "Jhana 1",
    hint: "rapture, energised pleasure, thinking continues",
  },
  {
    value: "Jhana 2",
    label: "Jhana 2",
    hint: "joy, effort drops away, warmer and quieter",
  },
  {
    value: "Jhana 3",
    label: "Jhana 3",
    hint: "contentment, calm, chatter infrequent",
  },
  {
    value: "Jhana 4",
    label: "Jhana 4",
    hint: "deep stillness, few thoughts, completion",
  },
  {
    value: "Jhana 5",
    label: "Jhana 5",
    hint: "infinite space, body boundary releases",
  },
  {
    value: "Jhana 6",
    label: "Jhana 6",
    hint: "infinite consciousness, awareness without limit",
  },
  {
    value: "Jhana 7",
    label: "Jhana 7",
    hint: "nothingness, no object to rest on",
  },
  {
    value: "Jhana 8",
    label: "Jhana 8",
    hint: "neither perception nor non-perception",
  },
];

export function LogForm({
  action,
  defaultSeconds,
  fromTimer,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaultSeconds: number;
  fromTimer: boolean;
  /** Prefilled values, e.g. the anchor and theme chosen before the sit. */
  defaults?: Partial<Record<string, string>>;
}) {
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  // Manual path lets you edit minutes; timer path is fixed to what you sat.
  const [minutes, setMinutes] = useState(
    Math.max(1, Math.round(defaultSeconds / 60)),
  );

  // Drop the cursor straight into the first prompt so logging flows. When the
  // field is prefilled, put the caret after the existing text.
  useEffect(() => {
    const el = firstFieldRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
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
        <label className="font-serif text-lg text-ink">Duration</label>
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
          <Fragment key={f.name}>
            <label className="flex flex-col gap-1.5">
              <span className="font-serif text-lg text-ink">{f.label}</span>
              <textarea
                ref={i === 0 ? firstFieldRef : undefined}
                name={f.name}
                rows={2}
                defaultValue={defaults?.[f.name] ?? ""}
                placeholder={f.placeholder}
                className="w-full resize-y rounded-lg border border-hairline bg-paper-raised px-4 py-2.5 text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
              />
            </label>
            {/* The jhana question sits before the catch-all "Anything else". */}
            {f.name === "sensations" && <JhanaPicker />}
          </Fragment>
        ))}
      </fieldset>

      {/* Private notes — always just for the meditator. Visually set apart. */}
      <label className="flex flex-col gap-1.5 rounded-lg border border-clay/40 bg-clay/5 p-4">
        <span className="flex items-center gap-2 font-serif text-lg text-ink">
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
          className="breath btn-primary rounded-lg px-8 py-2.5 font-bold"
        >
          Save sit
        </button>
      </div>
    </form>
  );
}

/** "0:20", "5:03", or "20 min" — honest for both short and long sits. */
/**
 * "Did you experience any of the jhanas?" — stacked radios, each with a few
 * keywords as a reminder of what that state involves. Optional: "None" is an
 * honest answer, and leaving it untouched is fine too.
 */
function JhanaPicker() {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-serif text-lg text-ink">
        Did you experience any of the jhanas?
      </legend>

      <div className="flex flex-col divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-paper-raised">
        <JhanaOption value="" label="No — not this sit" hint="" />
        {JHANAS.map((j) => (
          <JhanaOption
            key={j.value}
            value={j.value}
            label={j.label}
            hint={j.hint}
          />
        ))}
      </div>
    </fieldset>
  );
}

function JhanaOption({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-baseline gap-3 px-4 py-2.5 transition hover:bg-accent-soft/40">
      <input
        type="radio"
        name="jhana"
        value={value}
        defaultChecked={value === ""}
        className="mt-0.5 shrink-0 accent-saffron"
      />
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

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
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
