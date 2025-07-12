'use client';

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/authFetch";
import { toast } from "sonner";

/**
 * NewPlanModal component provides a modal form for administrators to create new subscription plans.
 * It integrates with the backend API to submit new plan details.
 */
export function NewPlanModal({ onCreated }: { onCreated?: () => void }) {
  const { accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    amount: "",
    currency: "eur",
    interval: "month",
    type: "recurring",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("No access token"); // Hardcoded string
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      amount: parseInt(form.amount, 10),
    };
    const res = await authFetch("/admin/subscription-plans", {
      method: "POST",
      accessToken,
      body: JSON.stringify(payload),
    });
    if (res.error) {
      toast.error(res.error.message || "Failed to create plan"); // Hardcoded string
    } else {
      toast.success("Plan created!"); // Hardcoded string
      setOpen(false);
      setForm({
        code: "",
        name: "",
        description: "",
        amount: "",
        currency: "eur",
        interval: "month",
        type: "recurring",
      });
      onCreated?.();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>
          New Plan {/* Hardcoded string */}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subscription Plan</DialogTitle> {/* Hardcoded string */}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            name="code"
            placeholder="Internal code (e.g. sms_50, pro_monthly)" // Hardcoded string
            required
            onChange={handleChange}
            value={form.code}
            autoFocus
          />
          <Input
            name="name"
            placeholder="Name (for Stripe product)" // Hardcoded string
            required
            onChange={handleChange}
            value={form.name}
          />
          <Input
            name="description"
            placeholder="Description" // Hardcoded string
            onChange={handleChange}
            value={form.description}
          />
          <Input
            name="amount"
            placeholder="Amount in cents (e.g. 499 for €4.99)" // Hardcoded string
            type="number"
            required
            onChange={handleChange}
            value={form.amount}
            min={0}
          />
          <Input
            name="currency"
            placeholder="Currency (e.g. eur)" // Hardcoded string
            required
            onChange={handleChange}
            value={form.currency}
          />
          <select
            name="type"
            required
            onChange={handleChange}
            value={form.type}
            className="w-full border rounded px-2 py-1"
          >
            <option value="recurring">Recurring</option> {/* Hardcoded string */}
            <option value="one_time">One Time</option> {/* Hardcoded string */}
          </select>
          {form.type === "recurring" && (
            <select
              name="interval"
              required
              onChange={handleChange}
              value={form.interval}
              className="w-full border rounded px-2 py-1"
            >
              <option value="month">Monthly</option> {/* Hardcoded string */}
              <option value="year">Yearly</option> {/* Hardcoded string */}
            </select>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create"} {/* Hardcoded string */}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}