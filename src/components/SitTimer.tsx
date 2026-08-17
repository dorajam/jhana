"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [5, 10, 15, 20, 30, 45];
const DEFAULT_MIN = 20;

// What attention rests on, and what quality the sit is exploring. Both are
// optional intentions set before starting; they prefill the log afterwards so
// the reflection starts from what you actually set out to do.
const ANCHORS = ["mantra", "breath", "memory"];
// `label` keeps the row to one line; `value` is what gets logged.
const THEMES = [
  { value: "relaxation", label: "relaxation" },
  { value: "curiosity", label: "curiosity" },
  { value: "enjoyment", label: "enjoyment" },
  { value: "relationship with distractions", label: "distractions" },
];

type Phase = "idle" | "running" | "done";

export function SitTimer() {
  const router = useRouter();
  const [durationMin, setDurationMin] = useState(DEFAULT_MIN);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(DEFAULT_MIN * 60);
  const [anchor, setAnchor] = useState<string | null>(null);
  // Practising is multi-select — a sit can explore several qualities at once.
  const [themes, setThemes] = useState<string[]>([]);

  const toggleTheme = useCallback((value: string) => {
    setThemes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }, []);
  const startAtRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  const totalSec = durationMin * 60;

  // Elapsed seconds since the sit began (at least 1 so a sit always counts).
  const elapsedSec = useCallback(() => {
    if (startAtRef.current == null) return totalSec;
    return Math.max(1, Math.round((Date.now() - startAtRef.current) / 1000));
  }, [totalSec]);

  // Head to the Log screen carrying the actual seconds sat, plus whatever
  // intentions were set so the reflection starts prefilled.
  const goToLog = useCallback(
    (seconds: number) => {
      const params = new URLSearchParams({
        seconds: String(seconds),
        source: "timer",
      });
      if (anchor) params.set("object", anchor);
      if (themes.length) params.set("technique", themes.join(", "));
      router.push(`/log?${params}`);
    },
    [router, anchor, themes]
  );

  // Countdown tick. Uses an absolute end time so it stays accurate even if
  // the tab is backgrounded and setInterval drifts.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      if (endAtRef.current == null) return;
      const left = Math.round((endAtRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        setPhase("done");
        clearInterval(id);
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  // Ring the bell + move to logging when the sit completes on its own.
  useEffect(() => {
    if (phase !== "done") return;
    ringBell();
    const seconds = totalSec; // ran the full length
    const t = setTimeout(() => goToLog(seconds), 2200);
    return () => clearTimeout(t);
  }, [phase, totalSec, goToLog]);

  const start = useCallback(() => {
    const now = Date.now();
    startAtRef.current = now;
    endAtRef.current = now + totalSec * 1000;
    setRemaining(totalSec);
    setPhase("running");
  }, [totalSec]);

  // "End early" now *logs* the elapsed sit rather than discarding it, so you
  // can record a short sit (e.g. for testing) and still land on the log.
  const endEarly = useCallback(() => {
    const seconds = elapsedSec();
    endAtRef.current = null;
    ringBell();
    goToLog(seconds);
  }, [elapsedSec, goToLog]);

  const progress = phase === "idle" ? 0 : 1 - remaining / totalSec;

  return (
    <div className="mt-6 flex flex-col items-center gap-8">
      <TimerRing
        progress={progress}
        label={
          phase === "done" ? "○" : formatClock(phase === "idle" ? totalSec : remaining)
        }
        dimmed={phase === "done"}
      />

      {phase === "idle" && (
        <>
          {/* Left-aligned rows keep each group on a single line, so the whole
              set-up stays visible without scrolling. Length is required;
              anchor and practising are optional intentions. */}
          <div className="mt-2 flex w-full max-w-2xl flex-col gap-3">
            <OptionRow label="Length">
              {PRESETS.map((m) => (
                <Chip
                  key={m}
                  selected={m === durationMin}
                  onClick={() => setDurationMin(m)}
                >
                  {m} min
                </Chip>
              ))}
            </OptionRow>

            <OptionRow label="Anchor">
              {ANCHORS.map((a) => (
                <Chip
                  key={a}
                  selected={a === anchor}
                  onClick={() => setAnchor(a === anchor ? null : a)}
                >
                  {a}
                </Chip>
              ))}
            </OptionRow>

            <OptionRow label="Practising">
              {THEMES.map((t) => (
                <Chip
                  key={t.value}
                  selected={themes.includes(t.value)}
                  onClick={() => toggleTheme(t.value)}
                >
                  {t.label}
                </Chip>
              ))}
            </OptionRow>
          </div>

          <button
            type="button"
            onClick={start}
            className="breath breath-saffron mt-3 rounded-lg bg-saffron px-10 py-3 text-lg font-bold text-basalt hover:bg-saffron-hover"
          >
            Start timer
          </button>
        </>
      )}

      {phase === "running" && (
        <button
          type="button"
          onClick={endEarly}
          className="rounded-full border-2 border-accent bg-accent-soft px-8 py-2.5 font-medium text-accent-strong transition hover:bg-accent hover:text-paper"
        >
          End &amp; log now
        </button>
      )}

      {phase === "done" && (
        <p className="animate-pulse text-sm text-ink-soft">
          Resting the bell&hellip; opening your log.
        </p>
      )}
    </div>
  );
}

/** A selectable pill. Saffron when active, per the brand's active-state rule. */
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        selected
          ? "border-saffron bg-saffron font-medium text-basalt"
          : "border-hairline text-ink-soft hover:border-cobalt hover:text-link"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * A labelled row of options: label on the left, chips on the right. Stacks on
 * narrow screens where a single line won't fit.
 */
function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <p className="shrink-0 text-xs font-medium uppercase tracking-widest text-ink-faint sm:w-24">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function TimerRing({
  progress,
  label,
  dimmed,
}: {
  progress: number;
  label: string;
  dimmed?: boolean;
}) {
  const size = 240;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.4s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-serif tabular-nums ${
            dimmed ? "text-4xl text-link" : "text-5xl text-ink"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** A soft two-tone bell using the Web Audio API — no audio asset needed. */
function ringBell() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const tone = (freq: number, at: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.4, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + dur);
    };

    // Two gentle strikes.
    tone(528, 0, 1.8);
    tone(396, 0.9, 2.2);
    setTimeout(() => ctx.close(), 4000);
  } catch {
    // Audio may be blocked; the visual transition still carries the moment.
  }
}
