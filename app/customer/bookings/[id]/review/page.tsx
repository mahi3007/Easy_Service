"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BookingDetail {
  id: string
  service_id: string
  provider_id: string
  booking_status: string
  total_price: number
  services: {
    service_name: string
  }
  profiles: {
    first_name: string
    last_name: string
  }
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }
        setUser(currentUser)

        // Fetch booking
        const { data: bookingData } = await supabase
          .from("bookings")
          .select(
            `
            id,
            service_id,
            provider_id,
            booking_status,
            total_price,
            services:service_id(service_name),
            profiles:provider_id(first_name, last_name)
          `,
          )
          .eq("id", bookingId)
          .eq("customer_id", currentUser.id)
          .single()

        if (!bookingData) {
          toast.error("Booking not found")
          router.push("/customer/dashboard")
          return
        }

        setBooking(bookingData)
      } catch (error) {
        console.error("Error fetching booking:", error)
        toast.error("Failed to load booking")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bookingId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!booking || !user) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("reviews").insert({
        booking_id: booking.id,
        reviewer_id: user.id,
        reviewee_id: booking.provider_id,
        rating: formData.rating,
        comment: formData.comment,
        review_type: "customer-to-provider",
      })

      if (error) throw error

      toast.success("Review submitted!")
      router.push("/customer/dashboard")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <p className="text-slate-600 text-lg mb-4">Booking not found</p>
            <Link href="/customer/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </main>
    )
  }

  const service = booking.services as any
  const provider = booking.profiles as any

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Leave a Review</h1>
          <p className="text-slate-600 mb-8">
            Share your experience with {provider?.first_name} {provider?.last_name}
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-slate-700">
              <strong>Service:</strong> {service?.service_name}
            </p>
            <p className="text-sm text-slate-700 mt-2">
              <strong>Provider:</strong> {provider?.first_name} {provider?.last_name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-base font-semibold mb-4 block">How would you rate this service?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none transition"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {formData.rating === 5 && "Excellent!"}
                {formData.rating === 4 && "Very Good"}
                {formData.rating === 3 && "Good"}
                {formData.rating === 2 && "Fair"}
                {formData.rating === 1 && "Poor"}
              </p>
            </div>

            <div>
              <label htmlFor="comment" className="text-base font-semibold mb-2 block">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share details about your experience..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <Link href="/customer/dashboard" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
