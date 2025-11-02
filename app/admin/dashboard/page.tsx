"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Users, TrendingUp, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProviders: 0,
    verifiedProviders: 0,
    pendingVerifications: 0,
    totalDisputes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        // In a real app, you'd check if user is admin
        setUser(currentUser)

        // Fetch stats
        const { data: providers } = await supabase.from("profiles").select("id").eq("user_type", "provider")

        const { data: verifications } = await supabase.from("provider_verification").select("verification_status")

        const verified = verifications?.filter((v) => v.verification_status === "verified").length || 0
        const pending = verifications?.filter((v) => v.verification_status === "pending").length || 0

        setStats({
          totalProviders: providers?.length || 0,
          verifiedProviders: verified,
          pendingVerifications: pending,
          totalDisputes: 0,
        })
      } catch (error) {
        console.error("Error checking admin:", error)
        toast.error("Access denied")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage verifications, disputes, and platform operations</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Providers</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalProviders}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Verified</p>
                <p className="text-3xl font-bold text-green-600">{stats.verifiedProviders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Pending Verification</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingVerifications}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Active Disputes</p>
                <p className="text-3xl font-bold text-red-600">{stats.totalDisputes}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/verifications">
            <Card className="p-8 hover:shadow-lg transition cursor-pointer h-full">
              <CheckCircle className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Provider Verifications</h2>
              <p className="text-slate-600 mb-4">Review and approve provider applications</p>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                Manage Verifications
              </Button>
            </Card>
          </Link>

          <Link href="/admin/disputes">
            <Card className="p-8 hover:shadow-lg transition cursor-pointer h-full">
              <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Disputes & Refunds</h2>
              <p className="text-slate-600 mb-4">Handle payment disputes and refund requests</p>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                Manage Disputes
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
