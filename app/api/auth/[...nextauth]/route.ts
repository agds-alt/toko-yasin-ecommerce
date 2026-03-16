import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/server/db/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        console.log("🔐 Login attempt:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ User not found");
          throw new Error("Invalid credentials");
        }

        console.log("✅ User found:", user.email);

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        console.log("🔑 Password valid?", isPasswordValid);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the user is redirected to the base URL after sign in
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Get the session to check user role
        // We need to return the redirect URL synchronously, so we use a workaround
        // The role will be available in the URL callback parameter
        return url;
      }

      // If URL starts with baseUrl, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default to baseUrl
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
