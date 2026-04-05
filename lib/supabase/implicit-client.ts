import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Implicit flow client — for use cases where the magic link opens in a different
// browser/tab than where the request originated (e.g., student signup email).
export function createImplicitClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      auth: {
        flowType: 'implicit',
        storageKey: 'sb-auth-token',
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}
