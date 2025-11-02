"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { fallbackServices } from "@/app/services/fallback-data"
import type { FallbackService } from "@/app/services/fallback-data"
import { ChevronRight, Star, Shield, Zap, Users, ArrowRight, Sparkles } from "lucide-react"

const normalizeBadge = (value: string | undefined): "gold" | "silver" | "bronze" => {
  const normalized = value?.toLowerCase?.() ?? ""
  if (normalized === "gold" || normalized === "silver" || normalized === "bronze") {
    return normalized
  }
  return "bronze"
}

const normalizeServiceRecord = (service: any, index: number): FallbackService => {
  const profile = service?.profiles ?? {}
  const verificationSource = Array.isArray(service?.provider_verification) && service.provider_verification.length > 0
    ? service.provider_verification
    : [
        {
          badge_level: "bronze",
          verification_status: "approved",
        },
      ]

  return {
    id: service?.id ?? `svc-${index}`,
    service_name: service?.service_name ?? "Service",
    category: (service?.category ?? "other").toLowerCase(),
    service_type: (service?.service_type ?? "lvhf").toLowerCase() === "hvlf" ? "hvlf" : "lvhf",
    description: service?.description ?? "",
    hourly_rate: Number(service?.hourly_rate ?? 0),
    base_price: Number(service?.base_price ?? service?.hourly_rate ?? 0),
    image_url: service?.image_url,
    provider_id: service?.provider_id ?? `prov-${index}`,
    profiles: {
      id: profile?.id ?? service?.provider_id ?? `prov-${index}`,
      first_name: profile?.first_name ?? "Service",
      last_name: profile?.last_name ?? "Provider",
      avatar_url: profile?.avatar_url ?? "/placeholder-user.jpg",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
    },
    provider_verification: verificationSource.map((item: any) => ({
      badge_level: normalizeBadge(item?.badge_level),
      verification_status: item?.verification_status ?? "approved",
    })),
  }
}

const formatCategory = (value: string | undefined) => {
  if (!value) {
    return "Other"
  }
  const formatted = value.replace(/-/g, " ")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const formatServiceType = (value: string | undefined) => (value === "hvlf" ? "Event" : "Household")

const getProviderName = (service: FallbackService) => {
  const first = service.profiles?.first_name ?? ""
  const last = service.profiles?.last_name ?? ""
  return `${first} ${last}`.trim()
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("household")
  const [searchTerm, setSearchTerm] = useState("")
  const [servicesCatalog, setServicesCatalog] = useState<FallbackService[]>(fallbackServices)
  const [filteredServices, setFilteredServices] = useState<FallbackService[]>(fallbackServices)
  const [displayQuery, setDisplayQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const featuredServices = useMemo(() => filteredServices.slice(0, 4), [filteredServices])

  const services = useMemo(
    () => [
      { icon: "🔧", name: "Plumbing", desc: "Expert plumbers for all your needs" },
      { icon: "🧹", name: "Cleaning", desc: "Professional cleaning services" },
      { icon: "⚡", name: "Electrical", desc: "Licensed electricians" },
      { icon: "🏠", name: "Carpentry", desc: "Skilled carpenters" },
    ],
    [],
  )

  const eventServices = useMemo(
    () => [
      { icon: "💍", name: "Weddings", desc: "Complete wedding planning" },
      { icon: "🎉", name: "Parties", desc: "Event coordination" },
      { icon: "🍽️", name: "Catering", desc: "Professional catering" },
      { icon: "✨", name: "Decorations", desc: "Event decorations" },
    ],
    [],
  )

  const features = useMemo(
    () => [
      {
        icon: Shield,
        title: "Verified Professionals",
        desc: "All providers undergo multi-step verification with ID, face verification, and admin approval",
      },
      {
        icon: Zap,
        title: "Secure Payments",
        desc: "Escrow-based payment system ensures fairness for both customers and providers",
      },
      {
        icon: Star,
        title: "Trust Badges",
        desc: "Bronze, Silver, and Gold badges based on ratings and verified experience",
      },
      {
        icon: Users,
        title: "Direct Communication",
        desc: "In-app chat and call options for seamless coordination before booking",
      },
    ],
    [],
  )

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      text: "Found a reliable plumber in minutes. The verification system gave me complete peace of mind.",
      badge: "Gold",
    },
    {
      name: "Rajesh Kumar",
      role: "Service Provider",
      text: "This platform changed my business. Consistent bookings and secure payments every time.",
      badge: "Silver",
    },
    {
      name: "Priya Sharma",
      role: "Event Organizer",
      text: "Coordinating my wedding was seamless with multiple verified vendors in one place.",
      badge: "Gold",
    },
  ]

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true)
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
          image_url,
          provider_id,
          profiles:provider_id(first_name, last_name, avatar_url),
          provider_verification(badge_level, verification_status)
        `,
        )
      if (error) {
        setServicesCatalog(fallbackServices)
        setFilteredServices(fallbackServices)
        setDisplayQuery("")
        setSearchTerm("")
        return
      }
      const sanitized = (data ?? []).map((service, index) => normalizeServiceRecord(service, index))
      const catalog = sanitized.length > 0 ? [...fallbackServices, ...sanitized] : fallbackServices
      setServicesCatalog(catalog)
      setFilteredServices(catalog)
    } catch (error) {
      setServicesCatalog(fallbackServices)
      setFilteredServices(fallbackServices)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleSearch = useCallback(() => {
    const normalizedQuery = searchTerm.trim()
    if (!normalizedQuery) {
      setFilteredServices(servicesCatalog)
      setDisplayQuery("")
      return
    }
    const query = normalizedQuery.toLowerCase()
    const results = servicesCatalog.filter((service) => {
      const content = `${service.service_name} ${service.description} ${service.category} ${getProviderName(service)} ${formatServiceType(service.service_type)}`.toLowerCase()
      return content.includes(query)
    })
    setFilteredServices(results)
    setDisplayQuery(normalizedQuery)
  }, [searchTerm, servicesCatalog])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-slate-900">ServiceHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-slate-600 hover:text-slate-900 transition">
              Services
            </a>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition">
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-600" asChild>
              <a href="/auth/login">Log in</a>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all" asChild>
              <a href="/auth/signup">Sign up</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <span className="text-blue-600 text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Trusted by 50,000+ users
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Find Verified Professionals for Every Need
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Connect with trusted service providers for household work or plan your perfect event. Secure payments,
            verified profiles, and transparent reviews all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Book a Service <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all"
            >
              Become a Provider
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 border border-slate-200 hover:border-blue-300 transition-colors">
            <input
              type="text"
              placeholder="Search for jobs or skills"
              className="flex-1 px-6 py-4 outline-none text-slate-900 placeholder-slate-400"
              suppressHydrationWarning
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-slate-900">Featured Services</h3>
            <a href="/services" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
              View all
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredServices.map((service) => (
              <Card key={service.id} className="p-5 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 leading-tight">{service.service_name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{formatServiceType(service.service_type)} Service</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {formatCategory(service.category)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">{service.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{getProviderName(service)}</span>
                  <div className="text-blue-600 font-semibold flex items-center gap-1">
                    Details <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">Service Results</h2>
            {displayQuery ? (
              <p className="text-slate-600 text-lg">Showing results for "{displayQuery}"</p>
            ) : (
              <p className="text-slate-600 text-lg">Discover popular services from verified providers</p>
            )}
          </div>
          <a
            href="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto"
          >
            View all
          </a>
        </div>
        {filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
            {displayQuery ? `No services found for "${displayQuery}".` : "No services available at the moment."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.slice(0, 8).map((service) => (
              <Card
                key={service.id}
                className="p-6 hover:shadow-lg transition-all border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{service.service_name}</h3>
                    <p className="text-sm text-slate-500">{getProviderName(service)}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {formatCategory(service.category)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{service.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{formatServiceType(service.service_type)} Service</span>
                  <div className="text-blue-600 font-semibold flex items-center gap-1">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Service Categories */}
      <section id="services" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Browse Services</h2>
            <p className="text-slate-600 text-lg">Choose between household services or event planning</p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab("household")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "household"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-md"
              }`}
              suppressHydrationWarning
            >
              Household Services
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "events"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-md"
              }`}
              suppressHydrationWarning
            >
              Event Services
            </button>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === "household" ? services : eventServices).map((service, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{service.desc}</p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition">
                  Browse <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose ServiceHub?</h2>
            <p className="text-slate-600 text-lg">Built for trust, transparency, and convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  className="p-8 border-slate-200 hover:shadow-xl transition-all hover:border-blue-300 group relative overflow-hidden"
                >
                  {/* Spotlight effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <div className="flex gap-4 relative z-10">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Verification Badges</h2>
            <p className="text-slate-600 text-lg">Build trust through verified credentials</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { badge: "🥉", level: "Bronze", desc: "50+ verified jobs, 4.5+ rating" },
              { badge: "🥈", level: "Silver", desc: "200+ verified jobs, 4.7+ rating" },
              { badge: "🥇", level: "Gold", desc: "500+ verified jobs, 4.9+ rating" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="p-8 text-center border-slate-200 hover:shadow-xl transition-all hover:border-blue-300 hover:scale-105 transform"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{item.badge}</div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{item.level}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by Users</h2>
            <p className="text-slate-600 text-lg">Real stories from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-8 border-slate-200 hover:shadow-xl transition-all hover:border-blue-300 hover:-translate-y-2"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {testimonial.badge}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of satisfied customers and providers</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-600 bg-transparent hover:border-blue-400"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-white">ServiceHub</span>
              </div>
              <p className="text-sm">Connecting verified professionals with customers</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Household
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Browse All
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2025 ServiceHub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-white transition">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Component Links Reference */}
      <div className="hidden">
        {/* Component showcase links from 21st.dev */}
        {/* https://21st.dev/community/components/serafim/gradient-button/default */}
        {/* https://21st.dev/community/components/aceternity/glowing-effect/default */}
        {/* https://21st.dev/community/components/victorwelander/expandable-tabs/default */}
        {/* https://21st.dev/easemize/spotlight-card/default */}
        {/* https://21st.dev/community/components/ravikatiyar/animated-shader-hero/default */}
        {/* https://21st.dev/community/components/aceternity/container-scroll-animation/default */}
      </div>
    </main>
  )
}
