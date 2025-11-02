"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Navbar from "@/components/shared/Navbar"
import { fallbackServices } from "@/app/services/fallback-data"
import Sidebar from "@/components/shared/Sidebar"
import Footer from "@/components/shared/Footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, ArrowRight } from "lucide-react"

export default function CustomerHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const categoryImageMap: Record<string, string> = {
    cleaning: "https://image.pollinations.ai/prompt/luxury%20home%20cleaning%20service%20interior%20minimalist%20digital%20art",
    photography: "https://image.pollinations.ai/prompt/premium%20wedding%20photography%20studio%20setup%20cinematic%20lighting",
    electrical: "https://image.pollinations.ai/prompt/emergency%20electrical%20repair%20technician%20futuristic%20illustration",
    plumbing: "https://image.pollinations.ai/prompt/express%20plumbing%20service%20modern%20bathroom%20render",
    landscaping: "https://image.pollinations.ai/prompt/garden%20landscaping%20design%20lush%20outdoor%20oasis%20concept",
    "event-planning": "https://image.pollinations.ai/prompt/corporate%20event%20planning%20team%20holographic%20visual",
    catering: "https://image.pollinations.ai/prompt/deluxe%20wedding%20catering%20buffet%20artistic%20display",
    other: "https://image.pollinations.ai/prompt/professional%20home%20services%20toolkit%20stylised%20render",
  }
  const fallbackRecommended = fallbackServices.slice(0, 6).map((service) => {
    const categoryKey = service.category?.toLowerCase?.() ?? "other"
    return {
      ...service,
      image_url: service.image_url ?? categoryImageMap[categoryKey] ?? categoryImageMap.other,
    }
  })
  const fallbackProviderList = fallbackRecommended.slice(0, 4).map((service) => ({
    id: service.provider_id,
    first_name: service.profiles.first_name,
    last_name: service.profiles.last_name,
    provider_verification: service.provider_verification,
    headline_service: service.service_name,
    headline_category: service.category,
  }))

  const sanitizeService = (service: any, index: number) => {
    const rawCategory = service?.category ?? fallbackRecommended[index % fallbackRecommended.length].category
    const categoryKey = rawCategory?.toLowerCase?.() ?? "other"
    return {
      id: service?.id ?? `fallback-svc-${index}`,
      service_name: service?.service_name ?? "Premium Service",
      description: service?.description ?? "Professional service with quality guarantee",
      category: rawCategory,
      hourly_rate: Number(service?.hourly_rate ?? 0),
      base_price: Number(service?.base_price ?? service?.hourly_rate ?? 0),
      provider_id: service?.provider_id,
      image_url: service?.image_url ?? categoryImageMap[categoryKey] ?? categoryImageMap.other,
      profiles: service?.profiles ?? {
        first_name: "Expert",
        last_name: "Provider",
      },
    }
  }

  const sanitizeProvider = (provider: any, index: number) => ({
    id: provider?.id ?? `fallback-prov-${index}`,
    first_name: provider?.first_name ?? "Top",
    last_name: provider?.last_name ?? "Professional",
    provider_verification: provider?.provider_verification ?? provider?.verification ?? [],
    headline_service: provider?.headline_service ?? fallbackProviderList[index % fallbackProviderList.length].headline_service,
    headline_category: provider?.headline_category ?? fallbackProviderList[index % fallbackProviderList.length].headline_category,
  })

  const [allServices, setAllServices] = useState<any[]>(fallbackRecommended)
  const [filteredServices, setFilteredServices] = useState<any[]>(fallbackRecommended)
  const [searchTerm, setSearchTerm] = useState("")
  const [bookings, setBookings] = useState<any[]>([])
  const [popularProviders, setPopularProviders] = useState<any[]>(fallbackProviderList)

  const filterServices = useCallback((services: any[], query: string) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return services
    }
    return services.filter((service) => {
      const providerName = `${service.profiles?.first_name ?? ""} ${service.profiles?.last_name ?? ""}`.toLowerCase()
      const content = `${service.service_name ?? ""} ${service.description ?? ""} ${service.category ?? ""} ${providerName}`.toLowerCase()
      return content.includes(normalized)
    })
  }, [])

  useEffect(() => {
    setFilteredServices(filterServices(allServices, searchTerm))
  }, [allServices, searchTerm, filterServices])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleSearchSubmit = useCallback((value: string) => {
    setSearchTerm(value.trim())
  }, [])

  const hasSearchQuery = searchTerm.trim().length > 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          router.push("/auth/login")
          return
        }
        
        setUser(currentUser)
        
        // Fetch recommended services
        const { data: services } = await supabase
          .from("services")
          .select(`
            id,
            service_name,
            description,
            category,
            hourly_rate,
            base_price,
            provider_id,
            profiles:provider_id (first_name, last_name)
          `)
          .limit(6)
        
        const resolvedServices = services?.length ? services.map(sanitizeService) : fallbackRecommended
        setAllServices(resolvedServices)
        
        // Fetch user's bookings
        const { data: userBookings } = await supabase
          .from("bookings")
          .select(`
            id,
            scheduled_date,
            booking_status,
            total_price,
            services:service_id (service_name),
            profiles:provider_id (first_name, last_name)
          `)
          .eq("customer_id", currentUser.id)
          .order("scheduled_date", { ascending: false })
          .limit(3)
        
        setBookings(userBookings || [])
        
        // Fetch popular providers
        const { data: providers } = await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            provider_verification:provider_verification (verification_status, badge_level),
            services (service_name, category)
          `)
          .eq("user_type", "provider")
          .eq("provider_verification.verification_status", "verified")
          .limit(4)
        
        const resolvedProviders = providers?.length
          ? providers.map((provider, index) =>
              sanitizeProvider(
                {
                  ...provider,
                  headline_service: provider.services?.[0]?.service_name,
                  headline_category: provider.services?.[0]?.category,
                },
                index,
              ),
            )
          : fallbackProviderList
        setPopularProviders(resolvedProviders)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        userType="customer"
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />
      
      <div className="flex flex-1">
        <Sidebar userType="customer" />
        
        <main className="flex-1 bg-slate-50 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.user_metadata?.first_name}</h1>
            <p className="text-slate-600">Find and book services from top professionals</p>
          </div>
          
          {/* Recommended Services */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Recommended Services</h2>
              <Button variant="ghost" className="flex items-center gap-1 text-blue-600" onClick={() => router.push("/services")}>
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.length > 0 ? (
                filteredServices.slice(0, 6).map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-slate-200">
                      <img src={service.image_url} alt={service.service_name} className="h-full w-full object-cover" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-start justify-between gap-2">
                        <span>{service.service_name}</span>
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                          {service.category}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{service.description || "Professional service with quality guarantee"}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8 (24 reviews)</span>
                        </div>
                        <span className="font-semibold text-slate-900">${service.base_price}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t p-4">
                      <div className="text-sm text-slate-500">
                        <span>
                          By {service.profiles?.first_name} {service.profiles?.last_name}
                        </span>
                      </div>
                      <Button onClick={() => router.push(`/services/${service.id}`)}>Book Now</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-slate-600">
                    {hasSearchQuery ? "No services match your search." : "No recommended services yet"}
                  </p>
                  {hasSearchQuery ? (
                    <Button className="mt-4" variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  ) : (
                    <Button className="mt-4" onClick={() => router.push("/services")}>
                      Browse All Services
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>
          
          {/* Popular Providers */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Popular Providers</h2>
              <Button variant="ghost" className="flex items-center gap-1 text-blue-600" onClick={() => router.push("/services")}>
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularProviders.length > 0 ? (
                popularProviders.map((provider) => (
                  <Card key={provider.id} className="overflow-hidden">
                    <div className="flex flex-col items-center p-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="" alt={`${provider.first_name} ${provider.last_name}`} />
                        <AvatarFallback>
                          {provider.first_name?.charAt(0)}
                          {provider.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="mt-4 text-lg font-semibold text-center">
                        {provider.first_name} {provider.last_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 text-center">
                        {provider.headline_service}
                      </p>
                      <Badge className="mt-2" variant="outline">
                        {provider.provider_verification?.[0]?.badge_level || "Bronze"} Provider
                      </Badge>
                      <Button className="mt-4 w-full" onClick={() => router.push("/services")}>View Services</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-slate-600">No verified providers available</p>
                </div>
              )}
            </div>
          </section>

          {/* My Bookings */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">My Bookings</h2>
              <Button variant="ghost" className="flex items-center gap-1 text-blue-600" onClick={() => router.push("/customer/bookings")}>
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full p-4 md:w-3/4">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">{booking.services?.service_name}</h3>
                          <Badge variant={getStatusVariant(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>Provider: {booking.profiles?.first_name} {booking.profiles?.last_name}</span>
                        </div>
                      </div>
                      <div className="flex w-full items-center justify-between border-t bg-slate-50 p-4 md:w-1/4 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${booking.total_price}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/customer/bookings/${booking.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">You don't have any bookings yet</p>
                  <Button className="mt-4" onClick={() => router.push("/services")}>
                    Book a Service
                  </Button>
                </Card>
              )}
            </div>
          </section>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success"
    case "in-progress":
      return "default"
    case "confirmed":
      return "secondary"
    case "pending":
      return "warning"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}