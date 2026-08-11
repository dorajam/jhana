import type { DefaultSession } from "next-auth";

// Expose `id` on session.user for our app code.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
