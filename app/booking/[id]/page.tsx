"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { fallbackServices } from "../../services/fallback-data"
import type { FallbackService } from "../../services/fallback-data"

type BookingService = Pick<FallbackService, "id" | "service_name" | "hourly_rate" | "base_price" | "provider_id" | "profiles">

const getFallbackService = (serviceId: string): BookingService =>
  fallbackServices.find((service) => service.id === serviceId) ?? fallbackServices[0]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<BookingService | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    scheduledDate: "",
    durationHours: "1",
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      const fallbackService = getFallbackService(serviceId)
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

        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select(
            `
            id,
            service_name,
            hourly_rate,
            base_price,
            provider_id,
            profiles:provider_id(first_name, last_name)
          `,
          )
          .eq("id", serviceId)
          .single()

        if (serviceError || !serviceData) {
          setService(fallbackService)
          return
        }
        setService(serviceData as BookingService)
      } catch (error) {
        setService(getFallbackService(serviceId))
        toast.error("Failed to load service details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [serviceId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !user) return

    setSubmitting(true)
    try {
      const supabase = createClient()

      const totalPrice = service.base_price || service.hourly_rate * Number(formData.durationHours)

      // Create booking
      const { data: booking, error: bookingError } = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: service.provider_id,
          serviceId: service.id,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          durationHours: Number(formData.durationHours),
          totalPrice,
          notes: formData.notes,
        }),
      }).then((res) => res.json())

      if (booking.error) throw new Error(booking.error)

      toast.success("Booking created! Proceeding to payment...")

      // Redirect to payment
      router.push(`/payment/${booking.id}`)
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <p className="text-slate-600 text-lg mb-4">Service not found</p>
            <Link href="/services">
              <Button variant="outline">Back to Services</Button>
            </Link>
          </Card>
        </div>
      </main>
    )
  }

  const totalPrice = (service.base_price || service.hourly_rate * Number(formData.durationHours)).toFixed(2)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/services/${serviceId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Service
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="h-full">
            <Card className="p-8 h-full flex flex-col">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Book {service.service_name}</h1>
              <p className="text-slate-600 mb-8">
                with {service.profiles.first_name} {service.profiles.last_name}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div>
                  <Label htmlFor="date" className="text-base font-semibold mb-2 block">
                    Preferred Date
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-base font-semibold mb-2 block">
                    Duration (hours)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Tell the provider any specific requirements or details..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {submitting ? "Creating Booking..." : "Continue to Payment"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card className="p-8 h-full flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Service</span>
                  <span className="font-semibold text-slate-900">{service.service_name}</span>
                </div>

                {formData.scheduledDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(formData.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {formData.durationHours && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-semibold text-slate-900">{formData.durationHours} hours</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700">
                <p className="font-semibold mb-2">Payment Protection</p>
                <p>Your payment is held securely until the service is completed.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
