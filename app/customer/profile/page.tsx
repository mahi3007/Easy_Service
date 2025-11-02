"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/shared/Navbar"
import Sidebar from "@/components/shared/Sidebar"
import Footer from "@/components/shared/Footer"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Calendar, Shield, Star, DollarSign } from "lucide-react"
import { fallbackServices } from "@/app/services/fallback-data"

const fallbackProfile = {
  first_name: "Alex",
  last_name: "Johnson",
  email: "alex.johnson@example.com",
  phone: "+91 98765 12345",
  bio: "Home services enthusiast focused on keeping things in top shape.",
  avatar_url: "/placeholder-user.jpg",
  member_since: "2023-01-15T00:00:00.000Z",
  location: "Bengaluru, India",
  membershipTier: "Gold",
}

const fallbackBookings = fallbackServices.slice(0, 4).map((service, index) => {
  const scheduled = new Date()
  scheduled.setDate(scheduled.getDate() + (index + 1) * 2)
  const rating = 4 + (index % 2 ? 0 : -1)
  return {
    id: `fallback-booking-${index}`,
    booking_status: index % 3 === 0 ? "completed" : index % 3 === 1 ? "confirmed" : "pending",
    scheduled_date: scheduled.toISOString(),
    total_price: Number(service.base_price ?? 0),
    services: {
      service_name: service.service_name,
      category: service.category,
    },
    reviews: index % 3 === 0 ? [{ id: `fallback-review-${index}`, rating }] : [],
  }
})

const sanitizeProfile = (data: any) => ({
  first_name: data?.first_name ?? fallbackProfile.first_name,
  last_name: data?.last_name ?? fallbackProfile.last_name,
  email: data?.email ?? fallbackProfile.email,
  phone: data?.phone ?? fallbackProfile.phone,
  bio: data?.bio ?? fallbackProfile.bio,
  avatar_url: data?.avatar_url ?? fallbackProfile.avatar_url,
  member_since: data?.created_at ?? fallbackProfile.member_since,
  location: data?.location ?? fallbackProfile.location,
  membershipTier: data?.membership_tier ?? fallbackProfile.membershipTier,
})

const sanitizeBooking = (booking: any, index: number) => {
  const status = booking?.booking_status?.toLowerCase?.() ?? "pending"
  const normalizedStatus = ["pending", "confirmed", "in-progress", "completed", "cancelled"].includes(status)
    ? status
    : "pending"
  const scheduled = booking?.scheduled_date ? new Date(booking.scheduled_date) : new Date()
  if (!booking?.scheduled_date) {
    scheduled.setDate(scheduled.getDate() + index + 1)
  }
  return {
    id: booking?.id ?? `booking-${index}`,
    booking_status: normalizedStatus,
    scheduled_date: scheduled.toISOString(),
    total_price: Number(booking?.total_price ?? 0),
    services: {
      service_name: booking?.services?.service_name ?? "Service",
      category: booking?.services?.category ?? "General",
    },
    reviews: Array.isArray(booking?.reviews) ? booking.reviews : [],
  }
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function CustomerProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState(fallbackProfile)
  const [bookings, setBookings] = useState<any[]>(fallbackBookings)

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
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name, avatar_url, phone, bio, created_at")
          .eq("id", currentUser.id)
          .single()
        if (profileData) {
          setProfile(sanitizeProfile(profileData))
        } else {
          setProfile(fallbackProfile)
        }
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(
            `
            id,
            booking_status,
            scheduled_date,
            total_price,
            services:service_id(service_name, category),
            reviews(id, rating)
          `,
          )
          .eq("customer_id", currentUser.id)
          .order("scheduled_date", { ascending: false })
        if (bookingsData?.length) {
          setBookings(bookingsData.map(sanitizeBooking))
        } else {
          setBookings(fallbackBookings)
        }
      } catch (error) {
        console.error("Failed to load profile", error)
        toast.error("Unable to load profile")
        setProfile(fallbackProfile)
        setBookings(fallbackBookings)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const metrics = useMemo(() => {
    const total = bookings.length
    const upcoming = bookings.filter((booking) => {
      const date = new Date(booking.scheduled_date)
      return ["pending", "confirmed", "in-progress"].includes(booking.booking_status) && date >= new Date()
    }).length
    const completed = bookings.filter((booking) => booking.booking_status === "completed").length
    const cancelled = bookings.filter((booking) => booking.booking_status === "cancelled").length
    const spent = bookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0)
    const rated = bookings.filter((booking) => booking.reviews && booking.reviews.length > 0)
    const ratingValue = rated.length
      ? rated.reduce((sum, booking) => sum + Number(booking.reviews?.[0]?.rating ?? 0), 0) / rated.length
      : 0
    const categories = Array.from(
      new Set(
        bookings
          .map((booking) => booking.services?.category)
          .filter((value): value is string => Boolean(value)),
      ),
    )
    return { total, upcoming, completed, cancelled, spent, rating: ratingValue, categories }
  }, [bookings])

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings])

  const initials = `${profile.first_name?.charAt(0) ?? "C"}${profile.last_name?.charAt(0) ?? "U"}`.toUpperCase()
  const membershipTier = user?.user_metadata?.membership_tier ?? profile.membershipTier
  const location = user?.user_metadata?.city ?? profile.location
  const formattedMemberSince = new Date(profile.member_since).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  })
  const averageRating = metrics.rating ? metrics.rating.toFixed(1) : "—"
  const lifetimeSpend = metrics.spent.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg text-slate-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userType="customer" />
      <div className="flex flex-1">
        <Sidebar userType="customer" />
        <main className="flex-1 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url ?? ""} alt={`${profile.first_name} ${profile.last_name}`} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      {membershipTier} member
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Joined {formattedMemberSince}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/customer/bookings")}>View bookings</Button>
                <Button onClick={() => router.push("/customer/home")}>Explore services</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total bookings", value: metrics.total.toString() },
                { label: "Upcoming", value: metrics.upcoming.toString() },
                { label: "Completed", value: metrics.completed.toString() },
                { label: "Average rating", value: averageRating },
                { label: "Cancelled", value: metrics.cancelled.toString() },
                { label: "Lifetime spend", value: lifetimeSpend },
              ].map((item) => (
                <Card key={item.label} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-slate-200">
                <CardHeader>
                  <CardTitle>Profile overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>{profile.email || user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span>{averageRating === "—" ? "No reviews yet" : `${averageRating} average rating`}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>{lifetimeSpend} spent</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700 leading-relaxed">
                    {profile.bio}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Preferred categories</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {metrics.categories.length > 0 ? (
                        metrics.categories.map((category) => (
                          <Badge key={category} variant="outline" className="border-blue-200 text-blue-700">
                            {category}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No preferences captured yet</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Account actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline" onClick={() => router.push("/customer/bookings")}>Manage bookings</Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/services")}>Book new service</Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/customer/home")}>View recommendations</Button>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/auth/login")}>Sign out</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Recent bookings</CardTitle>
                <Button variant="ghost" className="text-blue-600" onClick={() => router.push("/customer/bookings")}>View all</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => {
                    const formattedDate = new Date(booking.scheduled_date)
                    return (
                      <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">{booking.services?.service_name}</p>
                            <p className="text-sm text-slate-500">
                              {formattedDate.toLocaleDateString()} · {formattedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={statusStyles[booking.booking_status] ?? "bg-slate-100 text-slate-600"}>
                              {booking.booking_status
                                .split("-")
                                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                                .join(" ")}
                            </Badge>
                            <Button variant="outline" onClick={() => router.push(`/customer/bookings/${booking.id}`)}>View details</Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center text-slate-500">
                    No bookings to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
