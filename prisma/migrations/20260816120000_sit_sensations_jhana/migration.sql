-- Add two reflection fields to Sit: physical sensations during the sit, and
-- which jhana (if any) was reached.
ALTER TABLE "Sit" ADD COLUMN "sensations" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Sit" ADD COLUMN "jhana" TEXT NOT NULL DEFAULT '';
