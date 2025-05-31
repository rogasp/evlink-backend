// src/lib/authFetch.ts

import { apiFetchSafe } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

interface FetchWithAuthOptions extends RequestInit {
  accessToken: string;
}

/**
 * Performs a fetch with bearer token and retries once on 401 by refreshing the session.
 */
export async function authFetch(
  endpoint: string,
  options: FetchWithAuthOptions
) {
  const { accessToken, ...fetchOptions } = options;

  const makeRequest = async (token: string) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(fetchOptions.headers ?? {}),
    };
    try {
      return await apiFetchSafe(endpoint, { ...fetchOptions, headers });
    } catch (networkError) {
      console.error("Network error during fetch:", networkError);
      return { data: null, error: { message: String(networkError), status: 0 } };
    }
  };

  // First attempt
  let response = await makeRequest(accessToken);

  // Retry once on 401 Unauthorized
  if (response.error?.status === 401) {
    // Try refresh
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session?.access_token) {
      console.error("Failed to refresh session:", refreshError);
    } else {
      response = await makeRequest(refreshData.session.access_token);
    }
  }

  return response;
}
