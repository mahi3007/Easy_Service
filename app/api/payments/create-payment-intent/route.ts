import { type NextRequest, NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, customerId, providerId } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.id !== customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        bookingId,
        customerId,
        providerId,
      },
      description: `Service booking payment - Booking ID: ${bookingId}`,
    })

    const { error: dbError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      customer_id: customerId,
      provider_id: providerId,
      amount,
      stripe_payment_intent_id: paymentIntent.id,
      payment_status: "pending",
      escrow_status: "held",
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
