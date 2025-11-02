"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, User, Mail, Lock, Phone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CustomerSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    password: "",
    confirmPassword: "",
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // For testing purposes, use signInWithPassword instead of signUp to bypass email verification
      // In production, switch back to signUp
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      
      // If this is a new user, create their profile
      if (error && error.message.includes("Invalid login credentials")) {
        // This is likely a new user, so create their account
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/customer/dashboard`,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: `${formData.countryCode}${formData.phone}`,
              user_type: "customer",
            },
          },
        })
        
        if (signUpError) throw signUpError;
        
        // Sign in immediately after signup (for testing only)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        if (signInError) throw signInError;
      }

      if (error && !error.message.includes("Invalid login credentials")) throw error

      toast.success("Signup successful!")
      router.push("/customer/home")
    } catch (error) {
      console.error("Signup error:", error)
      toast.error(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/auth/signup" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Account Options
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Customer Account</h1>
            <p className="text-slate-600">Join ServiceHub and book services from verified professionals</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-semibold mb-2 block">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-semibold mb-2 block">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Select 
                    value={formData.countryCode} 
                    onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1 (US)</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91 (India)</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61 (Australia)</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86 (China)</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49 (Germany)</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33 (France)</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81 (Japan)</SelectItem>
                      <SelectItem value="+55">🇧🇷 +55 (Brazil)</SelectItem>
                      <SelectItem value="+52">🇲🇽 +52 (Mexico)</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27 (South Africa)</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971 (UAE)</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65 (Singapore)</SelectItem>
                      <SelectItem value="+82">🇰🇷 +82 (South Korea)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-2/3">
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-semibold mb-2 block">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-slate-600 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Log in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  )
}