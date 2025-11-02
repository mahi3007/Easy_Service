"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Calendar, MapPin, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Booking {
  id: string
  service_id: string
  provider_id: string
  booking_status: string
  scheduled_date: string
  total_price: number
  services: {
    service_name: string
    category: string
  }
  profiles: {
    first_name: string
    last_name: string
  }
  reviews: {
    id: string
    rating: number
  }[]
}

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")

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

        // Fetch profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

        setProfile(profileData)

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(
            `
            id,
            service_id,
            provider_id,
            booking_status,
            scheduled_date,
            total_price,
            services:service_id(service_name, category),
            profiles:provider_id(first_name, last_name),
            reviews(id, rating)
          `,
          )
          .eq("customer_id", currentUser.id)
          .order("scheduled_date", { ascending: false })

        setBookings(bookingsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getFilteredBookings = (status: string) => {
    if (status === "active") {
      return bookings.filter((b) => ["pending", "confirmed", "in-progress"].includes(b.booking_status))
    }
    if (status === "completed") {
      return bookings.filter((b) => b.booking_status === "completed")
    }
    return bookings.filter((b) => b.booking_status === "cancelled")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-600 mt-2">
              Welcome back, {profile?.first_name} {profile?.last_name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/services">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Book Service
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({getFilteredBookings("active").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getFilteredBookings("completed").length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({getFilteredBookings("cancelled").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {getFilteredBookings(activeTab).length > 0 ? (
              getFilteredBookings(activeTab).map((booking) => {
                const service = booking.services as any
                const provider = booking.profiles as any
                const hasReview = booking.reviews && booking.reviews.length > 0

                return (
                  <Card key={booking.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{service?.service_name}</h3>
                        <p className="text-slate-600">
                          with {provider?.first_name} {provider?.last_name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.booking_status)}`}
                      >
                        {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{service?.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${booking.total_price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/customer/bookings/${booking.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      {booking.booking_status === "completed" && !hasReview && (
                        <Link href={`/customer/bookings/${booking.id}/review`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </Button>
                        </Link>
                      )}
                      {hasReview && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < booking.reviews[0].rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 text-center">
                <p className="text-slate-600 mb-4">No {activeTab} bookings</p>
                <Link href="/services">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    Browse Services
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
