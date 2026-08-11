import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7: the client is constructed with a driver adapter.
// Postgres everywhere, driven by DATABASE_URL (Neon in prod and local dev).
const connectionString = process.env.DATABASE_URL;

// Reuse a single PrismaClient across hot reloads in dev to avoid
// exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
