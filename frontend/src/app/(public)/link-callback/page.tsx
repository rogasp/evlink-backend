'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { authFetch } from "@/lib/authFetch";

export default function LinkCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    console.log("[🔁 link-callback] Running useEffect");

    const linkToken =
      typeof window !== "undefined"
        ? localStorage.getItem("linkToken")
        : null;

    console.log("[📦 link-callback] Retrieved linkToken:", linkToken);
    console.log("[📦 link-callback] Session accessToken:", session?.accessToken);

    if (!linkToken || !session?.accessToken) {
      console.warn("[⚠️ link-callback] Missing token or session");
      toast.error("Missing link token or session");
      router.push("/dashboard");
      return;
    }

    const sendResult = async () => {
      console.log("[📡 link-callback] Sending token to backend");

      const { data, error } = await authFetch("/user/link-result", {
        method: "POST",
        accessToken: session.accessToken as string,
        body: JSON.stringify({ linkToken }),
      });

      // Remove token from storage after use
      localStorage.removeItem("linkToken");

      if (error) {
        console.error("[❌ link-callback] Error from backend:", error);
        toast.error("Link result failed");
      } else {
        console.log("[✅ link-callback] Vehicle linked:", data);
        toast.success(`Vehicle linked: ${data.vendor || "Success"}`);
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    };

    sendResult();
  }, [status, router, session]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Processing link...</h1>
        <p className="text-gray-600">Please wait while we finalize your connection.</p>
      </div>
    </main>
  );
}
