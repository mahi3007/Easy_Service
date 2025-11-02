"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProviderVerification {
  id: string
  provider_id: string
  verification_status: string
  badge_level: string
  insurance_certificate_url: string
  background_check_completed: boolean
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  services: {
    service_name: string
    category: string
  }[]
}

export default function VerificationsPage() {
  const router = useRouter()
  const [verifications, setVerifications] = useState<ProviderVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("provider_verification")
          .select(
            `
            id,
            provider_id,
            verification_status,
            badge_level,
            insurance_certificate_url,
            background_check_completed,
            created_at,
            profiles:provider_id(first_name, last_name, email, phone),
            services:provider_id(service_name, category)
          `,
          )
          .order("created_at", { ascending: false })

        if (error) throw error
        setVerifications(data || [])
      } catch (error) {
        console.error("Error fetching verifications:", error)
        toast.error("Failed to load verifications")
      } finally {
        setLoading(false)
      }
    }

    fetchVerifications()
  }, [])

  const handleApprove = async (verificationId: string, providerId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("provider_verification")
        .update({
          verification_status: "verified",
          badge_level: "bronze",
          verification_date: new Date().toISOString(),
        })
        .eq("id", verificationId)

      if (error) throw error

      setVerifications(
        verifications.map((v) =>
          v.id === verificationId ? { ...v, verification_status: "verified", badge_level: "bronze" } : v,
        ),
      )

      toast.success("Provider approved!")
    } catch (error) {
      console.error("Error approving provider:", error)
      toast.error("Failed to approve provider")
    }
  }

  const handleReject = async (verificationId: string, reason: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("provider_verification")
        .update({
          verification_status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", verificationId)

      if (error) throw error

      setVerifications(verifications.filter((v) => v.id !== verificationId))

      toast.success("Provider rejected")
    } catch (error) {
      console.error("Error rejecting provider:", error)
      toast.error("Failed to reject provider")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const filteredVerifications = verifications.filter((v) => v.verification_status === activeTab)

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
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Provider Verifications</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({verifications.filter((v) => v.verification_status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({verifications.filter((v) => v.verification_status === "verified").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({verifications.filter((v) => v.verification_status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {filteredVerifications.length > 0 ? (
              filteredVerifications.map((verification) => {
                const profile = verification.profiles as any
                const services = verification.services as any[]

                return (
                  <Card key={verification.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {profile?.first_name} {profile?.last_name}
                        </h3>
                        <p className="text-slate-600">{profile?.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(verification.verification_status)}`}
                      >
                        {verification.verification_status.charAt(0).toUpperCase() +
                          verification.verification_status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-semibold text-slate-900">{profile?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Applied On</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(verification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {services && services.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-slate-600 mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {services.map((service, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {service.service_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {verification.verification_status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprove(verification.id, verification.provider_id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(verification.id, "Does not meet requirements")}
                            variant="outline"
                            className="flex-1 bg-transparent border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 text-center">
                <p className="text-slate-600">No {activeTab} verifications</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
