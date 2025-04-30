"use client";

import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { data: session } = useSession();

  const handleSubscribe = async () => {
    if (!session?.accessToken) return;

    try {
      const res = await fetch("/backend/api/admin/webhook/subscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Subscription failed");

      const data = await res.json();
      toast.success("Webhook subscription successful!");
      console.log(data);
    } catch (err) {
      toast.error("Webhook subscription failed");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700">Admin Panel</h1>

      <Button onClick={handleSubscribe} variant="default">
        Subscribe to Webhooks
      </Button>
    </div>
  );
}
