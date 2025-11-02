"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ProviderSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    bio: "",
    serviceName: "",
    category: "",
    description: "",
    hourlyRate: "",
    basePrice: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/provider-signup")
        return
      }
      setUser(currentUser)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.serviceName || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Update profile
      const { error: profileError } = await supabase.from("profiles").update({ bio: formData.bio }).eq("id", user.id)

      if (profileError) throw profileError

      // Create service
      const { error: serviceError } = await supabase.from("services").insert({
        provider_id: user.id,
        service_name: formData.serviceName,
        category: formData.category,
        service_type: user.user_metadata?.service_type || "lvhf",
        description: formData.description,
        hourly_rate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
        base_price: formData.basePrice ? Number(formData.basePrice) : null,
        availability_status: "available",
      })

      if (serviceError) throw serviceError

      toast.success("Profile setup complete!")
      router.push("/provider/verification")
    } catch (error) {
      console.error("Setup error:", error)
      toast.error(error instanceof Error ? error.message : "Setup failed")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    )
  }

  const categories = [
    "plumbing",
    "electrical",
    "cleaning",
    "catering",
    "photography",
    "event-planning",
    "landscaping",
    "other",
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-slate-600 mb-8">Add your services and get verified to start accepting bookings</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="bio" className="text-sm font-semibold mb-2 block">
                Professional Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell customers about your experience and expertise..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Add Your First Service</h2>

              <div>
                <Label htmlFor="serviceName" className="text-sm font-semibold mb-2 block">
                  Service Name *
                </Label>
                <Input
                  id="serviceName"
                  required
                  placeholder="e.g., Residential Plumbing"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="category" className="text-sm font-semibold mb-2 block">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Label htmlFor="description" className="text-sm font-semibold mb-2 block">
                  Service Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in this service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="hourlyRate" className="text-sm font-semibold mb-2 block">
                    Hourly Rate ($)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice" className="text-sm font-semibold mb-2 block">
                    Base Price ($)
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {loading ? "Setting Up..." : "Continue to Verification"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
