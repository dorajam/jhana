import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7: connection config for the CLI (migrate/introspect) lives here.
// The runtime PrismaClient gets its driver adapter in src/lib/db.ts.
// Postgres everywhere, driven by DATABASE_URL.

// Minimal .env reader so the CLI has DATABASE_URL without a dotenv dependency.
function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.join(__dirname, ".env");
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env file; fall through
  }
  throw new Error("DATABASE_URL is not set (env or .env).");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: readDatabaseUrl(),
  },
});
