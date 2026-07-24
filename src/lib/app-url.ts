import { headers } from "next/headers";

/**
 * Absolute base URL of the app, for building links that leave the app (emails).
 * Prefers APP_URL, then Vercel's URL, then the incoming request's host.
 */
export async function appBaseUrl(): Promise<string> {
  if (process.env.APP_URL) return stripTrailingSlash(process.env.APP_URL);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fall back to the request headers (works in dev and behind proxies).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function stripTrailingSlash(u: string): string {
  return u.endsWith("/") ? u.slice(0, -1) : u;
}
