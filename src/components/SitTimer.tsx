"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [5, 10, 15, 20, 30, 45];
const DEFAULT_MIN = 20;

type Phase = "idle" | "running" | "done";

export function SitTimer() {
  const router = useRouter();
  const [durationMin, setDurationMin] = useState(DEFAULT_MIN);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(DEFAULT_MIN * 60);
  const startAtRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  const totalSec = durationMin * 60;

  // Elapsed seconds since the sit began (at least 1 so a sit always counts).
  const elapsedSec = useCallback(() => {
    if (startAtRef.current == null) return totalSec;
    return Math.max(1, Math.round((Date.now() - startAtRef.current) / 1000));
  }, [totalSec]);

  // Head to the Log screen carrying the actual seconds sat.
  const goToLog = useCallback(
    (seconds: number) => {
      router.push(`/log?seconds=${seconds}&source=timer`);
    },
    [router]
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
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMin(m)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  m === durationMin
                    ? "border-saffron bg-saffron text-basalt"
                    : "border-hairline text-ink-soft hover:border-cobalt hover:text-link"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="breath breath-saffron rounded-lg bg-saffron px-10 py-3 text-lg font-bold text-basalt hover:bg-saffron-hover"
          >
            Begin
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
