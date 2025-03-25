import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Define a custom user type with role
interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}

// Export NextAuth handler - simpler configuration
export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          // Find the user by email - use select to specify exactly which fields to return
          // Only select fields that exist in the User model
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toString() },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              image: true
            }
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // Compare passwords - ensure values are strings
          const passwordMatch = await bcrypt.compare(
            credentials.password.toString(),
            user.password.toString()
          );

          if (!passwordMatch) {
            throw new Error("Invalid credentials");
          }

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "HOST",
            image: user.image
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Cast to our custom user type
        token.role = (user as CustomUser).role || "HOST";
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string
        }
      };
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  trustHost: true
}); 