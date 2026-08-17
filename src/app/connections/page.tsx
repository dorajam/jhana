import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
 createInvite,
 revokeInvite,
 requestConnect,
 approveLink,
 declineLink,
 revokeLink,
} from "@/lib/connection-actions";
import { InviteLink } from "@/components/InviteLink";

const MSG: Record<string, { text: string; tone: "ok" | "err" }> = {
 requested: { text: "Request sent. They’ll see it on their Connections page.", tone: "ok" },
 no_user: { text: "No account found with that email. Try inviting them by link instead.", tone: "err" },
 self: { text: "You can’t connect with yourself.", tone: "err" },
 exists: { text: "You’re already connected (or a request is pending).", tone: "err" },
};

export default async function ConnectionsPage({
 searchParams,
}: {
 searchParams: Promise<{ msg?: string }>;
}) {
 const user = await requireUser();
 const { msg } = await searchParams;

 const [links, invites] = await Promise.all([
 db.link.findMany({
 where: {
 status: { in: ["pending", "active"] },
 OR: [{ meditatorId: user.id }, { facilitatorId: user.id }],
 },
 include: { meditator: true, facilitator: true },
 orderBy: { createdAt: "desc" },
 }),
 db.invite.findMany({
 where: { fromUserId: user.id, expiresAt: { gt: new Date() } },
 orderBy: { createdAt: "desc" },
 }),
 ]);

 // Split links into buckets relative to the current user.
 const awaitingMe = links.filter((l) => {
 if (l.status !== "pending") return false;
 const approverId = l.requestedBy === "facilitator" ? l.meditatorId : l.facilitatorId;
 return approverId === user.id;
 });
 const awaitingThem = links.filter((l) => {
 if (l.status !== "pending") return false;
 const approverId = l.requestedBy === "facilitator" ? l.meditatorId : l.facilitatorId;
 return approverId !== user.id;
 });
 const active = links.filter((l) => l.status === "active");

 const other = (l: (typeof links)[number]) =>
 l.meditatorId === user.id ? l.facilitator : l.meditator;
 const myRoleInLink = (l: (typeof links)[number]) =>
 l.meditatorId === user.id ? "You are the student" : "You are the teacher";

 return (
 <div className="flex flex-col gap-10">
 <div className="flex flex-col gap-1">
 <p className="font-serif text-2xl text-ink">Connections</p>
 <p className="text-sm text-ink-soft">
 Link with a teacher who reviews your practice, or a student whose
 practice you review.
 </p>
 </div>

 {msg && MSG[msg] && (
 <p
 className={`rounded-lg border px-4 py-3 text-sm ${
 MSG[msg].tone === "ok"
 ? "border-accent/40 bg-accent-soft text-accent"
 : "border-clay/40 bg-clay/5 text-clay"
 }`}
 >
 {MSG[msg].text}
 </p>
 )}

 {/* Awaiting my approval */}
 {awaitingMe.length > 0 && (
 <section className="flex flex-col gap-3">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
 Needs your response
 </h2>
 {awaitingMe.map((l) => (
 <div
 key={l.id}
 className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent-soft px-5 py-4"
 >
 <div>
 <p className="text-sm font-medium text-ink">
 {other(l).displayName}{" "}
 <span className="font-normal text-ink-soft">({other(l).email})</span>
 </p>
 <p className="text-xs text-ink-soft">
 Wants to connect —{" "}
 {l.requestedBy === "facilitator"
 ? "as your teacher (they’d read your shared notes)"
 : "as your student (you’d read their shared notes)"}
 </p>
 </div>
 <div className="flex gap-2">
 <form action={approveLink}>
 <input type="hidden" name="linkId" value={l.id} />
 <button className="breath btn-primary rounded-lg px-4 py-1.5 text-sm font-bold">
 Approve
 </button>
 </form>
 <form action={declineLink}>
 <input type="hidden" name="linkId" value={l.id} />
 <button className="rounded-full border border-hairline px-4 py-1.5 text-sm text-ink-soft hover:border-clay hover:text-clay">
 Decline
 </button>
 </form>
 </div>
 </div>
 ))}
 </section>
 )}

 {/* Active connections */}
 <section className="flex flex-col gap-3">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
 Connected
 </h2>
 {active.length === 0 && awaitingThem.length === 0 ? (
 <p className="rounded-lg border border-dashed border-hairline px-5 py-6 text-sm text-ink-soft">
 No connections yet. Invite someone below.
 </p>
 ) : (
 <>
 {active.map((l) => (
 <div
 key={l.id}
 className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-paper-raised px-5 py-4"
 >
 <div>
 <p className="text-sm font-medium text-ink">
 {other(l).displayName}{" "}
 <span className="font-normal text-ink-soft">({other(l).email})</span>
 </p>
 <p className="text-xs text-ink-soft">{myRoleInLink(l)}</p>
 </div>
 <form action={revokeLink}>
 <input type="hidden" name="linkId" value={l.id} />
 <button className="text-xs text-ink-faint underline-offset-4 hover:text-clay hover:underline">
 Disconnect
 </button>
 </form>
 </div>
 ))}
 {awaitingThem.map((l) => (
 <div
 key={l.id}
 className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-paper-raised px-5 py-4"
 >
 <div>
 <p className="text-sm font-medium text-ink">{other(l).displayName}</p>
 <p className="text-xs text-ink-faint">Waiting for them to approve…</p>
 </div>
 <form action={revokeLink}>
 <input type="hidden" name="linkId" value={l.id} />
 <button className="text-xs text-ink-faint underline-offset-4 hover:text-clay hover:underline">
 Cancel
 </button>
 </form>
 </div>
 ))}
 </>
 )}
 </section>

 {/* Request to connect by email */}
 <section className="flex flex-col gap-3">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
 Connect with an existing member
 </h2>
 <form action={requestConnect} className="flex flex-col gap-3 rounded-lg border border-hairline bg-paper-raised p-5">
 <input
 type="email"
 name="email"
 required
 placeholder="their@email.com"
 className="w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
 />
 <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
 <label className="flex items-center gap-2">
 <input type="radio" name="role" value="facilitator" defaultChecked className="accent-accent" />
 They’re my teacher
 </label>
 <label className="flex items-center gap-2">
 <input type="radio" name="role" value="meditator" className="accent-accent" />
 They’re my student
 </label>
 </div>
 <button className="self-start breath btn-primary rounded-lg px-6 py-2 text-sm font-bold">
 Send request
 </button>
 </form>
 </section>

 {/* Invite by link */}
 <section className="flex flex-col gap-3">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
 Invite by link
 </h2>
 <p className="text-sm text-ink-soft">
 Share a link with someone not yet on Jhana. When they sign in through
 it, you’ll be connected automatically.
 </p>

 <form action={createInvite} className="flex flex-wrap items-center gap-4 rounded-lg border border-hairline bg-paper-raised p-5">
 <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
 <label className="flex items-center gap-2">
 <input type="radio" name="role" value="facilitator" defaultChecked className="accent-accent" />
 Invite my teacher
 </label>
 <label className="flex items-center gap-2">
 <input type="radio" name="role" value="meditator" className="accent-accent" />
 Invite my student
 </label>
 </div>
 <button className="breath btn-primary rounded-lg px-6 py-2 text-sm font-bold">
 Create invite link
 </button>
 </form>

 {invites.length > 0 && (
 <div className="flex flex-col gap-2">
 {invites.map((inv) => (
 <div
 key={inv.token}
 className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-paper-raised px-4 py-3"
 >
 <div className="min-w-0 flex-1">
 <p className="text-xs text-ink-faint">
 Invite for a {inv.intendedRole === "facilitator" ? "teacher" : "student"}
 </p>
 <InviteLink token={inv.token} />
 </div>
 <form action={revokeInvite}>
 <input type="hidden" name="token" value={inv.token} />
 <button className="text-xs text-ink-faint underline-offset-4 hover:text-clay hover:underline">
 Delete
 </button>
 </form>
 </div>
 ))}
 </div>
 )}
 </section>
 </div>
 );
}
