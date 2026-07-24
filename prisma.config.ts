import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7: connection config for the CLI (migrate/introspect) lives here.
// The runtime PrismaClient gets its driver adapter in src/lib/db.ts.
//
// Migrations must use a DIRECT (non-pooled) connection — PgBouncer/Neon pooling
// doesn't support the migration protocol. So the CLI prefers DIRECT_DATABASE_URL
// and only falls back to DATABASE_URL when it isn't set (e.g. simple local dev).

// Minimal .env reader so the CLI has a URL without a dotenv dependency.
function readEnv(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const text = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`));
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env file
  }
  return undefined;
}

function migrationUrl(): string {
  const url = readEnv("DIRECT_DATABASE_URL") ?? readEnv("DATABASE_URL");
  if (!url) throw new Error("Set DIRECT_DATABASE_URL or DATABASE_URL.");
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl(),
  },
});
