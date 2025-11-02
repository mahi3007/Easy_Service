"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Upload, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ProviderVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

      // Check verification status
      const { data: verificationData } = await supabase
        .from("provider_verification")
        .select("*")
        .eq("provider_id", currentUser.id)
        .single()

      setVerification(verificationData)
    }

    checkAuth()
  }, [router])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadedFile) {
      toast.error("Please select a file")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // In a real app, you'd upload to storage
      // For now, we'll just create the verification record
      if (verification) {
        const { error } = await supabase
          .from("provider_verification")
          .update({
            insurance_certificate_url: uploadedFile.name,
            background_check_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("provider_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("provider_verification").insert({
          provider_id: user.id,
          verification_status: "pending",
          insurance_certificate_url: uploadedFile.name,
          background_check_completed: true,
        })

        if (error) throw error
      }

      toast.success("Documents uploaded! Our team will review within 24 hours.")
      router.push("/provider/dashboard")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verification & Documents</h1>
          <p className="text-slate-600 mb-8">Upload required documents to get verified and start accepting bookings</p>

          {/* Verification Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">Profile Created</h3>
                <p className="text-sm text-slate-600">Your profile and first service have been added</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">Verification Pending</h3>
                <p className="text-sm text-slate-600">Upload insurance and background check documents</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-4 block">Insurance Certificate</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">
                  Drag and drop your insurance certificate or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="bg-transparent">
                    Choose File
                  </Button>
                </label>
                {uploadedFile && <p className="text-sm text-green-600 mt-2">Selected: {uploadedFile.name}</p>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>What we verify:</strong>
              </p>
              <ul className="text-sm text-slate-700 mt-2 space-y-1">
                <li>✓ Valid insurance coverage</li>
                <li>✓ Background check clearance</li>
                <li>✓ Professional credentials</li>
                <li>✓ Identity verification</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading || !uploadedFile}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit for Verification"}
            </Button>

            <p className="text-xs text-slate-600 text-center">
              You can add more services and update your profile after verification is complete.
            </p>
          </form>
        </Card>
      </div>
    </main>
  )
}
