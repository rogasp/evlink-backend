// src/lib/api.tsx

import { toast } from "sonner";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// src/lib/api.ts
export async function apiFetchSafe(endpoint: string, options?: RequestInit) {
  const isInternalAuthRoute = endpoint.startsWith('/api/auth');

  const url = isInternalAuthRoute
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      console.warn('[apiFetchSafe] No JSON body returned');
    }

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data?.detail || `Request failed with status ${response.status}`,
          status: response.status, // 👈 här är tillägget
        },
      };
    }

    return { data, error: null };
  } catch (error: unknown) {
    console.error('[apiFetchSafe] error:', error);

    const errorObj: { message: string; status?: number } =
      error instanceof Error
        ? { message: error.message }
        : { message: 'Unknown error' };

    toast.error(errorObj.message);
    return { data: null, error: errorObj };
  }
}
