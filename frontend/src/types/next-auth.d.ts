// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // 👈 Här lägger vi till accessToken i Session-typen
  }

  interface User {
    accessToken?: string; // (om du också vill lägga till på User-objektet)
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string; // 👈 Lägg till i JWT-token också
  }
}
