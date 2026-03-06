import { createClient } from "@supabase/supabase-js";

// Service role client — use ONLY in API routes (server-side), never in components
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);