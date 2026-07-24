import { db } from "./db";

// Connection logic: the invite/request flows and the single authorization
// rule that governs whether a facilitator may read a meditator's notes.

/**
 * THE authorization rule (design doc §03).
 * A facilitator may read a meditator's shared notes iff an ACTIVE link exists
 * between them. (Private notes are never returned regardless — that filtering
 * happens where sessions are read.)
 */
export async function isActiveLink(
  facilitatorId: string,
  meditatorId: string
): Promise<boolean> {
  const link = await db.link.findFirst({
    where: { facilitatorId, meditatorId, status: "active" },
  });
  return link != null;
}

export type AcceptResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "self" };

/**
 * Accept an invite as the given user. The invite's `intendedRole` is the role
 * the *accepting* user takes; the inviter takes the opposite role. Creates (or
 * activates) the Link, then consumes the invite.
 */
export async function acceptInviteForUser(
  inviteToken: string,
  userId: string
): Promise<AcceptResult> {
  const invite = await db.invite.findUnique({ where: { token: inviteToken } });
  if (!invite) return { ok: false, reason: "not_found" };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (invite.fromUserId === userId) return { ok: false, reason: "self" };

  // Work out who is the meditator and who is the facilitator.
  const { meditatorId, facilitatorId } =
    invite.intendedRole === "meditator"
      ? { meditatorId: userId, facilitatorId: invite.fromUserId }
      : { meditatorId: invite.fromUserId, facilitatorId: userId };

  await db.link.upsert({
    where: { meditatorId_facilitatorId: { meditatorId, facilitatorId } },
    create: { meditatorId, facilitatorId, status: "active", requestedBy: "meditator" },
    update: { status: "active" },
  });

  // Consume the invite so the link can't be re-used.
  await db.invite.delete({ where: { token: inviteToken } });

  return { ok: true };
}

/**
 * Request to connect with an existing user by email. `role` is the role the
 * *requester* wants to take. Creates a pending Link the other party approves.
 */
export type RequestResult =
  | { ok: true }
  | { ok: false; reason: "no_user" | "self" | "exists" };

export async function requestConnection(
  requesterId: string,
  targetEmail: string,
  role: "meditator" | "facilitator"
): Promise<RequestResult> {
  const target = await db.user.findUnique({
    where: { email: targetEmail.trim().toLowerCase() },
  });
  if (!target) return { ok: false, reason: "no_user" };
  if (target.id === requesterId) return { ok: false, reason: "self" };

  const { meditatorId, facilitatorId } =
    role === "meditator"
      ? { meditatorId: requesterId, facilitatorId: target.id }
      : { meditatorId: target.id, facilitatorId: requesterId };

  const existing = await db.link.findUnique({
    where: { meditatorId_facilitatorId: { meditatorId, facilitatorId } },
  });
  if (existing && existing.status !== "revoked") {
    return { ok: false, reason: "exists" };
  }

  await db.link.upsert({
    where: { meditatorId_facilitatorId: { meditatorId, facilitatorId } },
    create: { meditatorId, facilitatorId, status: "pending", requestedBy: role },
    update: { status: "pending", requestedBy: role },
  });

  return { ok: true };
}
