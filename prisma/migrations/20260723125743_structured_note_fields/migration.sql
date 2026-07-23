/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Session` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meditatorId" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "object" TEXT NOT NULL DEFAULT '',
    "technique" TEXT NOT NULL DEFAULT '',
    "distractions" TEXT NOT NULL DEFAULT '',
    "emotions" TEXT NOT NULL DEFAULT '',
    "other" TEXT NOT NULL DEFAULT '',
    "privateNotes" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'timer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_meditatorId_fkey" FOREIGN KEY ("meditatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "durationSec", "id", "meditatorId", "occurredAt", "source") SELECT "createdAt", "durationSec", "id", "meditatorId", "occurredAt", "source" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE INDEX "Session_meditatorId_occurredAt_idx" ON "Session"("meditatorId", "occurredAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
