import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypasses Row Level Security — server-only, used exclusively inside admin
// Server Actions after verifying the caller is an admin. Never import this
// from a Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
