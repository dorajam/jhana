"use client";

import { useEffect, useRef, useState } from "react";

const PLACEHOLDER = `What was the object of your meditation?
What technique did you practice?
What distractions showed up?
What emotions did you experience?
Anything else?`;

export function LogForm({
  action,
  defaultDuration,
  fromTimer,
}: {
  action: (formData: FormData) => void;
  defaultDuration: number;
  fromTimer: boolean;
}) {
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Drop the cursor straight into the note so logging is one continuous act.
  useEffect(() => {
    noteRef.current?.focus();
  }, []);

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Duration: read-only chip when coming from the timer, editable otherwise. */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-ink-soft">Duration</label>
        {fromTimer ? (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent tabular-nums">
            {defaultDuration} min
          </span>
        ) : (
          <input
            type="number"
            name="durationMin"
            min={1}
            defaultValue={defaultDuration}
            className="w-24 rounded-md border border-hairline bg-paper-raised px-3 py-1.5 text-sm text-ink tabular-nums focus:border-accent focus:outline-none"
          />
        )}
        {fromTimer && (
          <input type="hidden" name="durationMin" value={defaultDuration} />
        )}
      </div>

      <input type="hidden" name="source" value={fromTimer ? "timer" : "manual"} />
      {!fromTimer && (
        <input
          type="datetime-local"
          name="occurredAt"
          className="w-full max-w-xs rounded-md border border-hairline bg-paper-raised px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
          defaultValue={toLocalInput(new Date())}
        />
      )}

      <textarea
        ref={noteRef}
        name="note"
        rows={8}
        placeholder={PLACEHOLDER}
        className="w-full resize-y rounded-lg border border-hairline bg-paper-raised px-4 py-3 text-ink placeholder:text-ink-faint/70 placeholder:leading-relaxed focus:border-accent focus:outline-none"
      />

      {/* Privacy toggle, right at the moment of writing (design doc §04). */}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-hairline bg-paper-raised px-4 py-3">
        <input
          type="checkbox"
          name="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="mt-1 accent-clay"
        />
        <span className="text-sm">
          <span className="font-medium text-ink">
            {isPrivate ? "Private — just for you" : "Shared with your teacher"}
          </span>
          <span className="mt-0.5 block text-ink-soft">
            {isPrivate
              ? "This note stays hidden. The sit still counts toward your streak."
              : "Your teacher will be able to read this note. Toggle to keep it private."}
          </span>
        </span>
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

/** Format a Date for a datetime-local input in the user's local zone. */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
