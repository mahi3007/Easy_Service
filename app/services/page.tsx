"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, DollarSign, Search } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { fallbackServices } from "./fallback-data"
import type { FallbackService } from "./fallback-data"

type Service = FallbackService

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const normalizeBadge = (value: string) => {
    const lower = value?.toLowerCase()
    if (lower === "gold" || lower === "silver" || lower === "bronze") {
      return lower
    }
    return "bronze"
  }

  const transformService = (service: any, index: number): Service => {
    const profile = service.profiles || {}
    const verification = Array.isArray(service.provider_verification) && service.provider_verification.length > 0
      ? service.provider_verification.map((item: any) => ({
          badge_level: normalizeBadge(item?.badge_level),
          verification_status: item?.verification_status ?? "approved",
        }))
      : [
          {
            badge_level: "bronze",
            verification_status: "approved",
          },
        ]

    return {
      id: service.id ?? `db-svc-${index}`,
      service_name: service.service_name ?? "Service",
      category: (service.category ?? "other").toLowerCase(),
      service_type: ((service.service_type ?? "lvhf").toLowerCase() === "hvlf" ? "hvlf" : "lvhf"),
      description: service.description ?? "",
      hourly_rate: Number(service.hourly_rate ?? 0),
      base_price: Number(service.base_price ?? 0),
      provider_id: service.provider_id ?? `db-prov-${index}`,
      profiles: {
        id: profile.id ?? service.provider_id ?? `db-prov-${index}`,
        first_name: profile.first_name ?? "Service",
        last_name: profile.last_name ?? "Provider",
        avatar_url: profile.avatar_url ?? "/placeholder-user.jpg",
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
      },
      provider_verification: verification,
    }
  }

  const categories = [
    "all",
    "plumbing",
    "electrical",
    "cleaning",
    "catering",
    "photography",
    "event-planning",
    "landscaping",
    "other",
  ]

  const serviceTypes = [
    { value: "all", label: "All Types" },
    { value: "lvhf", label: "Household Services" },
    { value: "hvlf", label: "Event Services" },
  ]

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
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
            profiles:provider_id(first_name, last_name, avatar_url),
            provider_verification(badge_level, verification_status)
          `,
          )
          .eq("availability_status", "available")

        if (error) {
          setServices(fallbackServices)
          setFilteredServices(fallbackServices)
          return
        }

        const sanitized = (data || []).map((service, index) => transformService(service, index))
        const resolvedServices = sanitized.length > 0 ? [...fallbackServices, ...sanitized] : fallbackServices
        setServices(resolvedServices)
        setFilteredServices(resolvedServices)
      } catch (error) {
        setServices(fallbackServices)
        setFilteredServices(fallbackServices)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    let filtered = services

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category?.toLowerCase() === selectedCategory)
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((service) => service.service_type?.toLowerCase() === selectedType)
    }

    setFilteredServices(filtered)
  }, [searchQuery, selectedCategory, selectedType, services])

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "silver":
        return "bg-gray-100 text-gray-800"
      case "bronze":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 md:mb-4">Browse Services</h1>
              <p className="text-blue-100 text-lg">Find verified professionals for your needs</p>
            </div>
            <Link href="/customer/home">
              <Button variant="outline" className="border-white/70 bg-white/10 text-white hover:bg-white/20">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Found <span className="font-semibold text-slate-900">{filteredServices.length}</span> services
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const provider = service.profiles as any
              const verification = service.provider_verification?.[0]

              return (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{service.service_name}</h3>
                        <p className="text-sm text-slate-600">
                          {provider?.first_name} {provider?.last_name}
                        </p>
                      </div>
                      {verification?.badge_level && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getBadgeColor(verification.badge_level)}`}
                        >
                          {verification.badge_level.charAt(0).toUpperCase() + verification.badge_level.slice(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                    <div className="space-y-2 mb-4">
                      {service.hourly_rate && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign className="w-4 h-4" />
                          <span>${service.hourly_rate}/hour</span>
                        </div>
                      )}
                      {service.base_price && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign className="w-4 h-4" />
                          <span>From ${service.base_price}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{service.service_type === "lvhf" ? "Household" : "Event"} Service</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                      View Details
                    </Button>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-slate-600 text-lg">No services found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedType("all")
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </main>
  )
}
