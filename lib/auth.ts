import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./mongodb";
import User from "@/models/User";
import { checkLoginAttempts, recordFailedLogin, clearLoginAttempts } from '@/lib/rateLimit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Check lockout BEFORE password verification
        const lockStatus = await checkLoginAttempts(credentials.email)
        if (!lockStatus.allowed) {
          const minutesLeft = Math.ceil((lockStatus.lockedUntil! - Date.now()) / 60000)
          throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`)
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          const result = await recordFailedLogin(credentials.email)
          if (result.locked) {
            throw new Error(`ACCOUNT_LOCKED:15`)
          }
          throw new Error(`INVALID_CREDENTIALS:${result.count}`)
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          const result = await recordFailedLogin(credentials.email)
          if (result.locked) {
            throw new Error(`ACCOUNT_LOCKED:15`)
          }
          throw new Error(`INVALID_CREDENTIALS:${result.count}`)
        }

        if (!user.isVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // After successful login - clear attempts:
        await clearLoginAttempts(credentials.email)

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
