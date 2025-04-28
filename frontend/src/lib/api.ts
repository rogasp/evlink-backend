// src/lib/api.tsx

import { toast } from "sonner";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const isInternalAuthRoute = endpoint.startsWith("/api/auth");

  const url = isInternalAuthRoute
    ? endpoint // gå direkt till Next.js egna auth API
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMessage = `API request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // no json body
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  } 
  catch (error: unknown) {
    console.error("apiFetch error:", error);

    if (error instanceof Error) {
      toast.error(error.message || "An unexpected error occurred");
    } else {
      toast.error("An unexpected error occurred");
    }

    throw error; // important: let the error propagate
  }
}

export async function apiFetchSafe(endpoint: string, options?: RequestInit) {
  const isInternalAuthRoute = endpoint.startsWith("/api/auth");

  const url = isInternalAuthRoute
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      console.warn("[apiFetchSafe] No JSON body returned");
    }

    if (!response.ok) {
      throw new Error(data?.detail || "Something went wrong");
    }

    return { data, error: null };
  } 
  catch (error: unknown) {
    console.error("[apiFetchSafe] error:", error);

    if (error instanceof Error) {
      toast.error(error.message || "Unknown error");
      return { data: null, error };
    } else {
      toast.error("Unknown error");
      return { data: null, error: new Error("Unknown error") };
    }
  }
}
