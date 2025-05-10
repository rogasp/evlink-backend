// src/lib/authFetch.ts

import { apiFetchSafe } from "@/lib/api";

interface FetchWithAuthOptions extends RequestInit {
  accessToken: string;
}

export async function authFetch(endpoint: string, options: FetchWithAuthOptions) {
  const { accessToken, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...(fetchOptions.headers || {}),
  };

  return apiFetchSafe(endpoint, {
    ...fetchOptions,
    headers,
  });
}
