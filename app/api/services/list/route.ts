import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const serviceType = searchParams.get("type")
    const search = searchParams.get("search")

    let query = supabase
      .from("services")
      .select(
        `
        id,
        service_name,
        category,
        service_type,
        description,
        hourly_rate,
        base_price,
        provider_id,
        profiles:provider_id(first_name, last_name, avatar_url),
        provider_verification(badge_level, verification_status)
      `,
      )
      .eq("availability_status", "available")

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (serviceType && serviceType !== "all") {
      query = query.eq("service_type", serviceType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }

    let filtered = data || []

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (service: any) =>
          service.service_name.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Services list error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
