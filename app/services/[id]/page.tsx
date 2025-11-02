"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, MessageSquare, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fallbackServices, fallbackReviewsByProvider } from "../fallback-data"
import type { FallbackService } from "../fallback-data"

type ServiceDetail = FallbackService

const getFallbackService = (id: string): ServiceDetail =>
  fallbackServices.find((service) => service.id === id) ?? fallbackServices[0]

const getFallbackReviews = (providerId: string) =>
  fallbackReviewsByProvider[providerId] ?? []

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<ServiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchServiceDetail = async () => {
      const fallbackService = getFallbackService(serviceId)
      const fallbackReviews = getFallbackReviews(fallbackService.provider_id)

      try {
        const supabase = createClient()

        const { data: serviceData, error: serviceError } = await supabase
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
            profiles:provider_id(id, first_name, last_name, avatar_url, bio, phone),
            provider_verification(badge_level, verification_status)
          `,
          )
          .eq("id", serviceId)
          .single()

        if (serviceError || !serviceData) {
          setService(fallbackService)
          setReviews(fallbackReviews)
          return
        }

        setService(serviceData as ServiceDetail)

        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("reviewee_id", serviceData.provider_id)
          .limit(5)

        setReviews(reviewsError ? fallbackReviews : reviewsData || fallbackReviews)
      } catch (error) {
        setService(fallbackService)
        setReviews(fallbackReviews)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceDetail()
  }, [serviceId])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

  const provider = service.profiles as any
  const verification = service.provider_verification?.[0]
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/services" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{service.service_name}</h1>
                <p className="text-slate-600">{service.category.charAt(0).toUpperCase() + service.category.slice(1)}</p>
              </div>

              <div className="prose prose-sm max-w-none mb-8">
                <p className="text-slate-700 leading-relaxed">{service.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {service.hourly_rate && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Hourly Rate</p>
                    <p className="text-2xl font-bold text-blue-600">${service.hourly_rate}</p>
                  </div>
                )}
                {service.base_price && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Base Price</p>
                    <p className="text-2xl font-bold text-blue-600">${service.base_price}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">About the Provider</h2>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {provider?.first_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {provider?.first_name} {provider?.last_name}
                    </h3>
                    {verification?.badge_level && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-semibold px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          {verification.badge_level.charAt(0).toUpperCase() + verification.badge_level.slice(1)} Badge
                        </span>
                        <span className="text-sm text-slate-600">Verified Provider</span>
                      </div>
                    )}
                  </div>
                </div>

                {provider?.bio && <p className="text-slate-700 mb-6">{provider.bio}</p>}

                {reviews.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-900">{avgRating}</span>
                      <span className="text-slate-600">({reviews.length} reviews)</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Reviews</h2>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Ready to Book?</h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Service Type</p>
                  <p className="font-semibold text-slate-900">
                    {service.service_type === "lvhf" ? "Household Service" : "Event Service"}
                  </p>
                </div>

                {verification?.verification_status === "verified" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">Verified & Trusted</p>
                  </div>
                )}
              </div>

              <Link href={`/booking/${service.id}`} className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white mb-3">
                  Book Now
                </Button>
              </Link>

              <Button variant="outline" className="w-full mb-3 bg-transparent">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>

              {provider?.phone && (
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
