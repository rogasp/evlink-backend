import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 👈 nu importeras från rätt plats

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
