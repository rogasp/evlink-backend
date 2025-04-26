import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { decodeJwt } from "jose"; // Lägg till denna rad!

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
      if (user) {
        token.accessToken = user.accessToken;
        token.error = undefined;
      }

      // Om ingen accessToken ➔ försök använda refresh_token
      if (!token.accessToken) {
        try {
          const res = await fetch("http://localhost:8000/api/refresh-token", {
            method: "POST",
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.access_token;
            token.error = undefined;
          } else {
            console.error("Failed to refresh access token (response not ok)");
            token.error = "RefreshAccessTokenError";
          }
        } catch (error) {
          console.error("Failed to refresh access token", error);
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },

    async session({ session, token }) {
      let userId = null;

      if (token?.accessToken) {
        try {
          const decoded = decodeJwt(token.accessToken as string) as { sub?: string };
          userId = decoded.sub ?? null;
        } catch (error) {
          console.error("Failed to decode JWT:", error);
        }
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: userId,
        },
        accessToken: token.accessToken,
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "defaultsecret123",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
