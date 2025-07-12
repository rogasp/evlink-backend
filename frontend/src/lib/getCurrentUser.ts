import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient(); // ← await is important here! /* Hardcoded string */

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("❌ Failed to fetch user:", error.message); /* Hardcoded string */
    return null;
  }

  return user;
}
