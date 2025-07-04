'use client';

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/authFetch";
import { toast } from "sonner";

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
      toast.error("No access token");
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
      toast.error(res.error.message || "Failed to create plan");
    } else {
      toast.success("Plan created!");
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
          New Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subscription Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            name="code"
            placeholder="Internal code (e.g. sms_50, pro_monthly)"
            required
            onChange={handleChange}
            value={form.code}
            autoFocus
          />
          <Input
            name="name"
            placeholder="Name (for Stripe product)"
            required
            onChange={handleChange}
            value={form.name}
          />
          <Input
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={form.description}
          />
          <Input
            name="amount"
            placeholder="Amount in cents (e.g. 499 for €4.99)"
            type="number"
            required
            onChange={handleChange}
            value={form.amount}
            min={0}
          />
          <Input
            name="currency"
            placeholder="Currency (e.g. eur)"
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
            <option value="recurring">Recurring</option>
            <option value="one_time">One Time</option>
          </select>
          {form.type === "recurring" && (
            <select
              name="interval"
              required
              onChange={handleChange}
              value={form.interval}
              className="w-full border rounded px-2 py-1"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
