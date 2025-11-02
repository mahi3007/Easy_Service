import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const safeFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "network_error", message: "Unable to reach Supabase" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment configuration")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: safeFetch,
    },
  })
}
