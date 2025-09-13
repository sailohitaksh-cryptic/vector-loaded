// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from './auth.config';
import type { User } from './src/app/lib/definitions'; // <-- CORRECTED PATH

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const { rows } = await sql`SELECT * FROM users WHERE email=${email}`;
          const user = rows[0];
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isadmin;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
});