"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  useEffect(() => {
    // This handles the OAuth callback and email confirmation
    const handleAuthCallback = async () => {
      try {
        // Check if there's a code in the URL (from email verification)
        const code = searchParams.get("code")
        
        if (code) {
          // Exchange the code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError.message)
            router.push("/auth/auth-code-error")
            return
          }
        }
        
        // Get the current session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth callback error:", error.message)
          router.push("/auth/auth-code-error")
          return
        }

        if (data?.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single()

          if (profile?.role === "provider") {
            router.push("/provider/home")
          } else if (profile?.role === "customer") {
            router.push("/customer/home")
          } else if (profile?.role === "admin") {
            router.push("/admin/dashboard")
          } else {
            // Default redirect if role is not set
            router.push("/")
          }
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error in auth callback:", error)
        router.push("/auth/auth-code-error")
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verifying your account...</h2>
          <p className="mt-2 text-gray-600">
            Please wait while we complete the authentication process.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        </div>
      </div>
    </div>
  )
}