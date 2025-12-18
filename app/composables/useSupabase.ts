import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const useSupabase = () => {
  if (client) return client
  const supabaseUrl = import.meta.env.SUPABASE_URL!
  const supabaseKey = import.meta.env.SUPABASE_ROLE_KEY!
  client = createClient(supabaseUrl, supabaseKey)
  return client
}

