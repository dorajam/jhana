/*
  Warnings:

  - You are about to drop the column `durationMin` on the `Session` table. All the data in the column will be lost.
  - Added the required column `durationSec` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meditatorId" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'timer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_meditatorId_fkey" FOREIGN KEY ("meditatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "id", "isPrivate", "meditatorId", "note", "occurredAt", "source") SELECT "createdAt", "id", "isPrivate", "meditatorId", "note", "occurredAt", "source" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE INDEX "Session_meditatorId_occurredAt_idx" ON "Session"("meditatorId", "occurredAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
