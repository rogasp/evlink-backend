import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient(); // ← här är await viktigt!

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("❌ Failed to fetch user:", error.message);
    return null;
  }

  return user;
}
