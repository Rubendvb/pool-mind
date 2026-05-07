import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Admin client uses the service-role key — bypasses RLS.
// Only use in trusted server-side contexts (cron routes, migrations).
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
