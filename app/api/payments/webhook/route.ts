import { type NextRequest, NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const { error } = await supabase
          .from("payments")
          .update({
            payment_status: "completed",
            escrow_status: "held", // Held until service completion
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        if (error) {
          console.error("Failed to update payment:", error)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const { error } = await supabase
          .from("payments")
          .update({
            payment_status: "refunded",
            escrow_status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        if (error) {
          console.error("Failed to update payment:", error)
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge

        if (charge.payment_intent) {
          const { error } = await supabase
            .from("payments")
            .update({
              payment_status: "refunded",
              escrow_status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", charge.payment_intent as string)

          if (error) {
            console.error("Failed to update refunded payment:", error)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
