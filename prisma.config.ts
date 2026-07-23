import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7: connection config for the CLI (migrate/introspect) lives here,
// not in the schema. The runtime PrismaClient gets its driver adapter in
// src/lib/db.ts. Local SQLite for dev; swap the url to Postgres to deploy.
const dbPath = path.join(__dirname, "prisma", "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
