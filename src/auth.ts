import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

// Auth.js (NextAuth v5) with Google. Sessions are stored in the DB via the
// Prisma adapter (strategy: "database"), replacing the old magic-link system.
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      // Always show the account chooser, so a signed-in Google user can pick a
      // different account instead of being silently logged in with their only
      // active session.
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Expose the user id on the session object for our app code.
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    // Our User model needs a non-null displayName; seed it from the Google
    // profile name (or email local-part) when the account is first created.
    async createUser({ user }) {
      const display =
        user.name?.trim() ||
        user.email?.split("@")[0] ||
        "Meditator";
      await db.user.update({
        where: { id: user.id },
        data: { displayName: display },
      });
    },
  },
});
