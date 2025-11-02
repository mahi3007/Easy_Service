"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, DollarSign, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BookingDetail {
  id: string
  service_id: string
  provider_id: string
  booking_status: string
  scheduled_date: string
  duration_hours: number
  total_price: number
  notes: string
  services: {
    service_name: string
    category: string
    description: string
  }
  profiles: {
    first_name: string
    last_name: string
    phone: string
    bio: string
  }
  reviews: {
    id: string
    rating: number
    comment: string
  }[]
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
            scheduled_date,
            duration_hours,
            total_price,
            notes,
            services:service_id(service_name, category, description),
            profiles:provider_id(first_name, last_name, phone, bio),
            reviews(id, rating, comment)
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
  const review = booking.reviews?.[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-purple-100 text-purple-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{service?.service_name}</h1>
                  <p className="text-slate-600 mt-2">Booking #{booking.id.slice(0, 8)}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.booking_status)}`}
                >
                  {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Scheduled Date</p>
                    <p className="font-semibold">{new Date(booking.scheduled_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <p className="font-semibold">{service?.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Price</p>
                    <p className="font-semibold">${booking.total_price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Notes</h2>
                  <p className="text-slate-700">{booking.notes}</p>
                </div>
              )}
            </Card>

            {review && (
              <Card className="p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Your Review</h2>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-slate-900">{review.rating}/5</span>
                </div>
                {review.comment && <p className="text-slate-700">{review.comment}</p>}
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Service Provider</h3>

              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {provider?.first_name?.[0]}
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                {provider?.first_name} {provider?.last_name}
              </h4>

              {provider?.bio && <p className="text-sm text-slate-600 mt-2">{provider.bio}</p>}

              {provider?.phone && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-semibold text-slate-900">{provider.phone}</p>
                </div>
              )}

              {booking.booking_status === "completed" && !review && (
                <Link href={`/customer/bookings/${booking.id}/review`} className="w-full mt-6">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
