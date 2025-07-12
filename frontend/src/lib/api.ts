// src/lib/api.ts

import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// If you're using Next.js rewrites to proxy `/api/*` to your FastAPI backend,
// then any fetch to a path starting with `/api/` should go through the same origin (3000)
// and be rewritten by Next.js. Other calls (e.g. `/api/auth/*`) remain local to Next.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Safe wrapper around fetch that:
 * - If endpoint starts with '/api/', uses same-origin and Next.js rewrite.
 * - Otherwise, prefixes API_BASE_URL if provided.
 * - Automatically injects Supabase JWT from session.
 */
export async function apiFetchSafe(
  endpoint: string,
  options?: RequestInit
) {
  // Determine full URL
  let url: string;
  if (endpoint.startsWith("/api/")) {
    // use same-origin so Next.js rewrites to backend
    url = endpoint;
  } else {
    // external route (e.g. auth routes or others)
    const base = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    url = `${base}${path}`;
  }

  // Inject Supabase JWT if available
  let tokenHeader = {};
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      tokenHeader = { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // ignore
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...tokenHeader,
        ...(options?.headers || {}),
      },
    });

    let data = null;
    try {
      console.warn("[apiFetchSafe] No JSON body returned"); /* Hardcoded string */
      data = await response.json();
    } catch {
      // No JSON body returned
    }

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data?.detail || `Request failed with status ${response.status}`, /* Hardcoded string */
          status: response.status,
        },
      };
    }

    return { data, error: null };
  } catch (err: unknown) {
    console.error("[apiFetchSafe] error:", err); /* Hardcoded string */
    const message = err instanceof Error ? err.message : "Unknown error"; /* Hardcoded string */
    toast.error(message);
    return { data: null, error: { message } };
  }
}
