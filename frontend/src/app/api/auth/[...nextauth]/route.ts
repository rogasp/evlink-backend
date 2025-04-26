import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch("http://localhost:8000/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user_id || data.email, // Anpassa beroende på vad ditt /login svarar
            email: credentials.email,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // När användare loggar in
      if (user) {
        token.accessToken = user.accessToken; // Spara accessToken från authorize
      }
      return token;
    },
    async session({ session, token }) {
      // Lägg till accessToken i sessionen
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirectar till login vid error också
  },
  session: {
    strategy: "jwt", // Vi använder JWT sessions
  },
  secret: process.env.NEXTAUTH_SECRET || "defaultsecret123", // Lägg gärna i .env i production
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
