import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username?: string;
      balance?: number;
      realBalance?: number;
      inviteCode?: string;
      role?: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Set role at sign-in time — session callback keeps it fresh for UI
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, email: true, username: true, name: true, avatarUrl: true, inviteCode: true, role: true },
        });
        const wallet = await prisma.wallet.findUnique({
          where: { userId: token.id as string },
          select: { balance: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.email = dbUser.email;
          session.user.name = dbUser.name;
          session.user.image = dbUser.avatarUrl;
          (session.user as any).username = dbUser.username;
          (session.user as any).balance = Number(wallet?.balance ?? 10000);
          (session.user as any).realBalance = Number(wallet?.balance ?? 0);
          (session.user as any).inviteCode = dbUser.inviteCode;
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
});
