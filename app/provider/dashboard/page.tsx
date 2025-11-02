"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Settings, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ProviderDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/provider-signup")
          return
        }
        setUser(currentUser)

        // Fetch profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

        setProfile(profileData)

        // Fetch services
        const { data: servicesData } = await supabase.from("services").select("*").eq("provider_id", currentUser.id)

        setServices(servicesData || [])

        // Fetch verification status
        const { data: verificationData } = await supabase
          .from("provider_verification")
          .select("*")
          .eq("provider_id", currentUser.id)
          .single()

        setVerification(verificationData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Verified</span>
        )
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Pending</span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold">Not Verified</span>
        )
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Provider Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Welcome back, {profile?.first_name} {profile?.last_name}
            </p>
          </div>
          <Link href="/provider/settings">
            <Button variant="outline" className="bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Verification Status */}
        <Card className="p-6 mb-8 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Verification Status</h2>
              <p className="text-slate-600">
                {verification?.verification_status === "verified"
                  ? "Your profile is verified and you can accept bookings"
                  : "Complete verification to start accepting bookings"}
              </p>
            </div>
            <div>{getVerificationBadge(verification?.verification_status)}</div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Active Services</p>
                <p className="text-3xl font-bold text-slate-900">{services.length}</p>
              </div>
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-900">0</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Earnings</p>
                <p className="text-3xl font-bold text-slate-900">$0</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Services</h2>
            <Link href="/provider/services/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </Link>
          </div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-lg transition">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.service_name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {service.hourly_rate && <p>${service.hourly_rate}/hour</p>}
                      {service.base_price && <p>From ${service.base_price}</p>}
                    </div>
                    <Link href={`/provider/services/${service.id}`}>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-600 mb-4">No services yet. Add your first service to get started.</p>
              <Link href="/provider/services/new">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  Add Your First Service
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
