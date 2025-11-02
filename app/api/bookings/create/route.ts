import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { providerId, serviceId, scheduledDate, durationHours, totalPrice, notes } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        provider_id: providerId,
        service_id: serviceId,
        scheduled_date: scheduledDate,
        duration_hours: durationHours,
        total_price: totalPrice,
        notes,
        booking_status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Booking creation error:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
