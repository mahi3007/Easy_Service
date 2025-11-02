"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Navbar from "@/components/shared/Navbar"
import Sidebar from "@/components/shared/Sidebar"
import Footer from "@/components/shared/Footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, DollarSign, CheckCircle, AlertCircle, User, Phone, Mail, MapPin } from "lucide-react"

export default function ProviderHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)
  const [jobRequests, setJobRequests] = useState<any[]>([])
  const [earnings, setEarnings] = useState({
    total: 0,
    completed: 0,
    rating: 0,
  })

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
        
        // Fetch provider profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
        
        setProfile(profileData)
        
        // Fetch verification status
        const { data: verificationData } = await supabase
          .from("provider_verification")
          .select("*")
          .eq("provider_id", currentUser.id)
          .single()
        
        setVerification(verificationData)
        
        // Fetch job requests (bookings)
        const { data: bookings } = await supabase
          .from("bookings")
          .select(`
            id,
            scheduled_date,
            booking_status,
            total_price,
            notes,
            services:service_id (service_name),
            profiles:customer_id (first_name, last_name)
          `)
          .eq("provider_id", currentUser.id)
          .order("scheduled_date", { ascending: false })
          .limit(5)
        
        setJobRequests(bookings || [])
        
        // Calculate earnings
        const { data: completedBookings } = await supabase
          .from("bookings")
          .select("total_price")
          .eq("provider_id", currentUser.id)
          .eq("booking_status", "completed")
        
        const totalEarnings = completedBookings?.reduce((sum, booking) => sum + booking.total_price, 0) || 0
        
        // Get average rating
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("reviewee_id", currentUser.id)
          .eq("review_type", "provider")
        
        const avgRating = reviews?.length 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0
        
        setEarnings({
          total: totalEarnings,
          completed: completedBookings?.length || 0,
          rating: parseFloat(avgRating.toFixed(1)),
        })
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
      <Navbar userType="provider" />
      
      <div className="flex flex-1">
        <Sidebar userType="provider" />
        
        <main className="flex-1 bg-slate-50 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
            <p className="text-slate-600">Manage your services and job requests</p>
          </div>
          
          {/* My Profile */}
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">My Profile</h2>
            <Card>
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col items-center justify-center border-b p-6 md:w-1/3 md:border-b-0 md:border-r">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt={`${profile?.first_name} ${profile?.last_name}`} />
                    <AvatarFallback>
                      {profile?.first_name?.charAt(0)}
                      {profile?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-xl font-semibold">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{earnings.rating || "No ratings"}</span>
                  </div>
                  {verification?.verification_status === "verified" ? (
                    <Badge className="mt-2" variant="success">
                      <CheckCircle className="mr-1 h-3 w-3" /> Verified Provider
                    </Badge>
                  ) : verification?.verification_status === "pending" ? (
                    <Badge className="mt-2" variant="warning">
                      <Clock className="mr-1 h-3 w-3" /> Verification Pending
                    </Badge>
                  ) : (
                    <Badge className="mt-2" variant="outline">
                      <AlertCircle className="mr-1 h-3 w-3" /> Not Verified
                    </Badge>
                  )}
                  <Button className="mt-4" onClick={() => router.push("/provider/profile")}>
                    Edit Profile
                  </Button>
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Contact Information</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{profile?.phone || "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Service Type</h4>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-sm">
                          {user?.user_metadata?.service_type || "General Services"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-slate-500">Bio</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile?.bio || "No bio provided. Add a professional bio to attract more customers."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
          
          {/* Job Requests */}
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Job Requests</h2>
            <div className="space-y-4">
              {jobRequests.length > 0 ? (
                jobRequests.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full p-4 md:w-3/4">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">{job.services?.service_name}</h3>
                          <Badge variant={getStatusVariant(job.booking_status)}>
                            {job.booking_status}
                          </Badge>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-4 w-4" />
                          <span>Customer: {job.profiles?.first_name} {job.profiles?.last_name}</span>
                        </div>
                        {job.notes && (
                          <div className="mt-2 text-sm text-slate-600">
                            <p className="line-clamp-2">{job.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex w-full items-center justify-between border-t bg-slate-50 p-4 md:w-1/4 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${job.total_price}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/provider/jobs/${job.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">You don't have any job requests yet</p>
                </Card>
              )}
            </div>
          </section>
          
          {/* Earnings Summary */}
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Earnings Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">${earnings.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Completed Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{earnings.completed}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{earnings.rating || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
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