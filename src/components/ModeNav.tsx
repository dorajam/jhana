"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Two-mode navigation: a Meditator / Facilitator segmented switch, with each
// mode revealing only its own sub-tabs. Connections + Sign out are shared and
// live outside the modes (passed in as `trailing`).

type Mode = "meditator" | "facilitator";

const TABS: Record<Mode, { href: string; label: string }[]> = {
  meditator: [
    { href: "/practice", label: "Sit" },
    { href: "/history", label: "History" },
  ],
  facilitator: [{ href: "/students", label: "Students" }],
};

// Default landing page for each mode.
const MODE_HOME: Record<Mode, string> = {
  meditator: "/practice",
  facilitator: "/students",
};

function modeForPath(pathname: string): Mode {
  if (pathname.startsWith("/students")) return "facilitator";
  return "meditator";
}

export function ModeNav({ trailing }: { trailing: React.ReactNode }) {
  const pathname = usePathname();
  const mode = modeForPath(pathname);

  return (
    <div className="flex flex-1 items-center justify-between gap-6">
      {/* Mode switch + the active mode's sub-tabs */}
      <div className="flex items-center gap-6">
        <div className="inline-flex rounded-full border border-hairline bg-paper-raised p-0.5 text-sm">
          <ModeButton mode="meditator" active={mode === "meditator"}>
            Meditator
          </ModeButton>
          <ModeButton mode="facilitator" active={mode === "facilitator"}>
            Facilitator
          </ModeButton>
        </div>

        <nav className="hidden items-center gap-4 text-sm text-ink-soft sm:flex">
          {TABS[mode].map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`transition ${
                  active
                    ? "font-medium text-link"
                    : "hover:text-link"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Shared items (Connections, Sign out) */}
      <div className="flex items-center gap-5 text-sm text-ink-soft">
        {trailing}
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  active,
  children,
}: {
  mode: Mode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={MODE_HOME[mode]}
      className={`rounded-full px-3.5 py-1.5 transition ${
        active
          ? "bg-cobalt text-white"
          : "text-ink-soft hover:text-link"
      }`}
    >
      {children}
    </Link>
  );
}
