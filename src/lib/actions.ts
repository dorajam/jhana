"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { requireUser } from "./auth";

/**
 * Save a logged sit. Called from the Log form (both the after-bell flow
 * and the manual "log a past sit" flow).
 */
export async function logSession(formData: FormData) {
  const user = await requireUser();

  const durationSec = Math.max(
    1,
    Math.round(Number(formData.get("durationSec")) || 0)
  );
  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const source = formData.get("source") === "manual" ? "manual" : "timer";

  // occurredAt: use the submitted value if present (manual log), else now.
  const occurredRaw = formData.get("occurredAt");
  const occurredAt = occurredRaw
    ? new Date(String(occurredRaw))
    : new Date();

  await db.sit.create({
    data: {
      meditatorId: user.id,
      durationSec,
      object: field("object"),
      technique: field("technique"),
      distractions: field("distractions"),
      emotions: field("emotions"),
      other: field("other"),
      privateNotes: field("privateNotes"),
      source,
      occurredAt,
    },
  });

  revalidatePath("/history");
  redirect("/history");
}
