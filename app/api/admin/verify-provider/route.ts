import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { verificationId, providerId, approved } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, check if user is admin
    if (approved) {
      const { error } = await supabase
        .from("provider_verification")
        .update({
          verification_status: "verified",
          badge_level: "bronze",
          verification_date: new Date().toISOString(),
        })
        .eq("id", verificationId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from("provider_verification")
        .update({
          verification_status: "rejected",
        })
        .eq("id", verificationId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
  }
}
