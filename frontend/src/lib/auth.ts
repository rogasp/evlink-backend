import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJwt } from "jose";
import { apiFetchSafe } from "@/lib/api";

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

        const { data, error } = await apiFetchSafe("/login", {
          method: "POST",
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (error || !data) {
          console.error("Login failed:", error);
          return null;
        }

        return {
          id: data.user_id || data.email,
          email: credentials.email,
          accessToken: data.access_token,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.error = undefined;
      }

      if (!token.accessToken) {
        const { data, error } = await apiFetchSafe("/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        if (error || !data) {
          console.error("Failed to refresh access token");
          token.error = "RefreshAccessTokenError";
        } else {
          token.accessToken = data.access_token;
          token.error = undefined;
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
