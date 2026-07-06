import { createClient } from "@supabase/supabase-js"

function env(key: string): string | undefined {
  return import.meta.env[`VITE_${key}`] ?? import.meta.env[`NEXT_PUBLIC_${key}`]
}

// Accept both VITE_ and NEXT_PUBLIC_ prefixes for convenience
const supabaseUrl = env("SUPABASE_URL")
const supabaseAnonKey = env("SUPABASE_ANON_KEY") ?? env("SUPABASE_PUBLISHABLE_KEY")

const hasCredentials = supabaseUrl && supabaseAnonKey

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    )
  }
  return supabase
}
