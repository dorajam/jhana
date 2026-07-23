# Jhana

A quiet ledger for a Jhana meditation practice. Time a sit, log it honestly
the moment the bell fades, and (soon) let your teacher read your notes to track
real progression.

The guiding constraint: **logging must be near-frictionless**, so the timer is
built to be opened _before_ you sit — logging then becomes what you do when the
bell rings, in the same session, app already open.

## Status — Phase 1 complete

The core loop works end to end:

- **Sit** — duration picker, a calm countdown ring, a soft Web Audio bell.
- **Log** — opens automatically when the bell fades, duration pre-filled,
  cursor in the note. Free-form, with Jhana prompts as placeholder, and a
  per-session **private / shared** toggle right at the moment of writing.
- **History** — current streak, totals, and every sit re-readable (private
  ones marked).

Login is a Phase 1 **stub** (a single local user auto-created on first visit).
Real magic-link accounts, the teacher's read views, and invites arrive in
Phase 2 — see the design doc.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Prisma 7** with a **better-sqlite3** driver adapter
- **SQLite** locally — swap the adapter/url to Postgres to deploy
- **Tailwind v4**

## Data model

Four tables (`User`, `Session`, `Link`, `Invite`). Role is a property of the
`Link` _relationship_, not the user — the same person can be a meditator to
their teacher and a facilitator to a friend. See `prisma/schema.prisma`.

## Develop

```bash
npm install
npx prisma migrate dev   # create/upgrade the local SQLite db + client
npm run dev              # http://localhost:3000
```

If the Prisma client is missing after a fresh clone, run `npx prisma generate`.

## Roadmap

- **Phase 2** — magic-link auth, invite-by-link, the teacher's Roster and
  Student-detail read views, enforcing the one authorization rule (a
  facilitator reads a note iff an active link exists **and** the note isn't
  private).
- **Phase 3** — live-with-it polish (streak visual, roster gap flag).
- Later — teacher comments, a curated content library.
