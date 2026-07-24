"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { requireUser } from "./auth";
import { requestConnection } from "./connections";

const INVITE_DAYS = 14;

/**
 * Create a shareable invite link. `role` is the role the *recipient* will take
 * when they accept (so inviting your teacher => intendedRole "facilitator").
 * Returns nothing; the invite is read back on the Connections page.
 */
export async function createInvite(formData: FormData): Promise<void> {
  const user = await requireUser();
  const role =
    formData.get("role") === "meditator" ? "meditator" : "facilitator";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_DAYS);

  await db.invite.create({
    data: { fromUserId: user.id, intendedRole: role, expiresAt },
  });

  revalidatePath("/connections");
}

/** Delete an invite the current user created. */
export async function revokeInvite(formData: FormData): Promise<void> {
  const user = await requireUser();
  const token = String(formData.get("token") ?? "");
  await db.invite.deleteMany({ where: { token, fromUserId: user.id } });
  revalidatePath("/connections");
}

/** Request to connect with an existing user by email. */
export async function requestConnect(formData: FormData): Promise<void> {
  const user = await requireUser();
  const email = String(formData.get("email") ?? "");
  // The form value is the *target's* role ("They're my teacher" => the other
  // person is the facilitator). requestConnection wants the *requester's*
  // role, so flip it.
  const targetRole =
    formData.get("role") === "facilitator" ? "facilitator" : "meditator";
  const requesterRole =
    targetRole === "facilitator" ? "meditator" : "facilitator";

  const result = await requestConnection(user.id, email, requesterRole);
  const status = result.ok ? "requested" : result.reason;
  revalidatePath("/connections");
  // Surface the outcome via a query param the page can read.
  const { redirect } = await import("next/navigation");
  redirect(`/connections?msg=${status}`);
}

/** Approve a pending link where the current user is the party being asked. */
export async function approveLink(formData: FormData): Promise<void> {
  const user = await requireUser();
  const linkId = String(formData.get("linkId") ?? "");

  const link = await db.link.findUnique({ where: { id: linkId } });
  if (!link || link.status !== "pending") return;

  // The approver must be the party who did NOT request.
  const approverIsMeditator = link.requestedBy === "facilitator";
  const approverId = approverIsMeditator ? link.meditatorId : link.facilitatorId;
  if (approverId !== user.id) return;

  await db.link.update({ where: { id: linkId }, data: { status: "active" } });
  revalidatePath("/connections");
}

/** Decline (delete) a pending link addressed to the current user. */
export async function declineLink(formData: FormData): Promise<void> {
  const user = await requireUser();
  const linkId = String(formData.get("linkId") ?? "");

  const link = await db.link.findUnique({ where: { id: linkId } });
  if (!link || link.status !== "pending") return;

  const approverIsMeditator = link.requestedBy === "facilitator";
  const approverId = approverIsMeditator ? link.meditatorId : link.facilitatorId;
  if (approverId !== user.id) return;

  await db.link.delete({ where: { id: linkId } });
  revalidatePath("/connections");
}

/** Revoke an active link the current user is part of (either side may end it). */
export async function revokeLink(formData: FormData): Promise<void> {
  const user = await requireUser();
  const linkId = String(formData.get("linkId") ?? "");

  const link = await db.link.findUnique({ where: { id: linkId } });
  if (!link) return;
  if (link.meditatorId !== user.id && link.facilitatorId !== user.id) return;

  await db.link.update({ where: { id: linkId }, data: { status: "revoked" } });
  revalidatePath("/connections");
  revalidatePath("/students");
}
