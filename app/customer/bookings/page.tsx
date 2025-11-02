"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Navbar from "@/components/shared/Navbar"
import Sidebar from "@/components/shared/Sidebar"
import Footer from "@/components/shared/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { fallbackServices } from "@/app/services/fallback-data"
import { Calendar, Clock, MapPin, DollarSign, ArrowRight, Star } from "lucide-react"

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const formatStatus = (value: string | undefined) => {
  if (!value) return "Pending"
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

const isActiveStatus = (status: string) => ["pending", "confirmed", "in-progress"].includes(status)

const fallbackBookings = fallbackServices.slice(0, 4).map((service, index) => {
  const scheduledOffset = index * 3
  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() + scheduledOffset)
  const statusCycle = ["confirmed", "pending", "in-progress", "completed"]
  return {
    id: `fallback-booking-${index}`,
    service_id: service.id,
    provider_id: service.provider_id,
    booking_status: statusCycle[index % statusCycle.length],
    scheduled_date: scheduledDate.toISOString(),
    duration_hours: 2,
    total_price: Number(service.base_price ?? 150),
    services: {
      service_name: service.service_name,
      category: service.category,
    },
    profiles: {
      first_name: service.profiles.first_name,
      last_name: service.profiles.last_name,
    },
    reviews: [],
  }
})

const sanitizeBooking = (booking: any, index: number) => {
  const rawStatus = booking?.booking_status?.toLowerCase?.() ?? "pending"
  const normalizedStatus = statusStyles[rawStatus] ? rawStatus : "pending"
  const scheduled = booking?.scheduled_date ? new Date(booking.scheduled_date) : new Date()
  if (!booking?.scheduled_date) {
    scheduled.setDate(scheduled.getDate() + index)
  }
  const service = booking?.services ?? {}
  const provider = booking?.profiles ?? {}
  return {
    id: booking?.id ?? `booking-${index}`,
    service_id: booking?.service_id ?? service?.id ?? `service-${index}`,
    provider_id: booking?.provider_id ?? provider?.id ?? `provider-${index}`,
    booking_status: normalizedStatus,
    scheduled_date: scheduled.toISOString(),
    duration_hours: Number(booking?.duration_hours ?? 2),
    total_price: Number(booking?.total_price ?? service?.base_price ?? 0),
    services: {
      service_name: service?.service_name ?? service?.name ?? "Service",
      category: service?.category ?? "General",
    },
    profiles: {
      first_name: provider?.first_name ?? "Service",
      last_name: provider?.last_name ?? "Provider",
    },
    reviews: Array.isArray(booking?.reviews) ? booking.reviews : [],
  }
}

export default function CustomerBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>(fallbackBookings)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
        const { data, error } = await supabase
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
            services:service_id(service_name, category, base_price),
            profiles:provider_id(first_name, last_name),
            reviews(id, rating)
          `,
          )
          .eq("customer_id", currentUser.id)
          .order("scheduled_date", { ascending: false })
        if (error) {
          throw error
        }
        const resolved = data?.length ? data.map(sanitizeBooking) : fallbackBookings
        setBookings(resolved)
      } catch (error) {
        console.error("Failed to load bookings", error)
        toast.error("Unable to load bookings")
        setBookings(fallbackBookings)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const handleFilterChange = useCallback((value: string) => {
    setStatusFilter(value)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const stats = useMemo(() => {
    const total = bookings.length
    const upcoming = bookings.filter((booking) => {
      const status = booking.booking_status
      const date = new Date(booking.scheduled_date)
      return isActiveStatus(status) && date >= new Date()
    }).length
    const completed = bookings.filter((booking) => booking.booking_status === "completed").length
    const cancelled = bookings.filter((booking) => booking.booking_status === "cancelled").length
    return [
      { label: "Total bookings", value: total },
      { label: "Upcoming", value: upcoming },
      { label: "Completed", value: completed },
      { label: "Cancelled", value: cancelled },
    ]
  }, [bookings])

  const nextBooking = useMemo(() => {
    const upcoming = bookings
      .filter((booking) => isActiveStatus(booking.booking_status))
      .filter((booking) => new Date(booking.scheduled_date) >= new Date())
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    return upcoming[0] ?? null
  }, [bookings])

  const visibleBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return bookings
      .filter((booking) => {
        const matchesStatus = statusFilter === "all" || booking.booking_status === statusFilter
        if (!matchesStatus) {
          return false
        }
        if (!normalizedSearch) {
          return true
        }
        const providerName = `${booking.profiles?.first_name ?? ""} ${booking.profiles?.last_name ?? ""}`.toLowerCase()
        const serviceName = (booking.services?.service_name ?? "").toLowerCase()
        return (
          serviceName.includes(normalizedSearch) ||
          providerName.includes(normalizedSearch) ||
          booking.id.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
  }, [bookings, statusFilter, searchTerm])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg text-slate-600">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userType="customer" />
      <div className="flex flex-1">
        <Sidebar userType="customer" />
        <main className="flex-1 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
                <p className="text-slate-600">
                  Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ""}. Track, manage, and review all your service bookings in one place
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/customer/home")}>Back to dashboard</Button>
                <Link href="/services">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    Book new service
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map((item) => (
                <Card key={item.label} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {nextBooking && (
              <Card className="border-blue-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg text-blue-700">Next booking</CardTitle>
                    <p className="text-slate-600 text-sm">
                      {new Date(nextBooking.scheduled_date).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge className={statusStyles[nextBooking.booking_status] ?? "bg-slate-100 text-slate-600"}>
                    {formatStatus(nextBooking.booking_status)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{nextBooking.services?.service_name}</p>
                    <p className="text-sm text-slate-600">
                      with {nextBooking.profiles?.first_name} {nextBooking.profiles?.last_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                    <span>${nextBooking.total_price.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Input
                    value={searchTerm}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search by service, provider, or booking ID"
                    className="md:max-w-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "pending", label: "Pending" },
                      { value: "confirmed", label: "Confirmed" },
                      { value: "in-progress", label: "In progress" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={statusFilter === option.value ? "default" : "outline"}
                        className={statusFilter === option.value ? "bg-blue-600 text-white" : "text-slate-600"}
                        onClick={() => handleFilterChange(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  {visibleBookings.length} booking{visibleBookings.length === 1 ? "" : "s"} found
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {visibleBookings.length > 0 ? (
                  visibleBookings.map((booking) => {
                    const formattedDate = new Date(booking.scheduled_date)
                    return (
                      <Card key={booking.id} className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <CardTitle className="text-xl text-slate-900">
                              {booking.services?.service_name}
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                              with {booking.profiles?.first_name} {booking.profiles?.last_name}
                            </p>
                          </div>
                          <Badge className={statusStyles[booking.booking_status] ?? "bg-slate-100 text-slate-600"}>
                            {formatStatus(booking.booking_status)}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{formattedDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>{formattedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>{booking.services?.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                              <span>${booking.total_price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-slate-500">
                              Duration: {booking.duration_hours} hour{booking.duration_hours === 1 ? "" : "s"}
                            </div>
                            <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                              <Link href={`/customer/bookings/${booking.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">View details</Button>
                              </Link>
                              {booking.booking_status === "completed" && (!booking.reviews || booking.reviews.length === 0) && (
                                <Link href={`/customer/bookings/${booking.id}/review`} className="flex-1">
                                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                                    <Star className="w-4 h-4 mr-2" />
                                    Leave review
                                  </Button>
                                </Link>
                              )}
                              {booking.reviews && booking.reviews.length > 0 && (
                                <div className="flex flex-1 items-center justify-center gap-1 text-yellow-500">
                                  {[...Array(5)].map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`w-4 h-4 ${index < booking.reviews[0].rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card className="border-dashed border-2 border-slate-200 p-12 text-center">
                    <p className="text-slate-600 mb-4">No bookings match your filters</p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      <Button variant="outline" onClick={() => setStatusFilter("all")}>Reset filters</Button>
                      <Button onClick={() => router.push("/services")} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        Browse services
                      </Button>
                    </div>
                  </Card>
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
