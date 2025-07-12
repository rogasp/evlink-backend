// src/lib/services/customers.ts

import { authFetch } from "@/lib/authFetch";
import { supabase } from "@/lib/supabaseClient"; // Add import for supabase

// 1) TypeScript type that reflects your Postgres table /* Hardcoded string */
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

// 2) List all customers /* Hardcoded string */
export async function getCustomers(): Promise<Customer[]> {
  const token = await getAccessToken();
  const { data, error } = await authFetch("/api/admin/users", {
    method: "GET",
    accessToken: token,
  });
  if (error) throw new Error(error.message || "Failed to fetch customers"); /* Hardcoded string */
  return data as Customer[];
}

// 3) Get a customer /* Hardcoded string */
export async function getCustomerById(id: string): Promise<Customer> {
  const token = await getAccessToken();
  const { data, error } = await authFetch(`/api/admin/users/${id}`, {
    method: "GET",
    accessToken: token,
  });
  if (error) throw new Error(error.message || "Failed to fetch customer"); /* Hardcoded string */
  return data as Customer;
}

// 4) Update a customer /* Hardcoded string */
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
  if (error) throw new Error(error.message || "Failed to update customer"); /* Hardcoded string */
  return data as Customer;
}

// 5) Create new customer /* Hardcoded string */
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
  if (error) throw new Error(error.message || "Failed to create customer"); /* Hardcoded string */
  return data as Customer;
}

// Helper function to get token from Supabase session /* Hardcoded string */
async function getAccessToken(): Promise<string> {
  const { data: { session }, } = await supabase.auth.getSession();
  return session?.access_token || "";
}
