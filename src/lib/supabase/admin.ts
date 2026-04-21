import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Use ONLY in server-side code
 * (webhook handlers, cron jobs). It bypasses RLS.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
