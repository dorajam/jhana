-- CreateEnum
CREATE TYPE "SessionSource" AS ENUM ('timer', 'manual');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('pending', 'active', 'revoked');

-- CreateEnum
CREATE TYPE "LinkRole" AS ENUM ('meditator', 'facilitator');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicToken" (
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviteToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "meditatorId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "object" TEXT NOT NULL DEFAULT '',
    "technique" TEXT NOT NULL DEFAULT '',
    "distractions" TEXT NOT NULL DEFAULT '',
    "emotions" TEXT NOT NULL DEFAULT '',
    "other" TEXT NOT NULL DEFAULT '',
    "privateNotes" TEXT NOT NULL DEFAULT '',
    "source" "SessionSource" NOT NULL DEFAULT 'timer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "meditatorId" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'pending',
    "requestedBy" "LinkRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "token" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "intendedRole" "LinkRole" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "MagicToken_email_idx" ON "MagicToken"("email");

-- CreateIndex
CREATE INDEX "Session_meditatorId_occurredAt_idx" ON "Session"("meditatorId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Link_meditatorId_facilitatorId_key" ON "Link"("meditatorId", "facilitatorId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_meditatorId_fkey" FOREIGN KEY ("meditatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_meditatorId_fkey" FOREIGN KEY ("meditatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
