// src/types/api.ts
export type ApiResponse<T> = {
  data: T | null;
  error: { message?: string; [key: string]: unknown } | null;
};
