// src/lib/services/customers.ts

import { authFetch } from "@/lib/authFetch";
import { supabase } from "@/lib/supabaseClient"; // Add import for supabase

// 1) TypeScript-typ som speglar er Postgres-tabell
export interface Customer {
  id: string;
  email: string;
  created_at: string;           // ISO‐timestamp
  role: string;
  name: string | null;
  is_approved: boolean;
  accepted_terms: boolean | null;
  notify_offline: boolean;
  is_subscribed: boolean;
  tier: string;
  linked_vehicle_count: number;
  stripe_customer_id: string;
  subscription_status: string;
  sms_credits: number;
}

// 2) Lista alla kunder
export async function getCustomers(): Promise<Customer[]> {
  const token = await getAccessToken();
  const { data, error } = await authFetch("/api/admin/users", {
    method: "GET",
    accessToken: token,
  });
  if (error) throw new Error(error.message);
  return data as Customer[];
}

// 3) Hämta en kund
export async function getCustomerById(id: string): Promise<Customer> {
  const token = await getAccessToken();
  const { data, error } = await authFetch(`/api/admin/users/${id}`, {
    method: "GET",
    accessToken: token,
  });
  if (error) throw new Error(error.message);
  return data as Customer;
}

// 4) Uppdatera en kund
export interface UpdateCustomerPayload {
  email?: string;
  name?: string;
  role?: string;
  is_approved?: boolean;
  notify_offline?: boolean;
  is_subscribed?: boolean;
  tier?: string;
  sms_credits?: number;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  const token = await getAccessToken();
  const { data, error } = await authFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    accessToken: token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (error) throw new Error(error.message);
  return data as Customer;
}

// 5) Skapa ny kund
export interface CreateCustomerPayload {
  email: string;
  name?: string;
  role?: string;
  accepted_terms?: boolean;
  notify_offline?: boolean;
  is_subscribed?: boolean;
  tier?: string;
  sms_credits?: number;
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  const token = await getAccessToken();
  const { data, error } = await authFetch(`/api/admin/users`, {
    method: "POST",
    accessToken: token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (error) throw new Error(error.message);
  return data as Customer;
}

// Hjälpfunc för att plocka token från Supabase session
async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || "";
}
