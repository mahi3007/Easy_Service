"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, ArrowLeft, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Dispute {
  id: string
  booking_id: string
  customer_id: string
  provider_id: string
  amount: number
  payment_status: string
  escrow_status: string
  created_at: string
  bookings: {
    service_id: string
    scheduled_date: string
    total_price: number
  }
  customer_profile: {
    first_name: string
    last_name: string
    email: string
  }
  provider_profile: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function DisputesPage() {
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("disputed")

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("payments")
          .select(
            `
            id,
            booking_id,
            customer_id,
            provider_id,
            amount,
            payment_status,
            escrow_status,
            created_at,
            bookings(service_id, scheduled_date, total_price),
            customer_profile:customer_id(first_name, last_name, email),
            provider_profile:provider_id(first_name, last_name, email)
          `,
          )
          .eq("payment_status", "disputed")
          .order("created_at", { ascending: false })

        if (error) throw error
        setDisputes(data || [])
      } catch (error) {
        console.error("Error fetching disputes:", error)
        toast.error("Failed to load disputes")
      } finally {
        setLoading(false)
      }
    }

    fetchDisputes()
  }, [])

  const handleRefund = async (disputeId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("payments")
        .update({
          payment_status: "refunded",
          escrow_status: "refunded",
        })
        .eq("id", disputeId)

      if (error) throw error

      setDisputes(disputes.filter((d) => d.id !== disputeId))
      toast.success("Refund processed")
    } catch (error) {
      console.error("Error processing refund:", error)
      toast.error("Failed to process refund")
    }
  }

  const handleResolve = async (disputeId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("payments")
        .update({
          payment_status: "completed",
          escrow_status: "released",
        })
        .eq("id", disputeId)

      if (error) throw error

      setDisputes(disputes.filter((d) => d.id !== disputeId))
      toast.success("Dispute resolved")
    } catch (error) {
      console.error("Error resolving dispute:", error)
      toast.error("Failed to resolve dispute")
    }
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
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Payment Disputes & Refunds</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disputed">Active Disputes ({disputes.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved (0)</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {disputes.length > 0 ? (
              disputes.map((dispute) => {
                const customer = dispute.customer_profile as any
                const provider = dispute.provider_profile as any

                return (
                  <Card key={dispute.id} className="p-6 border-l-4 border-l-red-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Dispute #{dispute.id.slice(0, 8)}</h3>
                        <p className="text-slate-600">Filed on {new Date(dispute.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Amount</p>
                        <p className="text-2xl font-bold text-red-600">${dispute.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Customer</p>
                        <p className="font-semibold text-slate-900">
                          {customer?.first_name} {customer?.last_name}
                        </p>
                        <p className="text-sm text-slate-600">{customer?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Provider</p>
                        <p className="font-semibold text-slate-900">
                          {provider?.first_name} {provider?.last_name}
                        </p>
                        <p className="text-sm text-slate-600">{provider?.email}</p>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-red-800">
                        <strong>Status:</strong> Payment held in escrow pending resolution
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleRefund(dispute.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Refund Customer
                      </Button>
                      <Button
                        onClick={() => handleResolve(dispute.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Release to Provider
                      </Button>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No active disputes</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
